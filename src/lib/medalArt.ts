// Ilustraciones de las medallas de logros, dibujadas a mano en SVG.
// Cada ilustración es una función que devuelve el contenido del hexágono
// (coordenadas en un lienzo de 120×130). `medalSvg` le agrega el marco del nivel.

const D = '#2B1B12';
const f = (n: number) => +n.toFixed(1);
const ball = (cx: number, cy: number, r: number) =>
  `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#E7D7C3"/>` +
  `<circle cx="${f(cx - r * .1)}" cy="${f(cy - r * .1)}" r="${f(r * .88)}" fill="#FFFBF4"/>` +
  `<ellipse cx="${f(cx - r * .38)}" cy="${f(cy - r * .42)}" rx="${f(r * .2)}" ry="${f(r * .12)}" fill="#fff" transform="rotate(-35 ${f(cx - r * .38)} ${f(cy - r * .42)})"/>` +
  `<circle class="m-ol" cx="${cx}" cy="${cy}" r="${r}" fill="none"/>`;
const starPts = (cx: number, cy: number, R: number, r = R * .48, n = 5, rot = -90) => {
  const p: string[] = [];
  for (let i = 0; i < n * 2; i++) {
    const a = (rot + i * 180 / n) * Math.PI / 180, rr = i % 2 ? r : R;
    p.push(f(cx + rr * Math.cos(a)) + ',' + f(cy + rr * Math.sin(a)));
  }
  return p.join(' ');
};
const star = (cx: number, cy: number, R: number, fill: string, sw = 2, r?: number) => `<polygon class="m-ol" style="stroke-width:${sw}" points="${starPts(cx, cy, R, r)}" fill="${fill}"/>`;
const heart = (cx: number, cy: number, s: number, fill: string, sw = 2) =>
  `<path class="m-ol" style="stroke-width:${sw}" fill="${fill}" d="M${cx} ${f(cy + s * .9)} C${f(cx - s * 1.4)} ${f(cy + s * .1)} ${f(cx - s)} ${f(cy - s)} ${cx} ${f(cy - s * .35)} C${f(cx + s)} ${f(cy - s)} ${f(cx + s * 1.4)} ${f(cy + s * .1)} ${cx} ${f(cy + s * .9)}Z"/>`;
const stick = (d: string, color: string, w = 3.5) =>
  `<path d="${d}" fill="none" stroke="${D}" stroke-width="${w + 3.6}" stroke-linecap="round" stroke-linejoin="round"/>` +
  `<path d="${d}" fill="none" stroke="${color}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
const flameSmall = (x: number, y: number, s = 1) =>
  `<path class="m-ol" style="stroke-width:2" transform="translate(${x} ${y}) scale(${s})" d="M0 0 C-5 -4 -2 -9 0 -13 C1 -9 5 -7 4 -2 C3 0 2 1 0 0Z" fill="#FF922B"/>`;
const t = (x: number, y: number, s: number, txt: string, fill: string, extra = '') =>
  `<text x="${x}" y="${y}" font-family="Lilita One, Arial Rounded MT Bold, sans-serif" font-size="${s}" fill="${fill}" text-anchor="middle" ${extra}>${txt}</text>`;
const wavyRing = (cx: number, cy: number, R: number, amp: number, k: number, rIn: number) => {
  let d = '';
  for (let i = 0; i <= 72; i++) {
    const a = i / 72 * Math.PI * 2, rr = R + amp * Math.sin(a * k);
    d += (i ? 'L' : 'M') + f(cx + rr * Math.cos(a)) + ' ' + f(cy + rr * Math.sin(a)) + ' ';
  }
  return d + `Z M${cx - rIn} ${cy} a${rIn} ${rIn} 0 1 0 ${rIn * 2} 0 a${rIn} ${rIn} 0 1 0 ${-rIn * 2} 0Z`;
};

const LIB: { opts: { name: string; icon: (u: number) => string }[] }[] = [
{ opts: [
  { name: 'Primera sangre',
    icon: () => ball(60, 62, 25) +
      `<g transform="rotate(-38 60 62)"><rect class="m-ol" x="31" y="54" width="58" height="16" rx="8" fill="#F4BE8F"/><rect x="51" y="56.5" width="18" height="11" rx="2" fill="#E6A06B"/><circle cx="38" cy="62" r="1.3" fill="#C9824F"/><circle cx="82" cy="62" r="1.3" fill="#C9824F"/></g>` +
      `<g transform="rotate(38 60 62)"><rect class="m-ol" x="31" y="54" width="58" height="16" rx="8" fill="#F7C99F"/><rect x="51" y="56.5" width="18" height="11" rx="2" fill="#E6A06B"/><circle cx="38" cy="62" r="1.3" fill="#C9824F"/><circle cx="82" cy="62" r="1.3" fill="#C9824F"/></g>` +
      `<path class="m-ol" d="M84 26 C88 33 91 37 91 41 A7 7 0 0 1 77 41 C77 37 80 33 84 26Z" fill="#E5383B"/><ellipse cx="81.5" cy="39" rx="1.6" ry="2.6" fill="#fff" opacity=".8"/>` },
  { name: 'Conde Pelotula',
    icon: () => `<path class="m-ol" d="M34 46 L24 92 L52 82Z" fill="#B5172E"/><path class="m-ol" d="M86 46 L96 92 L68 82Z" fill="#B5172E"/>` +
      ball(60, 58, 28) +
      `<path class="m-ol" d="M33 50 C32 34 46 26 60 38 C74 26 88 34 87 50 C80 42 70 40 60 46 C50 40 40 42 33 50Z" fill="${D}"/>` +
      `<ellipse cx="50" cy="54" rx="3.2" ry="4.2" fill="${D}"/><ellipse cx="70" cy="54" rx="3.2" ry="4.2" fill="${D}"/><circle cx="51" cy="52.5" r="1.2" fill="#fff"/><circle cx="71" cy="52.5" r="1.2" fill="#fff"/>` +
      `<circle cx="43" cy="63" r="4" fill="#FF8FA3" opacity=".7"/><circle cx="77" cy="63" r="4" fill="#FF8FA3" opacity=".7"/>` +
      `<path class="m-ol" d="M49 65 Q60 72 71 65" fill="none"/>` +
      `<path class="m-ol" style="stroke-width:2" d="M52.5 67.2 L55 75 L57.5 69.2Z" fill="#fff"/><path class="m-ol" style="stroke-width:2" d="M62.5 69.2 L65 75 L67.5 67.2Z" fill="#fff"/>` +
      `<path class="m-ol" style="stroke-width:1.8" d="M65 78 C67 81 68 83 68 84.5 A3 3 0 0 1 62 84.5 C62 83 63 81 65 78Z" fill="#E5383B"/>` },
  { name: 'Chau chupete',
    icon: () => `<circle cx="60" cy="86" r="12" fill="none" stroke="${D}" stroke-width="9"/><circle cx="60" cy="86" r="12" fill="none" stroke="#4DABF7" stroke-width="4.5"/>` +
      `<path class="m-ol" d="M51 66 C48 46 52 30 60 30 C68 30 72 46 69 66Z" fill="#FFE8B0"/>` +
      `<path class="m-ol" style="stroke-width:2.2" d="M58 33 L63 40 L57 46 L63 53" fill="none"/>` +
      `<path class="m-ol" d="M30 66 C30 58 46 56 60 56 C74 56 90 58 90 66 C90 76 74 78 60 78 C46 78 30 76 30 66Z" fill="#FF8FB1"/>` +
      `<circle class="m-ol" style="stroke-width:2" cx="41" cy="67" r="3" fill="#FFE3EC"/><circle class="m-ol" style="stroke-width:2" cx="79" cy="67" r="3" fill="#FFE3EC"/>` +
      `<rect class="m-ol" x="54" y="72" width="12" height="8" rx="3" fill="#E64980"/>` +
      `<path class="m-ol" style="stroke-width:2.4" d="M31 36 L37 41 M29 47 L36 48 M89 36 L83 41 M91 47 L84 48" fill="none"/>` },
]},
{ opts: [
  { name: 'On fire',
    icon: () => `<path class="m-ol" d="M60 16 C64 28 76 30 80 42 C84 30 82 26 80 22 C90 30 94 44 92 56 C90 74 76 86 60 86 C44 86 30 74 28 56 C27 46 32 36 38 30 C38 36 40 40 44 42 C46 30 52 24 60 16Z" fill="#FF6B1A"/>` +
      `<path d="M60 34 C63 42 70 44 72 52 C74 46 74 44 73 40 C79 46 80 54 79 60 C77 72 70 80 60 80 C50 80 43 72 41 62 C40 54 44 48 48 44 C48 48 50 51 52 52 C53 44 56 40 60 34Z" fill="#FFD43B"/>` +
      ball(60, 70, 16) +
      `<circle cx="54.5" cy="70" r="2" fill="${D}"/><circle cx="65.5" cy="70" r="2" fill="${D}"/><path class="m-ol" style="stroke-width:2.4" d="M50 64 L57 66.5 M70 64 L63 66.5" fill="none"/><path class="m-ol" style="stroke-width:2.2" d="M55 76 Q60 79.5 65 76" fill="none"/>` },
  { name: 'Está que arde',
    icon: () => `<path class="m-ol" style="stroke-width:4" d="M34 66 L28 92 M86 66 L92 92" fill="none"/>` +
      flameSmall(44, 86) + flameSmall(60, 88, 1.2) + flameSmall(76, 86) +
      `<rect class="m-ol" x="22" y="60" width="76" height="8" rx="3" fill="#495057"/><path d="M32 61.5V66.5M42 61.5V66.5M52 61.5V66.5M62 61.5V66.5M72 61.5V66.5M82 61.5V66.5M92 61.5V66.5" stroke="#868E96" stroke-width="1.6"/>` +
      `<rect class="m-ol" x="26" y="47" width="32" height="13" rx="6.5" fill="#B8452E"/><rect class="m-ol" x="62" y="47" width="32" height="13" rx="6.5" fill="#B8452E"/><rect class="m-ol" x="42" y="34" width="36" height="13" rx="6.5" fill="#C4532F"/>` +
      `<path d="M34 50l3 7M42 50l3 7M50 50l3 7M70 50l3 7M78 50l3 7M86 50l3 7M50 37l3 7M58 37l3 7M66 37l3 7" stroke="#6E2412" stroke-width="2" stroke-linecap="round"/>` +
      `<path d="M52 30 C49 26 55 24 52 20 M68 30 C65 26 71 24 68 20" fill="none" stroke="#ADB5BD" stroke-width="2.5" stroke-linecap="round"/>` },
  { name: 'Se pasó el agua',
    icon: () => `<path d="M42 48 C42 28 78 28 78 48" fill="none" stroke="${D}" stroke-width="5" stroke-linecap="round"/>` +
      `<path class="m-ol" d="M40 62 L27 48 C25 46 22 48 23 51 L34 72Z" fill="#B8C2CF"/>` +
      `<path class="m-ol" d="M36 84 L39 56 C40 46 80 46 81 56 L84 84Z" fill="#DEE2E6"/>` +
      `<path d="M45 58 L43 78" stroke="#fff" stroke-width="3.5" stroke-linecap="round"/>` +
      `<ellipse class="m-ol" cx="60" cy="48" rx="17" ry="5" fill="#C3CAD5"/><circle class="m-ol" cx="60" cy="42" r="3.5" fill="#495057"/>` +
      `<rect class="m-ol" x="33" y="82" width="54" height="7" rx="3.5" fill="#868E96"/>` +
      `<path d="M31 44 C28 40 34 38 31 34 M38 40 C35 36 41 34 38 30" fill="none" stroke="#4DABF7" stroke-width="3" stroke-linecap="round"/>` +
      t(84, 42, 11, '¡fiu!', '#E8590C', 'transform="rotate(12 84 42)"') },
]},
{ opts: [
  { name: 'Imparable',
    icon: () => `<path class="m-ol" d="M50 50 C46 40 52 34 60 36 C68 34 74 40 70 50Z" fill="#FF922B"/>` +
      ball(60, 28, 8) + ball(42, 36, 6) + ball(78, 36, 6) +
      `<path class="m-ol" d="M14 104 L44 50 L52 54 L60 48 L68 54 L76 50 L106 104Z" fill="#8C5A3C"/><path d="M60 48 L68 54 L76 50 L106 104 L72 104Z" fill="#000" opacity=".12"/>` +
      `<path class="m-ol" d="M44 50 L52 54 L60 48 L68 54 L76 50 L73 58 C71 64 68 60 67 64 C66 72 61 70 60 64 C58 70 54 70 53 62 C51 66 47 64 48 58Z" fill="#FF5A1F"/>` +
      `<circle cx="34" cy="46" r="2.5" fill="#FF5A1F"/><circle cx="86" cy="48" r="2.5" fill="#FF5A1F"/>` },
  { name: 'Colectivo sin frenos',
    icon: () => `<rect class="m-ol" x="34" y="28" width="52" height="58" rx="9" fill="#E03131"/>` +
      `<rect x="41" y="32" width="38" height="10" rx="2" fill="#212529"/>` + t(60, 39.6, 6.6, 'IMPARABLE', '#FFB400', 'letter-spacing=".3"') +
      `<rect class="m-ol" x="39" y="45" width="42" height="20" rx="3" fill="#A5D8FF"/><path class="m-ol" d="M60 45 V65" fill="none"/><path d="M43 49 L49 49 M43 53 L46 53" stroke="#fff" stroke-width="2" stroke-linecap="round"/>` +
      `<rect x="34" y="68" width="52" height="5" fill="#FFD43B"/><path d="M38 70.5 q3 -3 6 0 t6 0 t6 0 t6 0 t6 0 t6 0 t6 0" stroke="#2F9E44" stroke-width="1.4" fill="none"/>` +
      `<circle class="m-ol" cx="42" cy="79" r="4.5" fill="#FFF3BF"/><circle class="m-ol" cx="78" cy="79" r="4.5" fill="#FFF3BF"/><rect class="m-ol" x="52" y="76" width="16" height="6" rx="2" fill="#C92A2A"/>` +
      `<rect class="m-ol" x="32" y="84" width="56" height="6" rx="3" fill="#343A40"/>` },
  { name: 'Modo Saiyan',
    icon: () => `<path class="m-ol" d="M36 62 L28 44 L40 46 L38 28 L50 38 L58 23 L66 36 L78 25 L80 42 L92 40 L84 62Z" fill="#FFD60A"/>` +
      ball(60, 68, 23) +
      `<path class="m-ol" d="M36 62 C42 50 50 46 60 47 C70 46 78 50 84 62 C76 56 70 54 60 55 C50 54 44 56 36 62Z" fill="#FFD60A"/>` +
      `<ellipse class="m-ol" style="stroke-width:2" cx="51" cy="68" rx="4.5" ry="3.2" fill="#fff"/><ellipse class="m-ol" style="stroke-width:2" cx="69" cy="68" rx="4.5" ry="3.2" fill="#fff"/><circle cx="52" cy="68" r="1.8" fill="#12B886"/><circle cx="68" cy="68" r="1.8" fill="#12B886"/>` +
      `<path class="m-ol" style="stroke-width:3.4" d="M44 60 L56 64 M76 60 L64 64" fill="none"/><path class="m-ol" d="M54 79 L66 79" fill="none"/>` +
      `<path d="M28 72 L24 78 L29 79 L25 86 M92 72 L96 78 L91 79 L95 86" fill="none" stroke="#FAB005" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>` },
]},
{ opts: [
  { name: 'D10S',
    icon: u => {
      const j = 'M40 40 L51 36 C54 42 66 42 69 36 L80 40 L92 52 L84 61 L80 57 L80 92 L40 92 L40 57 L36 61 L28 52Z';
      return `<defs><clipPath id="j${u}"><path d="${j}"/></clipPath></defs>` +
        `<ellipse cx="60" cy="27" rx="17" ry="5" fill="none" stroke="${D}" stroke-width="8"/><ellipse cx="60" cy="27" rx="17" ry="5" fill="none" stroke="#FFD43B" stroke-width="4"/>` +
        `<path d="${j}" fill="#fff"/><g clip-path="url(#j${u})" fill="#74ACDF"><rect x="33" y="30" width="6.5" height="70"/><rect x="45" y="30" width="6.5" height="70"/><rect x="57" y="30" width="6.5" height="70"/><rect x="69" y="30" width="6.5" height="70"/><rect x="81" y="30" width="6.5" height="70"/></g>` +
        `<path class="m-ol" d="${j}" fill="none"/><path class="m-ol" d="M51 36 C54 42 66 42 69 36" fill="none"/>` +
        t(60, 80, 22, '10', '#1C2C5B', 'stroke="#fff" stroke-width="3.5" paint-order="stroke"') +
        star(28, 32, 4, '#FFD43B', 1.6) + star(92, 30, 3.5, '#FFD43B', 1.6);
    } },
  { name: 'La tercera',
    icon: u => {
      const s = 'M60 42 L82 48 L81 69 C80 81 70 89 60 93 C50 89 40 81 39 69 L38 48Z';
      let leaves = '';
      for (let i = 0; i < 5; i++) {
        const deg = 112 + i * 20, a = deg * Math.PI / 180, x = f(60 + 31 * Math.cos(a)), y = f(66 + 31 * Math.sin(a));
        leaves += `<ellipse class="m-ol" style="stroke-width:1.6" cx="${x}" cy="${y}" rx="3" ry="6.5" fill="#40C057" transform="rotate(${deg} ${x} ${y})"/>`;
        leaves += `<ellipse class="m-ol" style="stroke-width:1.6" cx="${f(120 - x)}" cy="${y}" rx="3" ry="6.5" fill="#40C057" transform="rotate(${-deg} ${f(120 - x)} ${y})"/>`;
      }
      return leaves + `<defs><clipPath id="s${u}"><path d="${s}"/></clipPath></defs><path d="${s}" fill="#74ACDF"/><rect clip-path="url(#s${u})" x="30" y="58" width="60" height="13" fill="#fff"/>` +
        `<circle class="m-ol" style="stroke-width:1.6" cx="60" cy="64.5" r="4.2" fill="#F5B800"/><path class="m-ol" d="${s}" fill="none"/>` +
        star(42, 37, 7, '#FFD43B') + star(60, 30, 8, '#FFD43B') + star(78, 37, 7, '#FFD43B');
    } },
  { name: 'Barrilete cósmico',
    icon: () => `<path d="M60 88 C66 94 72 90 78 96" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/><path class="m-ol" style="stroke-width:1.6" d="M64 89 L70 87 L68 94Z M73 92 L79 90 L78 97Z" fill="#FFD43B"/>` +
      `<path d="M60 22 L84 52 L60 88 L36 52Z" fill="#74ACDF"/><path d="M60 22 L84 52 L60 52Z M36 52 L60 52 L60 88Z" fill="#fff"/>` +
      `<path d="M60 22 V88 M36 52 H84" stroke="${D}" stroke-width="2" fill="none"/><path class="m-ol" d="M60 22 L84 52 L60 88 L36 52Z" fill="none"/>` +
      star(33, 34, 5, '#FFD43B', 1.8) + star(88, 32, 4, '#FFD43B', 1.6) + star(90, 72, 3.5, '#FFD43B', 1.4) +
      `<circle cx="30" cy="66" r="1.4" fill="#fff"/><circle cx="44" cy="28" r="1.2" fill="#fff"/><circle cx="80" cy="82" r="1.2" fill="#fff"/><circle cx="26" cy="50" r="1" fill="#fff"/>` },
]},
{ opts: [
  { name: 'Pastelito',
    icon: () => `<rect class="m-ol" x="37" y="35" width="46" height="46" rx="6" fill="#E8A54B" transform="rotate(45 60 58)"/>` +
      `<rect class="m-ol" x="39" y="37" width="42" height="42" rx="6" fill="#F2BC63"/>` +
      `<path d="M60 58 L42 40 M60 58 L78 40 M60 58 L42 76 M60 58 L78 76" stroke="#C9852E" stroke-width="2" stroke-linecap="round"/>` +
      `<circle class="m-ol" cx="60" cy="58" r="10" fill="#C2255C"/><ellipse cx="56.5" cy="54.5" rx="3" ry="2" fill="#fff" opacity=".7"/>` +
      ([[46, 46], [74, 48], [70, 72], [48, 70], [35, 58], [85, 60], [60, 31], [60, 85], [52, 41], [68, 77]] as const).map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.6" fill="#fff"/>`).join('') },
  { name: 'Zapatero',
    icon: () => `<g transform="translate(60 72) scale(.86) translate(-60 -72)"><path class="m-ol" d="M24 76 C24 64 30 58 38 58 L48 60 C54 61 57 66 64 68 L86 72 C94 74 97 79 96 84 L24 84Z" fill="#8B4A2B"/>` +
      `<rect class="m-ol" x="22" y="82" width="76" height="7" rx="3.5" fill="#3A2418"/><path d="M40 62 L46 66 M43 59 L50 64 M37 66 L42 69" stroke="#fff" stroke-width="2" stroke-linecap="round"/><path d="M80 75 C86 75 90 77 92 80" stroke="#fff" stroke-width="2.2" fill="none" stroke-linecap="round" opacity=".6"/></g>` +
      `<path d="M46 60 C50 50 58 44 64 43" fill="none" stroke="${D}" stroke-width="2"/>` +
      `<circle class="m-ol" cx="72" cy="40" r="10" fill="#FFE066"/><circle class="m-ol" style="stroke-width:1.6" cx="65.5" cy="36" r="1.6" fill="#fff"/>` + t(73, 45.5, 15, '0', D) },
  { name: 'Rosca',
    icon: () => {
      let spr = '';
      const cs = ['#FFD43B', '#4DABF7', '#fff', '#69DB7C', '#845EF7'];
      for (let i = 0; i < 12; i++) {
        const a = i / 12 * Math.PI * 2 + .3, r = 17 + (i % 2) * 2.5, x = 60 + r * Math.cos(a), y = 60 + r * Math.sin(a);
        spr += `<rect x="${f(x - 2.6)}" y="${f(y - 1)}" width="5.2" height="2" rx="1" fill="${cs[i % 5]}" transform="rotate(${(i * 47) % 180} ${f(x)} ${f(y)})"/>`;
      }
      return `<path class="m-ol" fill-rule="evenodd" fill="#E0A458" d="M33 60 a27 27 0 1 0 54 0 a27 27 0 1 0 -54 0Z M51 60 a9 9 0 1 0 18 0 a9 9 0 1 0 -18 0Z"/>` +
        `<path class="m-ol" style="stroke-width:2" fill-rule="evenodd" fill="#F783AC" d="${wavyRing(60, 59, 22.5, 2.2, 8, 11)}"/>` + spr +
        `<path d="M44 46 A20 20 0 0 1 56 39" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".75"/>`;
    } },
]},
{ opts: [
  { name: 'Ave Fénix',
    icon: () => {
      const w = 'M58 64 C44 62 30 54 24 38 C33 42 38 42 44 46 C40 38 41 32 38 26 C48 32 55 44 60 56Z';
      return `<path class="m-ol" d="${w}" fill="#FF7A1A"/><path class="m-ol" d="${w}" fill="#FF7A1A" transform="translate(120 0) scale(-1 1)"/>` +
        `<path d="M54 58 C44 54 36 48 32 42 M54 52 C48 46 46 40 44 34" stroke="#FFD43B" stroke-width="2.2" fill="none" stroke-linecap="round"/><path d="M66 58 C76 54 84 48 88 42 M66 52 C72 46 74 40 76 34" stroke="#FFD43B" stroke-width="2.2" fill="none" stroke-linecap="round"/>` +
        `<path class="m-ol" d="M54 78 C49 88 55 91 60 97 C65 91 71 88 66 78Z" fill="#E03131"/>` +
        `<path class="m-ol" d="M60 42 C69 50 71 62 67 74 L60 84 L53 74 C49 62 51 50 60 42Z" fill="#FFD43B"/>` +
        `<path class="m-ol" style="stroke-width:2" d="M55 32 C53 27 56 25 57 23 C58 27 60 28 60 30 C61 27 63 26 64 24 C65 28 66 30 64 32Z" fill="#FF7A1A"/>` +
        `<circle class="m-ol" cx="60" cy="38" r="7.5" fill="#FFD43B"/><circle cx="57.5" cy="37" r="1.4" fill="${D}"/><circle cx="62.5" cy="37" r="1.4" fill="${D}"/><path class="m-ol" style="stroke-width:1.5" d="M58 40.5 L60 44 L62 40.5Z" fill="#F59F00"/>` +
        `<circle cx="44" cy="90" r="1.8" fill="#FF922B"/><circle cx="78" cy="88" r="1.5" fill="#FF922B"/><circle cx="70" cy="96" r="1.2" fill="#FF922B"/>`;
    } },
  { name: 'Volví del más allá',
    icon: () => `<path class="m-ol" d="M66 92 L66 50 C66 38 92 38 92 50 L92 92Z" fill="#ADB5BD"/>` + t(79, 62, 8.5, 'RIP', '#495057') +
      `<path d="M71 70 H87 M71 76 H84" stroke="#868E96" stroke-width="2" stroke-linecap="round"/>` +
      `<circle class="m-ol" cx="44" cy="36" r="13" fill="#E03131"/><circle cx="44" cy="36" r="9.5" fill="#C92A2A"/><rect class="m-ol" x="41" y="46" width="6" height="14" rx="2" fill="#D9A066"/>` +
      `<path class="m-ol" d="M38 92 L40 64 L52 64 L54 92Z" fill="#8CC56C"/>` +
      `<path class="m-ol" d="M38 80 L42 76 L45 80 L48 76 L51 80 L54 76 L55 92 L37 92Z" fill="#7048E8"/>` +
      `<rect class="m-ol" x="36" y="54" width="18" height="14" rx="6" fill="#8CC56C"/><path d="M41 56 V66 M46 56 V66" stroke="${D}" stroke-width="1.6" stroke-linecap="round"/>` +
      `<path d="M43 71 L47 71 M44 69.5 L44 72.5 M46 69.5 L46 72.5" stroke="${D}" stroke-width="1.3" stroke-linecap="round"/>` +
      `<ellipse class="m-ol" cx="56" cy="94" rx="36" ry="9" fill="#7A5235"/><circle cx="30" cy="88" r="2.5" fill="#7A5235" class="m-ol" style="stroke-width:1.6"/><circle cx="82" cy="88" r="2" fill="#7A5235" class="m-ol" style="stroke-width:1.6"/>` },
  { name: 'Adriaaan',
    icon: () => `<path class="m-ol" d="M36 54 C36 34 52 26 66 28 C82 30 90 42 88 58 C86 72 78 78 72 80 L72 88 L44 88 L44 78 C38 72 36 64 36 54Z" fill="#E03131"/>` +
      `<path d="M88 58 C86 72 78 78 72 80 L72 76 C80 72 84 66 86 56Z" fill="#000" opacity=".15"/>` +
      `<path class="m-ol" d="M42 58 C32 58 30 72 40 76 C46 78 52 72 49 66 C47 62 46 58 42 58Z" fill="#C92A2A"/>` +
      `<path d="M48 36 C54 32 62 31 68 32" stroke="#fff" stroke-width="3.5" fill="none" stroke-linecap="round" opacity=".8"/>` +
      `<g transform="rotate(-25 70 47)"><rect class="m-ol" x="58" y="43" width="24" height="8" rx="4" fill="#F4BE8F"/><rect x="66" y="44.5" width="8" height="5" rx="1" fill="#E6A06B"/></g>` +
      `<rect class="m-ol" x="42" y="80" width="32" height="12" rx="3" fill="#fff"/><path d="M46 84 H70 M46 88 H70" stroke="#CED4DA" stroke-width="1.6"/>` },
]},
{ opts: [
  { name: 'Deal with it',
    icon: () => `<rect class="m-ol" x="32" y="38" width="56" height="50" rx="12" fill="#A5D8FF"/><rect x="36" y="78" width="48" height="6" rx="3" fill="#74C0FC" opacity=".7"/>` +
      `<path d="M40 47 C40 44 42 43 46 43 L62 43" stroke="#fff" stroke-width="4" stroke-linecap="round" fill="none"/>` +
      `<g fill="#111"><rect x="30" y="52" width="60" height="4"/><rect x="35" y="52" width="20" height="8"/><rect x="37" y="60" width="16" height="2.5"/><rect x="40" y="62.5" width="10" height="2"/><rect x="65" y="52" width="20" height="8"/><rect x="67" y="60" width="16" height="2.5"/><rect x="70" y="62.5" width="10" height="2"/></g>` +
      `<g fill="#fff"><rect x="38" y="54.5" width="3" height="2"/><rect x="41" y="56.5" width="3" height="2"/><rect x="68" y="54.5" width="3" height="2"/><rect x="71" y="56.5" width="3" height="2"/></g>` +
      `<path class="m-ol" d="M52 74 Q60 79 68 74" fill="none"/>` +
      `<path class="m-ol" style="stroke-width:1.6" d="M86 84 C88 88 89 90 89 91.5 A3 3 0 0 1 83 91.5 C83 90 84 88 86 84Z" fill="#A5D8FF"/>` +
      `<path d="M80 24 V36 M74 30 H86 M76 26 L84 34 M84 26 L76 34" stroke="#339AF0" stroke-width="2" stroke-linecap="round"/>` },
  { name: 'Mirá que te como',
    icon: () => `<path class="m-ol" d="M38 88 L38 58 C38 52 46 52 46 58 L46 40 C46 33 54 33 54 40 L54 35 C54 28 62 28 62 35 L62 39 C62 32 70 32 70 39 L70 58 L75 52 C79 47 87 51 83 58 L74 76 C71 83 67 88 63 88Z" fill="#A9E34B"/>` +
      `<path d="M46 50 V42 M54 46 V37 M62 46 V38" stroke="#74B816" stroke-width="2" stroke-linecap="round"/>` +
      `<circle class="m-ol" style="stroke-width:2" cx="50" cy="55" r="4.5" fill="#fff"/><circle class="m-ol" style="stroke-width:2" cx="62" cy="55" r="4.5" fill="#fff"/><circle cx="51" cy="56" r="2" fill="${D}"/><circle cx="61" cy="56" r="2" fill="${D}"/>` +
      `<path class="m-ol" style="stroke-width:2.8" d="M44 48 L54 51 M68 48 L58 51" fill="none"/>` +
      `<path class="m-ol" d="M45 64 C48 77 63 77 67 64Z" fill="#5C0F14"/><path d="M47 64.6 L49.5 68.5 L52.5 64.6 L55.5 68.5 L58.5 64.6 L61.5 68.5 L65 64.6Z" fill="#fff"/>` +
      `<rect class="m-ol" x="37" y="84" width="30" height="10" rx="3" fill="#212529"/><path d="M41 89 H63" stroke="#A9E34B" stroke-width="2"/>` },
  { name: 'Pulso de cirujano',
    icon: () => `<rect class="m-ol" x="28" y="38" width="64" height="44" rx="8" fill="#212B3A"/><rect x="33" y="43" width="54" height="34" rx="4" fill="#0B1623"/>` +
      `<path d="M33 52H87M33 60H87M33 68H87M42 43V77M54 43V77M66 43V77M78 43V77" stroke="#16332A" stroke-width="1"/>` +
      `<path d="M35 64 H48 L51 58 L55 71 L58 64 H85" fill="none" stroke="#51CF66" stroke-width="2.6" stroke-linejoin="round" stroke-linecap="round"/>` +
      t(78, 53, 7.5, '40 bpm', '#51CF66') + heart(40, 50, 3.4, '#FF6B6B', 1.4) +
      `<rect class="m-ol" x="53" y="82" width="14" height="6" fill="#495057"/><rect class="m-ol" x="44" y="87" width="32" height="5" rx="2.5" fill="#868E96"/>` +
      `<path d="M80 22 V34 M74 28 H86 M76 24 L84 32 M84 24 L76 32" stroke="#0CA678" stroke-width="2" stroke-linecap="round"/>` },
]},
{ opts: [
  { name: 'Tiene pila',
    icon: () => `<g><ellipse class="m-ol" cx="51" cy="33" rx="5" ry="11" fill="#fff" transform="rotate(-15 51 33)"/><ellipse cx="51" cy="34" rx="2.2" ry="7" fill="#FFA8C5" transform="rotate(-15 51 34)"/><ellipse class="m-ol" cx="69" cy="33" rx="5" ry="11" fill="#fff" transform="rotate(15 69 33)"/><ellipse cx="69" cy="34" rx="2.2" ry="7" fill="#FFA8C5" transform="rotate(15 69 34)"/></g>` +
      `<rect class="m-ol" x="53" y="37" width="14" height="6" rx="2" fill="#ADB5BD"/>` +
      `<rect class="m-ol" x="40" y="41" width="40" height="50" rx="7" fill="#212529"/>` +
      `<path class="m-ol" d="M40 60 V48 a7 7 0 0 1 7 -7 H73 a7 7 0 0 1 7 7 V60Z" fill="#F08C00"/>` +
      `<circle cx="53" cy="50" r="2" fill="${D}"/><circle cx="67" cy="50" r="2" fill="${D}"/><path class="m-ol" style="stroke-width:2" d="M56 54 Q60 57 64 54" fill="none"/>` +
      `<polygon class="m-ol" style="stroke-width:1.8" points="63,63 52,77 59,77 56,88 68,72 61,72 65,63" fill="#FFD43B"/>` +
      `<path d="M44 64 V86" stroke="#fff" stroke-width="2.4" opacity=".25" stroke-linecap="round"/>` },
  { name: 'Mate lavado',
    icon: () => `<path class="m-ol" d="M36 58 C34 76 44 94 60 94 C76 94 86 76 84 58Z" fill="#A0703F"/>` +
      `<ellipse class="m-ol" cx="60" cy="58" rx="25" ry="7" fill="#CED4DA"/><ellipse cx="60" cy="58" rx="20" ry="4.6" fill="#DDE6B4"/><circle cx="52" cy="57" r="1.4" fill="#fff"/><circle cx="56" cy="59" r="1" fill="#fff"/>` +
      stick('M66 58 L80 28', '#CED4DA', 3.4) + `<rect class="m-ol" style="stroke-width:2" x="76" y="24" width="8" height="5" rx="2" fill="#ADB5BD" transform="rotate(-25 80 26.5)"/>` +
      `<path class="m-ol" d="M47 73 Q50.5 76 54 73 M66 73 Q69.5 76 73 73" fill="none"/><path class="m-ol" style="stroke-width:2.2" d="M56 83 Q60 81 64 83" fill="none"/>` +
      `<path class="m-ol" style="stroke-width:1.6" d="M77 66 C79 70 80 72 80 73.5 A3 3 0 0 1 74 73.5 C74 72 75 70 77 66Z" fill="#74C0FC"/>` +
      t(41, 46, 9, 'z', '#868E96') + t(48, 38, 12, 'Z', '#868E96') },
  { name: 'Continuará…',
    icon: () => `<path d="M60 38 L49 25 M60 38 L71 25" stroke="${D}" stroke-width="2.6" stroke-linecap="round"/><circle class="m-ol" style="stroke-width:2" cx="49" cy="25" r="2.6" fill="#FFD43B"/><circle class="m-ol" style="stroke-width:2" cx="71" cy="25" r="2.6" fill="#FFD43B"/>` +
      `<path d="M36 86 L32 94 M84 86 L88 94" stroke="${D}" stroke-width="3" stroke-linecap="round"/>` +
      `<rect class="m-ol" x="26" y="38" width="68" height="48" rx="10" fill="#C0803F"/>` +
      `<rect class="m-ol" x="32" y="44" width="46" height="36" rx="7" fill="#364FC7"/><path d="M36 48 Q40 46 46 46" stroke="#fff" stroke-width="2" fill="none" opacity=".4" stroke-linecap="round"/>` +
      heart(55, 54, 3.2, '#FF8FB1', 1.3) + t(55, 66, 7.2, 'CONTINUARÁ', '#fff', 'letter-spacing=".2"') + t(55, 74, 9, '• • •', '#fff') +
      `<circle class="m-ol" style="stroke-width:2" cx="86" cy="50" r="3.5" fill="#FFD8A8"/><circle class="m-ol" style="stroke-width:2" cx="86" cy="60" r="3.5" fill="#FFD8A8"/><path d="M83 68 H89 M83 72 H89 M83 76 H89" stroke="#7A4A1F" stroke-width="1.6" stroke-linecap="round"/>` },
]},
{ opts: [
  { name: 'Cliente frecuente',
    icon: () => {
      let st = '';
      for (let r = 0; r < 2; r++) for (let c = 0; c < 5; c++) {
        const x = 35 + c * 12.5, y = 61 + r * 13;
        st += (r === 1 && c === 4) ? star(x, y, 6, '#FFD43B', 1.6) :
          `<circle class="m-ol" style="stroke-width:1.6" cx="${x}" cy="${y}" r="5" fill="#FF6B35"/><path d="M${x - 2.2} ${y} L${x - .6} ${y + 1.8} L${x + 2.4} ${y - 1.8}" stroke="#fff" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
      }
      return `<rect class="m-ol" x="26" y="38" width="68" height="46" rx="6" fill="#FFF4D6"/>` +
        `<path class="m-ol" d="M26 50 V44 a6 6 0 0 1 6 -6 H88 a6 6 0 0 1 6 6 V50Z" fill="#FF6B35"/>` + t(60, 47, 6, 'CLIENTE FRECUENTE', '#fff', 'letter-spacing=".4"') + st;
    } },
  { name: 'Termo stickereado',
    icon: () => stick('M76 46 C88 46 88 76 76 76', '#1B4D3E', 3.5) +
      `<rect class="m-ol" x="46" y="26" width="28" height="12" rx="4" fill="#1B4D3E"/><rect class="m-ol" x="44" y="36" width="32" height="58" rx="8" fill="#2B8A3E"/><rect x="45.3" y="37.3" width="29.4" height="5" fill="#1B4D3E"/>` +
      `<path d="M49 48 V86" stroke="#fff" stroke-width="3" opacity=".3" stroke-linecap="round"/>` +
      `<g transform="rotate(-12 55 54)">${star(55, 54, 6.5, '#FFD43B', 1.6)}</g>` + heart(67, 64, 5, '#FF6B9A', 1.6) +
      ball(53, 78, 5) + `<g transform="rotate(-12 66 80)"><rect class="m-ol" style="stroke-width:1.6" x="59" y="76" width="15" height="8" rx="2" fill="#fff"/>${t(66.5, 82.2, 5.4, 'PONG', '#E03131')}</g>` },
  { name: 'Socio del club',
    icon: () => `<rect class="m-ol" x="22" y="38" width="76" height="46" rx="6" fill="#F1F3F5"/>` +
      `<path class="m-ol" d="M22 48 V44 a6 6 0 0 1 6 -6 H92 a6 6 0 0 1 6 6 V48Z" fill="#1971C2"/>` + t(60, 45.8, 5.2, 'CLUB DE PING PONG', '#fff', 'letter-spacing=".4"') +
      `<rect class="m-ol" style="stroke-width:2" x="28" y="53" width="20" height="24" rx="3" fill="#A5D8FF"/><circle cx="38" cy="61.5" r="4.5" fill="#1864AB"/><path d="M30.5 77 C30.5 69 45.5 69 45.5 77Z" fill="#1864AB"/>` +
      `<text x="53" y="61" font-family="Lilita One, sans-serif" font-size="9" fill="#212529">SOCIO</text><text x="53" y="69" font-family="Nunito, sans-serif" font-weight="800" font-size="6" fill="#495057">Nº 0050</text>` +
      `<path d="M53 73V79M55 73V79M58 73V79M59.5 73V79M62 73V79M65 73V79M66.5 73V79M69 73V79M72 73V79M73.5 73V79" stroke="#212529" stroke-width="1.1"/>` + ball(87, 61, 5) },
]},
{ opts: [
  { name: 'Paleta de guerra',
    icon: () => `<g transform="rotate(-45 70 70)"><rect class="m-ol" x="64" y="64" width="12" height="28" rx="4" fill="#D9A066"/><path d="M64 72 H76 M64 78 H76 M64 84 H76" stroke="#A0632D" stroke-width="1.8"/></g>` +
      `<circle cx="52" cy="52" r="24" fill="#E03131"/><circle cx="52" cy="52" r="22.5" fill="none" stroke="#212529" stroke-width="3"/><circle class="m-ol" cx="52" cy="52" r="24" fill="none"/>` +
      `<path d="M40 44 L48 40 M58 64 L66 58 M42 60 L47 62 M60 40 L63 44" stroke="#FFC9C9" stroke-width="2" stroke-linecap="round"/>` +
      `<g transform="rotate(-45 37 33)"><rect class="m-ol" style="stroke-width:2" x="29" y="29.5" width="16" height="7" rx="1" fill="#F8F9FA"/></g>` +
      `<g transform="rotate(20 56 52)"><rect class="m-ol" style="stroke-width:2" x="46" y="48" width="20" height="7" rx="3.5" fill="#F4BE8F"/><rect x="53" y="49.3" width="6" height="4.4" rx="1" fill="#E6A06B"/></g>` },
  { name: 'Mate curado',
    icon: () => `<path class="m-ol" d="M37 60 C35 78 45 94 60 94 C75 94 85 78 83 60Z" fill="#5C3A1E"/>` +
      `<path class="m-ol" d="M35 56 L35 62 C35 67 85 67 85 62 L85 56" fill="#CED4DA"/><path d="M38 62 L42 64 M46 63.5 L50 65 M54 64 L58 65.5 M62 65.5 L66 64 M70 65 L74 63.5 M78 64 L82 62" stroke="#868E96" stroke-width="1.2"/>` +
      `<ellipse class="m-ol" cx="60" cy="56" rx="25" ry="7" fill="#E9ECEF"/><ellipse cx="60" cy="56" rx="20" ry="4.6" fill="#5C940D"/><circle cx="53" cy="55" r="1.6" fill="#A9E34B"/><circle cx="64" cy="57" r="1.2" fill="#A9E34B"/>` +
      stick('M66 56 L80 28', '#FAB005', 3.4) + `<rect class="m-ol" style="stroke-width:2" x="76" y="24" width="8" height="5" rx="2" fill="#E8A600" transform="rotate(-25 80 26.5)"/>` +
      t(60, 86, 13, '100', '#E9ECEF', `stroke="${D}" stroke-width="1.4" paint-order="stroke"`) +
      `<path d="M30 40 L30 46 M27 43 L33 43" stroke="#E67700" stroke-width="2" stroke-linecap="round"/>` },
  { name: 'Viejo lobo',
    icon: () => stick('M88 98 L88 58 C88 48 77 48 77 58', '#A0522D', 3.6) +
      ball(58, 60, 26) +
      `<path class="m-ol" d="M33 48 C33 30 83 30 83 48 C75 42 41 42 33 48Z" fill="#364FC7"/><path class="m-ol" d="M58 33 L58 29" fill="none"/>` +
      `<circle class="m-ol" cx="49" cy="57" r="7.5" fill="#E7F5FF" fill-opacity=".7"/><circle class="m-ol" cx="67" cy="57" r="7.5" fill="#E7F5FF" fill-opacity=".7"/><path class="m-ol" d="M56.5 57 H59.5" fill="none"/><circle cx="49" cy="58" r="1.6" fill="${D}"/><circle cx="67" cy="58" r="1.6" fill="${D}"/>` +
      `<path class="m-ol" style="stroke-width:1.6" d="M42 49 Q48 45 55 49 Q48 48 42 49Z M61 49 Q68 45 74 49 Q68 48 61 49Z" fill="#DEE2E6"/>` +
      `<path class="m-ol" d="M44 71 C48 64 55 65 58 69 C61 65 68 64 72 71 C66 74 62 73 58 71 C54 73 50 74 44 71Z" fill="#E9ECEF"/>` },
]},
{ opts: [
  { name: 'La gomera',
    icon: () => `<path d="M54 44 L54 50 M60 42 L60 51 M66 44 L66 50" stroke="#868E96" stroke-width="2" stroke-linecap="round"/>` + ball(60, 30, 8) +
      stick('M60 96 L60 66 M60 66 L45 42 M60 66 L75 42', '#A0632D', 7) +
      `<path d="M45 42 L60 58 L75 42" stroke="#E03131" stroke-width="3" fill="none" stroke-linejoin="round"/><ellipse class="m-ol" style="stroke-width:2" cx="60" cy="58" rx="6.5" ry="3.5" fill="#7A4A1F"/>` },
  { name: 'Hormiga Atómica',
    icon: () => ball(60, 42, 18) +
      `<path d="M53 74 L46 56 M67 74 L74 56" stroke="#4A3426" stroke-width="3.5" stroke-linecap="round"/>` +
      `<path d="M55 83 L46 87 M65 83 L74 87 M54 89 L46 97 M66 89 L74 97" stroke="#4A3426" stroke-width="2.6" stroke-linecap="round"/>` +
      `<ellipse class="m-ol" cx="60" cy="92" rx="8" ry="6" fill="#4A3426"/><ellipse class="m-ol" cx="60" cy="82" rx="5.5" ry="4.5" fill="#4A3426"/>` +
      `<path d="M56 64 L52 57 M64 64 L68 57" stroke="${D}" stroke-width="2"/><circle cx="52" cy="57" r="1.8" fill="${D}"/><circle cx="68" cy="57" r="1.8" fill="${D}"/>` +
      `<circle class="m-ol" cx="60" cy="71" r="8" fill="#4A3426"/><path class="m-ol" d="M52 70 a8 8 0 0 1 16 0Z" fill="#E03131"/>` +
      `<ellipse cx="57" cy="73" rx="2" ry="2.6" fill="#fff"/><ellipse cx="63" cy="73" rx="2" ry="2.6" fill="#fff"/><circle cx="57.4" cy="73.4" r="1" fill="${D}"/><circle cx="62.6" cy="73.4" r="1" fill="${D}"/>` +
      `<path class="m-ol" style="stroke-width:1.5" d="M40 64 C42 67 43 69 43 70 A2.5 2.5 0 0 1 38 70 C38 69 39 67 40 64Z M80 62 C82 65 83 67 83 68 A2.5 2.5 0 0 1 78 68 C78 67 79 65 80 62Z" fill="#74C0FC"/>` },
  { name: 'Batacazo',
    icon: () => `<polygon class="m-ol" style="stroke-width:2" points="${starPts(60, 58, 34, 25, 12)}" fill="#FFE066"/>` +
      stick('M44 40 V60 C44 82 76 82 76 60 V40', '#CED4DA', 11) +
      `<rect class="m-ol" x="37" y="34" width="14" height="7" rx="2" fill="#868E96"/><rect class="m-ol" x="69" y="34" width="14" height="7" rx="2" fill="#868E96"/>` +
      ([[44, 50], [44, 60], [46.5, 69.5], [76, 50], [76, 60], [73.5, 69.5], [53, 76], [67, 76]] as const).map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.8" fill="#495057"/>`).join('') +
      `<path d="M41.5 46 V60" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".9"/>` },
]},
{ opts: [
  { name: 'Campeón',
    icon: () => {
      const pad = (a: number, c: string) => `<g transform="rotate(${a} 60 62)"><rect class="m-ol" x="56.5" y="40" width="7" height="30" rx="3" fill="#D9A066"/><circle class="m-ol" cx="60" cy="30" r="12" fill="${c}"/></g>`;
      return pad(-42, '#E03131') + pad(42, '#364FC7') + ball(60, 31, 6) +
        `<rect class="m-ol" x="40" y="33" width="40" height="6" rx="3" fill="#FAB005"/>` +
        `<path class="m-ol" d="M42 38 H78 L76 54 C74 66 68 72 60 72 C52 72 46 66 44 54Z" fill="#FCC419"/>` +
        `<path d="M49 43 C49 52 51 60 55 65" stroke="#fff" stroke-width="3" fill="none" opacity=".7" stroke-linecap="round"/>` +
        star(62, 53, 6, '#FFF3BF', 1.6) +
        `<rect class="m-ol" x="56" y="71" width="8" height="9" fill="#E8B000"/><rect class="m-ol" x="45" y="79" width="30" height="10" rx="2" fill="#B07800"/><rect x="52" y="82" width="16" height="4" rx="1" fill="#FFE066"/>`;
    } },
  { name: 'La Scaloneta',
    icon: () => `<path d="M76 44 V30" stroke="${D}" stroke-width="2"/><path class="m-ol" style="stroke-width:1.6" d="M76 30 H88 V38 H76Z" fill="#74ACDF"/><rect x="76.8" y="32.7" width="10.4" height="2.6" fill="#fff"/>` +
      `<path class="m-ol" style="stroke-width:1.8" d="M51 30 H63 L62 36 C61 40 53 40 52 36Z" fill="#FCC419"/><rect class="m-ol" style="stroke-width:1.6" x="54" y="39" width="6" height="5" fill="#E8B000"/>` +
      `<rect class="m-ol" x="25" y="44" width="70" height="34" rx="8" fill="#F8F9FA"/>` +
      [30, 43, 56, 69].map(x => `<rect class="m-ol" style="stroke-width:1.6" x="${x}" y="49" width="10" height="10" rx="2" fill="#A5D8FF"/>`).join('') +
      `<rect class="m-ol" style="stroke-width:1.6" x="82" y="49" width="8" height="18" rx="2" fill="#A5D8FF"/>` +
      `<rect x="25.5" y="62" width="55" height="8" fill="#74ACDF"/>` + t(53, 68.5, 6.4, 'CAMPEONES', '#fff', 'letter-spacing=".4"') +
      `<circle class="m-ol" cx="38" cy="79" r="7" fill="#212529"/><circle cx="38" cy="79" r="2.5" fill="#ADB5BD"/><circle class="m-ol" cx="82" cy="79" r="7" fill="#212529"/><circle cx="82" cy="79" r="2.5" fill="#ADB5BD"/>` +
      `<rect x="36" y="28" width="3" height="5" fill="#FF6B6B" transform="rotate(20 37 30)"/><rect x="44" y="24" width="3" height="5" fill="#51CF66" transform="rotate(-30 45 26)"/><rect x="68" y="25" width="3" height="5" fill="#FCC419" transform="rotate(40 69 27)"/><rect x="88" y="44" width="3" height="5" fill="#845EF7" transform="rotate(-20 89 46)"/>` },
  { name: 'Dale campeón',
    icon: () => stick('M38 28 L60 50 M82 28 L60 50', '#E9C46A', 3) + `<circle class="m-ol" cx="38" cy="28" r="3.5" fill="#fff"/><circle class="m-ol" cx="82" cy="28" r="3.5" fill="#fff"/>` +
      `<path class="m-ol" d="M34 50 V78 C34 88 86 88 86 78 V50Z" fill="#74ACDF"/>` +
      `<path d="M36 54 L44 80 L52 55 L60 82 L68 55 L76 80 L84 54" stroke="#fff" stroke-width="2.4" fill="none" stroke-linejoin="round"/>` +
      `<path d="M34.5 77 C34.5 87 85.5 87 85.5 77" stroke="#1C2C5B" stroke-width="4" fill="none"/>` +
      `<ellipse class="m-ol" cx="60" cy="50" rx="26" ry="8" fill="#FFF8E7"/><ellipse cx="60" cy="50" rx="24.5" ry="6.8" fill="none" stroke="#1C2C5B" stroke-width="2.4"/>` +
      `<circle class="m-ol" style="stroke-width:1.6" cx="60" cy="70" r="5" fill="#FCC419"/>` +
      `<path d="M25 52 C21 58 21 66 25 72 M95 52 C99 58 99 66 95 72" stroke="#1864AB" stroke-width="2.4" fill="none" stroke-linecap="round"/>` },
]},
{ opts: [
  { name: 'Chocá los cinco',
    icon: () => {
      const pad = (cx: number, rot: number, c: string) => `<g transform="rotate(${rot} ${cx} 50)"><rect class="m-ol" x="${cx - 4}" y="63" width="8" height="20" rx="3" fill="#D9A066"/><circle class="m-ol" cx="${cx}" cy="50" r="15" fill="${c}"/>` +
        `<circle cx="${cx - 4}" cy="48" r="1.7" fill="${D}"/><circle cx="${cx + 4}" cy="48" r="1.7" fill="${D}"/><path class="m-ol" style="stroke-width:2" d="M${cx - 4} 54 Q${cx} 58 ${cx + 4} 54" fill="none"/></g>`;
      return pad(45, 28, '#E03131') + pad(75, -28, '#4C6EF5') +
        `<polygon class="m-ol" style="stroke-width:2" points="${starPts(60, 30, 10, 4.5, 8)}" fill="#FFD43B"/>` +
        `<path d="M47 24 L50 28 M73 24 L70 28 M60 15 V18" stroke="${D}" stroke-width="2.2" stroke-linecap="round"/>`;
    } },
  { name: 'Fernet con coca',
    icon: () => `<path d="M38 32 H82 L77 92 H43Z" fill="#E9F2F8"/><path d="M39 42 H81 L77 92 H43Z" fill="#4A1F0E"/>` +
      `<rect x="47" y="52" width="12" height="12" rx="2" fill="#fff" opacity=".3" transform="rotate(-15 53 58)"/><rect x="62" y="62" width="11" height="11" rx="2" fill="#fff" opacity=".3" transform="rotate(12 67 67)"/>` +
      stick('M64 44 L74 24', '#E03131', 3) +
      `<path class="m-ol" d="M38.5 37 C42 30 48 35 52 31 C56 27 62 34 66 30 C70 27 76 33 80 31 C82.5 31 82.5 34 81.6 37 L81 44 H39Z" fill="#E8C39E"/>` +
      `<path d="M44 48 L47 86" stroke="#fff" stroke-width="3" opacity=".3" stroke-linecap="round"/>` +
      `<path class="m-ol" d="M38 32 H82 L77 92 H43Z" fill="none"/>` },
  { name: 'Dúo dinámico',
    icon: () => {
      const mask = (x: number, y: number, r: number, c: string) => `<g transform="translate(${x} ${y}) rotate(${r})"><path d="M-24 0 L-31 -5 M-24 0 L-31 5" stroke="${D}" stroke-width="2.4" stroke-linecap="round"/><path class="m-ol" d="M-24 0 C-24 -11 -11 -13 0 -6 C11 -13 24 -11 24 0 C24 10 12 12 0 5 C-12 12 -24 10 -24 0Z" fill="${c}"/>` +
        `<ellipse class="m-ol" style="stroke-width:2" cx="-11" cy="-1" rx="6" ry="4" fill="#fff"/><ellipse class="m-ol" style="stroke-width:2" cx="11" cy="-1" rx="6" ry="4" fill="#fff"/></g>`;
      return `<polygon class="m-ol" style="stroke-width:2" points="${starPts(60, 60, 37, 27, 14)}" fill="#FFF3BF"/>` +
        mask(47, 48, -12, '#212529') + mask(73, 73, 10, '#2F9E44');
    } },
]},
];


/** Ilustraciones por nombre de nivel. */
export const ART: Record<string, (u: number) => string> = Object.fromEntries(LIB.flatMap((g) => g.opts.map((o) => [o.name, o.icon])))

/** Material del marco según el número de nivel (I a VI). */
export const TIERS = [
  { name: 'Bronce', roman: 'I', main: '#E8A26A', dark: '#9C5221', face: '#FFF1E3' },
  { name: 'Plata', roman: 'II', main: '#D3DBE6', dark: '#6E7C91', face: '#F8FAFC' },
  { name: 'Oro', roman: 'III', main: '#FFD24D', dark: '#C98A00', face: '#FFF8DC' },
  { name: 'Diamante', roman: 'IV', main: '#7FE3F0', dark: '#0B7285', face: '#EFFCFE' },
  { name: 'Rubí', roman: 'V', main: '#FF8FAB', dark: '#A61E4D', face: '#FFF0F5' },
  { name: 'Leyenda', roman: 'VI', main: 'grad', dark: '#5F3DC4', face: '#F6F0FF' },
] as const

const hexPts = (r: number) =>
  Array.from({ length: 6 }, (_, k) => {
    const a = ((-90 + 60 * k) * Math.PI) / 180
    return f(60 + r * Math.cos(a)) + ',' + f(60 + r * Math.sin(a))
  }).join(' ')

let uid = 0

/** SVG completo de una medalla: marco hexagonal del nivel + ilustración + cinta con el número romano. */
export function medalSvg(art: string, tier: number, opts: { face?: string; label?: string } = {}): string {
  const u = ++uid
  const T = TIERS[Math.min(tier, TIERS.length - 1)]
  const icon = ART[art]?.(u) ?? ''
  const main = T.main === 'grad' ? `url(#mg${u})` : T.main
  const grad =
    T.main === 'grad'
      ? `<linearGradient id="mg${u}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#B197FC"/><stop offset=".5" stop-color="#F783AC"/><stop offset="1" stop-color="#66D9E8"/></linearGradient>`
      : ''
  const label = (opts.label ?? `${art}, nivel ${T.roman}`).replace(/"/g, '&quot;')
  const w = 20 + T.roman.length * 9
  return (
    `<svg viewBox="0 0 120 130" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${label}">` +
    `<defs>${grad}<clipPath id="mc${u}"><polygon points="${hexPts(43)}"/></clipPath></defs>` +
    `<polygon points="${hexPts(54)}" fill="${D}" stroke="${D}" stroke-width="12" stroke-linejoin="round"/>` +
    `<polygon points="${hexPts(54)}" fill="${T.dark}" stroke="${T.dark}" stroke-width="6.8" stroke-linejoin="round"/>` +
    `<polygon points="${hexPts(49)}" fill="${main}" stroke="${main}" stroke-width="5" stroke-linejoin="round"/>` +
    `<path d="M23 36 L52 19" stroke="#fff" stroke-opacity=".55" stroke-width="3.5" stroke-linecap="round"/>` +
    `<polygon points="${hexPts(43)}" fill="${opts.face ?? T.face}"/>` +
    `<g clip-path="url(#mc${u})">${icon}</g>` +
    `<polygon points="${hexPts(43)}" class="m-ol" fill="none"/>` +
    `<rect class="m-ol" x="${60 - w / 2}" y="104" width="${w}" height="17" rx="8.5" fill="${T.dark}"/>` +
    t(60, 116.6, 12, T.roman, '#fff') +
    `</svg>`
  )
}
