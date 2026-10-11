-- Sincronización de datos de Ping Pong Club.
--
-- Modelo: cada grupo de amigos es un "club" identificado por un código secreto
-- que se comparte por link. No hay usuarios: quien tiene el código puede leer y
-- escribir los datos del club.
--
-- Las tablas tienen RLS activado y NINGUNA política, así que la clave pública
-- (anon/publishable) no puede leerlas ni escribirlas directamente. Todo el
-- acceso pasa por las funciones de abajo, que exigen el código del club.

create table public.clubs (
  code text primary key,
  name text not null check (char_length(name) between 1 and 60),
  created_at timestamptz not null default now()
);

-- Una fila por jugador / partido / torneo. `v` es la versión que asigna el
-- cliente (ms desde epoch); gana la escritura con la versión más alta.
create table public.entities (
  club_code text not null references public.clubs (code) on delete cascade,
  kind text not null check (kind in ('player', 'match', 'tournament')),
  id text not null check (char_length(id) between 1 and 64),
  data jsonb,
  deleted boolean not null default false,
  v bigint not null,
  updated_at timestamptz not null default clock_timestamp(),
  primary key (club_code, kind, id)
);

create index entities_club_updated_idx on public.entities (club_code, updated_at);

alter table public.clubs enable row level security;
alter table public.entities enable row level security;

-- Crea un club y devuelve su código.
create function public.create_club(p_name text)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  alphabet constant text := 'abcdefghjkmnpqrstuvwxyz23456789';
  bytes bytea;
  new_code text;
begin
  if p_name is null or char_length(trim(p_name)) = 0 then
    raise exception 'Nombre inválido';
  end if;
  loop
    bytes := extensions.gen_random_bytes(12);
    new_code := '';
    for i in 0..11 loop
      new_code := new_code || substr(alphabet, (get_byte(bytes, i) % char_length(alphabet)) + 1, 1);
    end loop;
    exit when not exists (select 1 from public.clubs c where c.code = new_code);
  end loop;
  insert into public.clubs (code, name) values (new_code, left(trim(p_name), 60));
  return new_code;
end;
$$;

-- Devuelve el nombre del club (o null si el código no existe).
create function public.get_club(p_code text)
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select c.name from public.clubs c where c.code = p_code;
$$;

-- Cambios del club posteriores a `p_since` (null = todo).
create function public.pull_changes(p_code text, p_since timestamptz default null)
returns table (kind text, id text, data jsonb, deleted boolean, v bigint, updated_at timestamptz)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not exists (select 1 from public.clubs c where c.code = p_code) then
    raise exception 'Club inexistente';
  end if;
  return query
    select e.kind, e.id, e.data, e.deleted, e.v, e.updated_at
    from public.entities e
    where e.club_code = p_code
      and (p_since is null or e.updated_at > p_since)
    order by e.updated_at;
end;
$$;

-- Sube cambios: [{kind, id, data, deleted, v}, ...]. Gana la versión más alta.
create function public.push_changes(p_code text, p_items jsonb)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  applied integer;
begin
  if not exists (select 1 from public.clubs c where c.code = p_code) then
    raise exception 'Club inexistente';
  end if;
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) > 1000 then
    raise exception 'Lote inválido';
  end if;
  if exists (select 1 from jsonb_array_elements(p_items) it where pg_column_size(it) > 200000) then
    raise exception 'Elemento demasiado grande';
  end if;

  insert into public.entities as e (club_code, kind, id, data, deleted, v, updated_at)
  select p_code,
         it ->> 'kind',
         it ->> 'id',
         case when coalesce((it ->> 'deleted')::boolean, false) then null else it -> 'data' end,
         coalesce((it ->> 'deleted')::boolean, false),
         (it ->> 'v')::bigint,
         clock_timestamp()
  from jsonb_array_elements(p_items) it
  on conflict (club_code, kind, id) do update
    set data = excluded.data,
        deleted = excluded.deleted,
        v = excluded.v,
        updated_at = clock_timestamp()
    where e.v < excluded.v;

  get diagnostics applied = row_count;
  return applied;
end;
$$;

revoke all on function public.create_club(text) from public;
revoke all on function public.get_club(text) from public;
revoke all on function public.pull_changes(text, timestamptz) from public;
revoke all on function public.push_changes(text, jsonb) from public;
grant execute on function public.create_club(text) to anon, authenticated;
grant execute on function public.get_club(text) to anon, authenticated;
grant execute on function public.pull_changes(text, timestamptz) to anon, authenticated;
grant execute on function public.push_changes(text, jsonb) to anon, authenticated;
