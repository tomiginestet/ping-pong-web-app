# 🏓 Ping Pong Club

Una pequeña app web para llevar los puntajes, rankings y torneos de ping pong entre amigos.

## Qué hace

- **Jugadores**: creá jugadores con nombre, avatar (ícono) y color (no hace falta registrarse).
- **Partido rápido** (singles o dobles): elegí los jugadores y las reglas:
  - a cuántos puntos se gana cada juego (2, 4, 11, 21 o cualquier número),
  - al mejor de cuántos juegos (1, 3, 5, 10…; con número par puede haber empate),
  - si hay que ganar por 2 de diferencia,
  - cuántos saques por turno.
- **Marcador en pantalla completa**: tocá tu mitad de la pantalla para sumar un punto.
  Muestra quién saca, punto de juego/partido, juegos ganados; se puede deshacer y cambiar de lado.
  Funciona en vertical (arriba/abajo) y horizontal (izquierda/derecha). En la compu: ← / → suman y Backspace deshace.
- **Torneos**: liga (todos contra todos, opcional ida y vuelta) o eliminación directa (con BYEs automáticos).
- **Ranking con ELO**, niveles (de Pelotita a Leyenda), rachas, logros desbloqueables, cara a cara e historial.
- **Dobles**: cada integrante usa el ELO promedio de su pareja; gana o pierde lo mismo que su compañero.
- **Clubes sincronizados** (arriba a la derecha en Inicio): un grupo de amigos comparte jugadores, partidos,
  torneos y ranking entre todos sus celulares. Se entra con un link de invitación, sin cuentas.
  Los partidos se ven en vivo punto a punto.
- **Copia de seguridad**: exportar/importar todos los datos en JSON (Ranking → Ajustes).

## Cómo se guardan los datos

La app funciona offline: todo se guarda en el navegador (localStorage). Si el dispositivo está en un club,
cada cambio se sube a Supabase y se bajan los cambios de los demás (al abrir la app, con un aviso en tiempo real,
al volver a la pestaña y cada 30 segundos). Por cada jugador/partido/torneo gana la modificación más reciente.

En Supabase hay dos tablas (`clubs` y `entities`) con RLS activado y **sin políticas**: la clave pública no puede
leerlas ni escribirlas directamente. Todo pasa por funciones (`create_club`, `get_club`, `pull_changes`,
`push_changes`) que exigen el código secreto del club. Ver `supabase/migrations/`.

## Configuración

Copiá `.env.example` a `.env.local` con la URL y la clave pública (publishable) del proyecto de Supabase.
Sin esas variables la app funciona igual, sólo con datos locales. En Vercel se cargan como variables de entorno
(`VITE_SUPABASE_URL` y `VITE_SUPABASE_KEY`).

## Desarrollo

```bash
npm install
npm run dev      # servidor de desarrollo
npm test         # tests de la lógica de puntaje, ELO y torneos
npm run lint
npm run build    # genera dist/ (se puede publicar en cualquier hosting estático)
```

Stack: React + TypeScript + Vite, React Router (HashRouter), Vitest.
