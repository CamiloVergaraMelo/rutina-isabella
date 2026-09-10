/* ============================================================
   /api/circular  —  Puente hacia la hoja de la escuela
   ------------------------------------------------------------
   La hoja "INFORMACIÓN GENERAL 2° PRIMARIA" es pública pero no
   manda cabeceras CORS, así que el navegador no puede leerla
   directo. Esta función la lee desde el servidor y devuelve JSON.

   Qué devuelve: la tarea y el material del PRÓXIMO DÍA DE CLASES.
   En la circular, la fila del día de hoy es la que carga la tarea
   para el día siguiente ("TAREA PARA EL JUEVES" vive en la fila
   "MIÉRCOLES 9 de septiembre"), así que buscamos la fila de hoy.
   ============================================================ */
'use strict';

const SHEET_ID = '1EbfPoX2oeHWejsjpqdnPXiwVjvn1UU5IzEWKoAiRxYU';
const MESES = ['enero','febrero','marzo','abril','mayo','junio','julio',
               'agosto','septiembre','octubre','noviembre','diciembre'];
const DIAS = ['domingo','lunes','martes','miércoles','jueves','viernes','sábado'];

/* ---------- utilidades ---------- */

// Parser CSV que respeta comillas y saltos de línea dentro de una celda.
function parseCSV(text){
  const rows = []; let row = [], cell = '', q = false;
  for (let i = 0; i < text.length; i++){
    const c = text[i];
    if (q){
      if (c === '"'){ if (text[i+1] === '"'){ cell += '"'; i++; } else q = false; }
      else cell += c;
    } else if (c === '"') q = true;
    else if (c === ','){ row.push(cell); cell = ''; }
    else if (c === '\n'){ row.push(cell); rows.push(row); row = []; cell = ''; }
    else if (c !== '\r') cell += c;
  }
  if (cell || row.length){ row.push(cell); rows.push(row); }
  return rows;
}

const norm = s => String(s == null ? '' : s)
  .replace(/\s+/g, ' ').trim();

// Una celda "vacía de verdad": la hoja usa "-" para decir "nada".
const vacia = s => { const t = norm(s).replace(/^[-–—\s]+$/, ''); return t === ''; };

const ymd = d => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;

// Hoy en Cancún (UTC-5 todo el año), por si el cliente no manda fecha.
function hoyCancun(){
  const p = new Intl.DateTimeFormat('en-CA', { timeZone:'America/Cancun',
    year:'numeric', month:'2-digit', day:'2-digit' }).formatToParts(new Date());
  const g = t => p.find(x => x.type === t).value;
  return `${g('year')}-${g('month')}-${g('day')}`;
}

/* ---------- descubrir las pestañas ---------- */
// La escuela crea una pestaña nueva cada quincena ("14-25sep"), así que
// los gid no se pueden fijar en el código: hay que leerlos cada vez.
async function listarPestanas(){
  const r = await fetch(`https://docs.google.com/spreadsheets/d/${SHEET_ID}/htmlview`);
  if (!r.ok) throw new Error(`htmlview ${r.status}`);
  const html = await r.text();
  const out = [];
  const re = /items\.push\(\{name:\s*"((?:[^"\\]|\\.)*)"[\s\S]*?gid:\s*"(\d+)"/g;
  let m;
  while ((m = re.exec(html)) !== null){
    out.push({ nombre: m[1].replace(/\\(.)/g, '$1'), gid: m[2] });
  }
  return out;
}

const csvURL = gid =>
  `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&headers=0&gid=${gid}`;

/* ---------- localizar la fila de un día ---------- */
// Las filas de la circular traen en la columna 1 algo como
// "MIÉRCOLES\n9 de septiembre".
function leerFechaCelda(txt){
  const t = norm(txt).toLowerCase();
  const m = t.match(/\b(\d{1,2})\s+de\s+([a-záéíóú]+)/);
  if (!m) return null;
  const mes = MESES.indexOf(m[2]);
  if (mes < 0) return null;
  return { dia: parseInt(m[1], 10), mes };
}

// De "TAREA PARA EL JUEVES" saca "jueves".
function leerDiaDestino(txt){
  const t = norm(txt).toLowerCase();
  if (!/tarea\s+para/.test(t)) return null;
  return DIAS.find(d => t.includes(d)) || null;
}

/* ---------- extraer la circular de una pestaña ---------- */

// Índice de la fila-encabezado de un día ("MIÉRCOLES\n9 de septiembre"
// en la columna 1, "TAREA PARA EL JUEVES" en la 0).
function buscarFilaDia(filas, dia){
  for (let i = 0; i < filas.length; i++){
    const f = leerFechaCelda(filas[i][1]);
    if (f && f.dia === dia.dia && f.mes === dia.mes && leerDiaDestino(filas[i][0])) return i;
  }
  return -1;
}

// Lo que la fila de un día dice del propio día: su aviso y qué se entrega.
function leerDia(filas, iCab){
  // El encabezado lleva el evento del día ("Hunty Show", "Toma de foto").
  let aviso = norm(filas[iCab][3]).replace(/^ACTIVIDADES DURANTE CLASE\s*/i, '');
  if (vacia(aviso) || aviso.length > 120) aviso = '';

  let sinClases = '';
  const entregar = [];
  for (let i = iCab + 1; i < Math.min(iCab + 4, filas.length); i++){
    const materia = norm(filas[i][1]);
    if (!/^(español|english)$/i.test(materia)) continue;

    // "Día inhábil" y las suspensiones no van en el encabezado sino en la
    // columna de actividades de la fila de la materia, junto a la planeación.
    const act = norm(filas[i][3]);
    if (!sinClases && /^(d[ií]a inh[áa]bil|suspensi[óo]n|vacaciones|primaria baja no asiste)/i.test(act)){
      sinClases = act;
    }

    const ev = norm(filas[i][2]);
    if (vacia(ev) || /^(ninguna|none)$/i.test(ev)) continue;
    entregar.push({ materia: /español/i.test(materia) ? 'Español' : 'English', evidencia: ev });
  }
  return { aviso, sinClases, entregar };
}

// Lo que la fila de un día deja de tarea PARA EL DÍA SIGUIENTE.
function leerTareas(filas, iCab){
  const tareas = [];
  for (let i = iCab + 1; i < Math.min(iCab + 4, filas.length); i++){
    const materia = norm(filas[i][1]);
    if (!/^(español|english)$/i.test(materia)) continue;
    const texto = norm(filas[i][0]);
    if (vacia(texto)) continue;
    tareas.push({
      materia: /español/i.test(materia) ? 'Español' : 'English',
      tarea: texto,
      // Avisos del tipo "venir con vestimenta tricolor" o "trae una carpeta"
      // se cuelan entre las tareas: los marcamos para resaltarlos aparte.
      esLlevar: /\b(venir|asiste|asistir|traer|trae|bring|vestimenta|disfraz|uniforme)\b/i.test(texto)
    });
  }
  return tareas;
}

// Sección "TRAER PARA LA CLASE DEL": col2 = la clase, col0/col1 = qué llevar
// (una columna por cada semana de la quincena).
function leerMaterial(filas, iCab){
  // ¿La fila cae en el primer bloque "Circular semanal" de la pestaña o en el
  // segundo? Ese índice es también la columna que toca en la sección de arriba.
  let bloque = 0;
  for (let i = 0; i < iCab; i++){
    if (/circular semanal/i.test(norm(filas[i][0]))) bloque++;
  }
  const col = Math.max(0, bloque - 1);

  const out = [];
  for (let i = 0; i < filas.length; i++){
    if (/circular semanal/i.test(norm(filas[i][0]))) break;
    const clase = norm(filas[i][2]);
    if (!clase || /clases de|equipo creativo/i.test(clase)) continue;
    const qué = norm(filas[i][col]);
    if (vacia(qué)) continue;
    out.push({ clase: clase.replace(/\s{2,}/g, ' · '), material: qué });
  }
  return out;
}

/* ---------- handler ---------- */
module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  // La escuela actualiza la circular una vez por semana: 30 min de caché
  // en el edge es de sobra y evita golpear la hoja en cada carga.
  res.setHeader('Cache-Control', 's-maxage=1800, stale-while-revalidate=86400');

  try {
    const url = new URL(req.url, 'http://x');
    const hoyStr = /^\d{4}-\d{2}-\d{2}$/.test(url.searchParams.get('date') || '')
      ? url.searchParams.get('date') : hoyCancun();
    const [Y, M, D] = hoyStr.split('-').map(Number);
    const hoy = new Date(Y, M - 1, D);

    // Día de referencia: hoy si es de lunes a viernes; si es fin de
    // semana, el viernes anterior (que es quien carga la tarea del lunes).
    const ref = new Date(hoy);
    while (ref.getDay() === 0 || ref.getDay() === 6) ref.setDate(ref.getDate() - 1);

    // Día objetivo: el próximo día de clases después de hoy.
    const obj = new Date(hoy);
    do { obj.setDate(obj.getDate() + 1); } while (obj.getDay() === 0 || obj.getDay() === 6);

    const pestanas = await listarPestanas();
    // Las pestañas de horario/calendario/tutoriales no traen circular.
    const candidatas = pestanas.filter(p =>
      !/horario|calendario|tutorial|directorio/i.test(p.nombre));

    // Leemos las pestañas una sola vez y las guardamos: la fila de hoy y la
    // de mañana pueden caer en pestañas distintas (viernes → lunes).
    const hojas = [];
    for (const p of candidatas){
      try {
        const r = await fetch(csvURL(p.gid));
        if (!r.ok) continue;
        hojas.push({ nombre: p.nombre, filas: parseCSV(await r.text()) });
      } catch { /* una pestaña ilegible no debe tumbar el resto */ }
    }

    const refDia = { dia: ref.getDate(), mes: ref.getMonth() };
    const objDia = { dia: obj.getDate(), mes: obj.getMonth() };

    let tareas = [], material = [], pestana = null, encontrado = false;
    let aviso = '', entregar = [], sinClases = '', avisoVisto = false;

    for (const h of hojas){
      // La fila de HOY es la que carga la tarea para el próximo día de clases.
      const iRef = buscarFilaDia(h.filas, refDia);
      if (iRef >= 0 && !encontrado){
        tareas = leerTareas(h.filas, iRef);
        material = leerMaterial(h.filas, iRef);
        pestana = h.nombre; encontrado = true;
      }
      // La fila de MAÑANA describe el propio día: su aviso y qué se entrega.
      const iObj = buscarFilaDia(h.filas, objDia);
      if (iObj >= 0 && !avisoVisto){
        const d = leerDia(h.filas, iObj);
        aviso = d.aviso; entregar = d.entregar; sinClases = d.sinClases;
        avisoVisto = true;
      }
    }

    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify({
      ok: encontrado,
      consultado: ymd(hoy),
      // El día del que habla el panel
      para: {
        fecha: ymd(obj),
        diaSemana: DIAS[obj.getDay()],
        dow: obj.getDay(),
        esManana: Math.round((obj - hoy) / 86400000) === 1,
        etiqueta: `${DIAS[obj.getDay()]} ${obj.getDate()} de ${MESES[obj.getMonth()]}`
      },
      pestana,
      tareas,
      material,
      aviso,
      sinClases,   // texto si mañana no hay clases; '' si sí hay
      entregar,
      mensaje: encontrado ? '' : 'La escuela todavía no publica la circular de estos días.',
      actualizado: new Date().toISOString()
    }));
  } catch (e) {
    res.statusCode = 200; // el panel prefiere un aviso suave a un error duro
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify({ ok:false, tareas:[], traer:[],
      mensaje:'No se pudo leer la hoja de la escuela.', error:String(e && e.message || e) }));
  }
};
