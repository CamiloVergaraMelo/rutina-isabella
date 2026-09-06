# Rutina Isabella 🚀

Tablero de rutina infantil con temática espacial para Isabella. Isabella es la
"piloto" de una nave y completa su rutina del día viajando entre estaciones;
un cohete se recarga de combustible con cada actividad y aterriza en la
"Luna de los Sueños" (hora de dormir).

## Motor de la semana (data-driven)
La app abre automáticamente en la rutina del día de hoy e incluye un selector
Lun–Dom para ver cualquier día. Tres rutinas:

- **Lun–Vie** — día de escuela (jornada 7:30–16:00 continua).
- **Sábado** — rutina propia del fin de semana.
- **Domingo** — rutina de preparación para la semana.

El progreso se guarda por día en el navegador (localStorage) y se reinicia al
cambiar de día. El nombre, las horas y las alarmas quedan guardados.

## Estructura
- `index.html` — app autónoma (HTML/CSS/JS puro, sin frameworks).
- `assets/` — imágenes (Isabella, robot copiloto, ícono, insignia).

## Deploy
Sitio estático. Desplegado en Vercel (proyecto `rutina-isabella`).
Para editar las rutinas, modifica el objeto `ROUTINES` dentro de `index.html`.
