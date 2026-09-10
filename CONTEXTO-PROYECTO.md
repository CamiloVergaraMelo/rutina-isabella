# Rutina Isabella — Contexto del proyecto

Documento de traspaso para continuar el proyecto en Claude Cowork. Resume qué es, qué está hecho, cómo está construido y qué sigue.

## Qué es

Un tablero de rutina infantil con temática espacial para **Isabella** (hija de Camilo). Isabella es la "piloto" de una nave y va completando su rutina del día como si fuera un viaje entre estaciones/planetas. Un cohete viaja por las estaciones y cada actividad completada carga combustible para llegar a la siguiente. Termina en la "Luna de los Sueños" (hora de dormir).

- Deliverable actual: un archivo HTML autónomo (`index.html`) que funciona en navegador / iPad.
- Desplegado en Vercel como proyecto **rutina-isabella** (cuenta personal Hobby de Camilo; NO tocar los proyectos `tukiin-panel` ni `web`).

## Personajes y assets (carpeta `assets/`)

- `isabella-header.png` — Isabella astronauta de cuerpo entero, fondo transparente (usada en el header).
- `isabella-full.png` — igual, mayor resolución (para pantalla final / banner).
- `robot-copiloto.png` — robot copiloto, fondo transparente (guía en cada estación).
- `app-icon.png` — ícono 180×180 para "Agregar a inicio" en iPad.
- `isabella-robot-hero.jpg` — Isabella + robot juntos con fondo espacial.
- `isabella-insignia.jpg` — busto de Isabella con fondo espacial.

Los recortes sin fondo se hicieron con `rembg` (modelo `u2net`) sobre las imágenes originales que subió Camilo (turnaround de Isabella y del robot). En el `index.html` actual las imágenes van **incrustadas en base64**; para el repo conviene pasarlas a archivos sueltos referenciados por ruta.

## Diseño

- Estética: rosa / lila pastel espacial (basada en el arte de Isabella astronauta). Fondo cósmico morado/índigo con estrellas, estrellas fugaces, nebulosas.
- Fuentes (Google): **Fredoka** (títulos redondeados), **Orbitron** (dígitos del reloj, sci-fi), **Nunito** (texto).
- Todos los botones tienen estética de "panel de cohete": relieve físico, se hunden al presionar, LED que se enciende (verde) al completar.

## Funcionalidad implementada (rutina del DOMINGO)

- **Header tipo banner**: panel morado que une a Isabella (cuerpo entero, izquierda) con el reloj. Incluye:
  - Nombre editable "Isabella" (placa de piloto).
  - Reloj LED en vivo (hora:min:seg + am/pm) y fecha en español.
  - Carta estelar de **Aries** (signo del 9 de abril, cumpleaños de Isabella).
  - Barra "Progreso de misión" + contador de estrellas (x/5).
  - Botones "Recordatorios" y "Nueva misión".
  - Detalles decorativos de nave (switches, O₂ 100%, VEL 7.8 km/s).
- **Radar / pista de vuelo horizontal**: los planetas (estaciones) en fila y el cohete viajando de izquierda a derecha; sirve también de selector de estación.
- **Una estación a la vez** en primer plano, con navegación ‹ › y puntos. Al completar una estación el cohete vuela (con estela de chispas y rebote de aterrizaje) y auto-avanza a la siguiente.
- **Copiloto robot** con bocadillo que saluda a Isabella por su nombre y cambia por estación.
- **Actividades** como botones grandes con LED; al completarlas cargan **combustible** (medidor por estación).
- **Alarmas por hora**: cada estación puede tener hora; al activarse suena una campanita (Web Audio) y aparece un aviso. Se activan con el botón "Recordatorios" (requiere un toque por políticas de autoplay). Baño 6:00 pm y dormir 7:30 pm vienen puestas.
- **Persistencia (localStorage)**: guarda el progreso del día; si se reabre el mismo día, continúa; al cambiar de día, empieza limpio. Nombre y horas quedan guardados siempre.
- **Optimizado para iPad**: meta tags de web-app, ícono propio, viewport con safe-area, y Screen Wake Lock para mantener la pantalla encendida (alarmas más confiables). Se usa agregándolo a la pantalla de inicio desde Safari.

### Estaciones del domingo (rutina definida)
1. 🌅 Al despertar — hacer la cama · lavarme los dientes · vestirme
2. 📚 Después de comer — preparar la mochila · alistar el uniforme · revisar la agenda
3. 🎨 Tarde libre (hasta las 6)
4. 🛁 Baño (6:00 pm)
5. 🌙 A dormir — pijama · dientes · cuento (7:30 pm)

## Próximo objetivo: motor de la SEMANA completa

Convertir el board (hoy con las estaciones "hardcodeadas") en una app **data-driven**: los días son bloques de datos y el board se genera según el día.

- La app **abre en la rutina del día de hoy** automáticamente, con selector Lun–Dom para cambiar.
- **3 rutinas** (confirmado por Camilo):
  - **Lun–Vie**: una sola rutina de día de escuela (se usa los 5 días).
  - **Sábado**: su propia rutina.
  - **Domingo**: la ya definida arriba.
- **Persistencia por día** (cada día guarda su progreso; reset al cambiar de día).

### Borradores a validar con Camilo (pendiente su ajuste)
**Entre semana (Lun–Vie):** Al despertar (cama, dientes, uniforme, desayunar) → Antes de salir (mochila y lonchera, a la escuela) → Al volver (guardar mochila, lavarse manos, merendar) → Tarea → Tiempo libre → Baño 6:00 → Dormir 7:30 (pijama, dientes, cuento).
**Sábado:** Al despertar (cama, dientes, vestirse) → Mañana (desayunar, ¿clase/deporte?) → Ordenar cuarto → Tarde libre → Baño → Dormir.

Falta que Camilo confirme horarios reales y si Isabella tiene clase/deporte fijo algún día.

## Integración con la escuela (Colegio Álamos Cancún)

Isabella cursa **2° Verde**. El colegio publica una hoja de cálculo pública,
`INFORMACIÓN GENERAL 2° PRIMARIA`
(`1EbfPoX2oeHWejsjpqdnPXiwVjvn1UU5IzEWKoAiRxYU`), con directorio, horarios,
calendario del ciclo y una **circular quincenal** con la tarea de cada día.

### Panel "Mochila de mañana"
Panel lateral derecho (pestaña «MAÑANA» en el borde) con lo que hay que
preparar para el próximo día de clases: uniforme, clases, tarea, qué llevar,
qué entregar y avisos. Un punto rojo en la pestaña marca que hay pendientes.
En fin de semana apunta al lunes.

### Horario de 2° Verde (fijo todo el ciclo, va en `HORARIO_VERDE`)
| Día | Uniforme | Clases |
|---|---|---|
| Lunes | Diario | Artísticas 12:50 |
| Martes | Deportes | Natación 10:35 · Danza 12:50 |
| Miércoles | Deportes | Teatro 8:20 · Canto y Ritmos 11:20 |
| Jueves | Diario | Ed. Socioemocional 10:35 · Filosofía 11:20 |
| Viernes | Color del mes (cómoda/deportiva) | Ciudadanía Digital y Maker 9:05 · Ed. Física 12:05 |

Jornada: entrada 7:00–7:35 · lunch 9:50 · receso 10:05–10:35 · salida
14:15–14:40. Isabella **se queda a Hunters' Academies** por la tarde, así que
llega a casa alrededor de las 4:00 pm: la estación "Al volver · 4:00 pm" de la
rutina de escuela es correcta (confirmado por Camilo, 9 sep 2026).

### Cómo se lee la hoja (`api/circular.js`)
- La hoja es pública pero **sin CORS**, por eso hace falta el proxy en Vercel.
- Los `gid` de las pestañas no se pueden fijar: la escuela crea una pestaña
  nueva cada quincena (`31ago-11sep`, `14-25sep`…). Se descubren leyendo el
  `htmlview` en cada consulta.
- La tarea del día siguiente vive en la fila del día de **hoy**
  (`TAREA PARA EL JUEVES` en la fila `MIÉRCOLES 9 de septiembre`).
- Los avisos de "Día inhábil" y "Suspensión de clases" no van en el
  encabezado sino en la columna de actividades de la fila de Español.
- El **calendario de eventos NO se puede leer**: sus notas son comentarios de
  celda y la exportación CSV no los incluye. Los avisos relevantes igual
  llegan por la circular, que sí trae "Hunty Show", "Toma de foto para
  credencial", "Día Internacional de la Paz", etc.
- El panel guarda la última consulta en `localStorage`, así que sigue
  sirviendo sin conexión (y avisa que los datos no son de hoy).

## Infra / operación

- **Vercel**: proyecto `rutina-isabella`. Plan Hobby.
- **Plan acordado**: pasar el proyecto a un **repo de GitHub** (`CamiloVergaraMelo/rutina-isabella`) y conectarlo a Vercel para deploys automáticos en cada push. Estructura sugerida del repo: `index.html` (portada/selector o board del día) + `assets/` (imágenes sueltas). Para varios días, mantener todo en un solo proyecto.
- Conectores útiles en Cowork: **GitHub** (repo) y **Vercel** (deploy).

## Notas técnicas

- HTML/CSS/JS puro, sin frameworks. Un solo archivo autónomo.
- Reloj: `setInterval` + `toLocaleDateString('es-MX', …)`.
- Alarmas: `AudioContext` desbloqueado por gesto; chequeo por `setInterval` cada 15 s comparando `HH:MM`.
- Cohete: SVG propio; se posiciona por `left` sobre los planetas; animación de vuelo con keyframes + estela de chispas.
- Persistencia: `localStorage` con `{date, tasks, name, alarms}`; compara fecha local `YYYY-MM-DD`.
- Idioma de todo el producto: **español**.
