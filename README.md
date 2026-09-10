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

## Mochila de mañana (circular de la escuela)
Un panel lateral derecho muestra lo que hay que preparar para el **próximo
día de clases**: uniforme, clases del día, tarea, qué llevar y avisos
(días inhábiles, vestimenta especial). Se abre con la pestaña «MAÑANA» del
borde derecho; el puntito rojo avisa cuando hay algo pendiente.

Isabella está en **2° Verde**. El horario del grupo va en `HORARIO_VERDE`
dentro de `index.html` (uniforme y clases por día, fijos todo el ciclo).
La tarea y el material salen en vivo de la hoja del colegio:

> INFORMACIÓN GENERAL 2° PRIMARIA — Colegio Álamos Cancún
> `1EbfPoX2oeHWejsjpqdnPXiwVjvn1UU5IzEWKoAiRxYU`

La hoja es pública pero **no manda cabeceras CORS**, así que el navegador no
puede leerla directo: `api/circular.js` la lee desde el servidor y devuelve
JSON. Por eso el panel en vivo **solo funciona en el sitio desplegado**; si
abres `index.html` suelto, el panel sigue mostrando uniforme y clases y
avisa que no pudo consultar la circular.

Cómo lee la circular: la fila del día de hoy es la que lleva la tarea del
día siguiente (`TAREA PARA EL JUEVES` vive en la fila `MIÉRCOLES 9 de
septiembre`). En fin de semana toma la fila del viernes, que es la que
carga la tarea del lunes. Los `gid` de las pestañas **no** están fijos en el
código: la escuela crea una pestaña nueva cada quincena, así que se
descubren en cada consulta.

## Estructura
- `index.html` — app (HTML/CSS/JS puro, sin frameworks).
- `api/circular.js` — función serverless que lee la hoja de la escuela.
- `assets/` — imágenes optimizadas (WebP + ícono PNG).

## Editar las rutinas
Modifica el objeto `ROUTINES` dentro de `index.html` (una entrada por día:
`escuela`, `sabado`, `domingo`). Cada estación tiene emoji, hora, título,
mensaje del copiloto y lista de tareas.

## Deploy
Sitio estático. Desplegado en Vercel (proyecto `rutina-isabella`).
