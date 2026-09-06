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
