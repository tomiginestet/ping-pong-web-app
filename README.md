# 🏓 Ping Pong Club

Una pequeña app web para llevar los puntajes, rankings y torneos de ping pong entre amigos.

## Qué hace

- **Jugadores**: creá jugadores con nombre, emoji y color (no hace falta registrarse).
- **Partido rápido**: elegí dos jugadores y las reglas:
  - a cuántos puntos se gana cada juego (2, 4, 11, 21 o cualquier número),
  - al mejor de cuántos juegos (1, 3, 5, 10…; con número par puede haber empate),
  - si hay que ganar por 2 de diferencia,
  - cuántos saques por turno.
- **Marcador en pantalla completa**: tocá tu mitad de la pantalla para sumar un punto.
  Muestra quién saca, punto de juego/partido, juegos ganados; se puede deshacer y cambiar de lado.
  Funciona en vertical (arriba/abajo) y horizontal (izquierda/derecha). En la compu: ← / → suman y Backspace deshace.
- **Torneos**: liga (todos contra todos, opcional ida y vuelta) o eliminación directa (con BYEs automáticos).
- **Ranking con ELO**, niveles (🥚 Pelotita → 🐉 Leyenda), rachas, logros desbloqueables, cara a cara e historial.
- **Copia de seguridad**: exportar/importar todos los datos en JSON (Ranking → Ajustes).

Los datos se guardan en el navegador (localStorage), así que no necesita servidor.

## Desarrollo

```bash
npm install
npm run dev      # servidor de desarrollo
npm test         # tests de la lógica de puntaje, ELO y torneos
npm run lint
npm run build    # genera dist/ (se puede publicar en cualquier hosting estático)
```

Stack: React + TypeScript + Vite, React Router (HashRouter), Vitest.
