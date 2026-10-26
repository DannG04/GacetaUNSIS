/* ==========================================================================
   El Unsito · main.js
   Las noticias se consultan en Lambda. El formulario solo sube imágenes a S3.
   El arreglo NOTICIAS se conserva como archivo de referencia, no se publica.
   ========================================================================== */

/* ==========================================================================
   1. DATOS · EDITA AQUÍ
   ========================================================================== */

/* Ciudad que aparece al inicio de la nota destacada y del lector */
const CIUDAD = 'Miahuatlán de Porfirio Díaz, Oax.';

/*
  NOTICIAS
  Campos de cada noticia:
    id         (obligatorio) identificador único, sin espacios ni acentos. Se usa en el enlace #nota-id
    titulo     (obligatorio)
    fecha      (obligatorio) formato AAAA-MM-DD. Las noticias se ordenan solas, de la más nueva a la más vieja
    categoria  (obligatorio) texto corto; los filtros se crean solos con las categorías que existan
    resumen    (obligatorio) una o dos frases para la tarjeta
    contenido  (opcional) texto completo: cada texto es un párrafo; un arreglo dentro es una lista
    imagen     (opcional) ruta de la foto, p. ej. 'imagenes/mi-foto.webp' (también sirve .jpg o .png)
    alt        (obligatorio si hay imagen) descripción de lo que se ve en la foto
    credito    (opcional) p. ej. 'Foto de archivo'
    portada    (opcional) si no hay foto: texto del letrero de la portada (si falta, se usa la categoría)
    tono       (opcional) color del letrero: 'rojo' (por defecto), 'azul', 'maiz' o 'tinta'
    enlaces    (opcional) lista de { texto, url } que aparecen al final de la nota
    destacada  (opcional) true para mostrarla en grande arriba. Si hay varias, se usa la más reciente
*/
const NOTICIAS = [
  {
    id: 'semana-culturas-2026',
    titulo: 'XVIII Semana de las Culturas de la Sierra Sur',
    fecha: '2026-10-05',
    categoria: 'Cultura',
    destacada: true,
    resumen: 'Del domingo 11 al viernes 16 de octubre, el Auditorio de la UNSIS se llena de conferencias, música, danza, teatro, documentales y exposiciones para celebrar la riqueza cultural y lingüística de nuestros pueblos. Entrada para la comunidad universitaria y el público en general.',
    contenido: [
      'La Universidad de la Sierra Sur invita a la comunidad universitaria y al público en general a la XVIII Semana de las Culturas de la Sierra Sur, un espacio para celebrar, reconocer y preservar la riqueza cultural y lingüística de nuestros pueblos. Las actividades son en el Auditorio de la UNSIS, salvo donde se indica otro lugar.',
      'Lo más destacado, día por día:',
      [
        'Domingo 11: inauguración a las 11:00, exposición pictórica «Visiones y raíces de María Sabina» del Colectivo Guiexhuuba (Flor de Maíz), expoventa artesanal y, a las 12:00, concierto de la Banda Filarmónica de Miahuatlán.',
        'Lunes 12: conferencia «Lenguas zapotecas de la Sierra Sur: ¿quién las puede rescatar?», con la Dra. Rosemary Beam de Azcona (ENAH), y a las 18:00 «Sones de la Sierra Sur».',
        'Martes 13: cortometraje «La piel de nuestra memoria» y, por la tarde, la obra «Diálogos de Sor Juana y Pita».',
        'Miércoles 14: panel «Saberes comunitarios y memoria ancestral» y concierto del dueto Las Díaz.',
        'Jueves 15: conferencia sobre las empresas comunitarias de conservación de la cuenca alta del río Copalita y danza con el grupo Herencia Viva de Suchixtepec.',
        'Viernes 16: conferencia y exhibición de juego de pelota mixteca (13:00, cancha de básquetbol) y clausura con la Banda Universitaria «Los Milpa Show».'
      ],
      '¡No te la pierdas! Es una invitación a valorar, compartir y promover la diversidad cultural y lingüística de la región.'
    ],
    imagen: 'imagenes/biblioteca-estudiantes.webp',
    alt: 'Estudiantes caminan por un andador frente a la Biblioteca de la UNSIS, un edificio rojo con techo de teja; a la derecha, un edificio blanco y cipreses.',
    credito: 'Foto de archivo',
    enlaces: [
      { texto: 'Ver el programa completo (PDF)', url: 'https://www.unsis.edu.mx/Semana_Culturas/2026/programa_XVIII_SCSS_2026.pdf' },
      { texto: 'Nota en unsis.edu.mx', url: 'https://www.unsis.edu.mx/web/node/552' }
    ]
  },
  {
    id: 'seminario-08-octubre-2026',
    titulo: 'Salud nutricional y bucal en comunidades indígenas de Miahuatlán',
    fecha: '2026-10-08',
    categoria: 'Seminarios',
    resumen: 'El seminario del jueves 8 de octubre presentó un protocolo de tamizaje y atención en salud nutricional y bucal para comunidades indígenas del municipio.',
    contenido: [
      'El tema del seminario del jueves 8 de octubre de 2026 fue el «Protocolo de tamizaje y atención en salud nutricional y bucal en comunidades indígenas de Miahuatlán de Porfirio Díaz, Oaxaca».',
      'El resumen completo está publicado en el Boletín Universitario.'
    ],
    portada: 'Instituto de Nutrición',
    tono: 'maiz',
    enlaces: [{ texto: 'Leer el resumen en unsis.edu.mx', url: 'https://www.unsis.edu.mx/web/cultura/publicaciones/boletin_universitario/resumen_08_octubre_2026' }]
  },
  {
    id: 'seminario-01-octubre-2026',
    titulo: 'La IA generativa y el futuro del desarrollo de software',
    fecha: '2026-10-01',
    categoria: 'Seminarios',
    resumen: '¿Cómo está cambiando la inteligencia artificial generativa la forma de hacer software? Ese fue el tema del seminario del 1 de octubre.',
    contenido: [
      'El seminario del jueves 1 de octubre de 2026 abordó «La inteligencia artificial generativa como motor de transformación en la industria del desarrollo de software».',
      'El resumen completo está publicado en el Boletín Universitario.'
    ],
    imagen: 'imagenes/clase-en-aula.webp',
    alt: 'Una profesora con saco rojo explica frente a un rotafolio a un grupo de estudiantes sentados en mesas acomodadas en U.',
    credito: 'Foto de archivo',
    enlaces: [{ texto: 'Leer el resumen en unsis.edu.mx', url: 'https://www.unsis.edu.mx/web/cultura/publicaciones/boletin_universitario/resumen_01_octubre_2026' }]
  },
  {
    id: 'resultados-propedeutico-2026',
    titulo: 'Ya están los resultados del curso propedéutico 2026',
    fecha: '2026-09-23',
    categoria: 'Admisión',
    resumen: 'Si hiciste el curso propedéutico, ya puedes consultar la lista de resultados en PDF o revisar tu resultado en el sistema de admisión.',
    contenido: [
      'La UNSIS publicó la lista de resultados del curso propedéutico 2026.',
      'Puedes consultarla de dos formas: descargando la lista completa en PDF o entrando al sistema de admisión con tus datos.'
    ],
    imagen: 'imagenes/salon-examen.webp',
    alt: 'Vista desde arriba de un salón amplio con decenas de estudiantes resolviendo un examen en escritorios individuales con separadores.',
    credito: 'Foto de archivo',
    enlaces: [
      { texto: 'Lista de resultados (PDF)', url: 'https://www.unsis.edu.mx/servicios_escolares/resultados/2026/Resultados_Prope_2026.pdf' },
      { texto: 'Consulta tu resultado', url: 'https://admision.unsis.edu.mx/' }
    ]
  },
  {
    id: 'seminario-10-septiembre-2026',
    titulo: 'Estrategias para ganar en el juego del Nim-O-Do',
    fecha: '2026-09-10',
    categoria: 'Seminarios',
    resumen: 'Matemáticas y juegos se cruzaron en el seminario del 10 de septiembre, dedicado a algunas estrategias del juego del Nim-O-Do.',
    contenido: [
      'El seminario del jueves 10 de septiembre de 2026 se tituló «Algunas estrategias del juego del Nim-O-Do».',
      'El resumen completo está publicado en el Boletín Universitario.'
    ],
    portada: 'Instituto de Informática',
    tono: 'azul',
    enlaces: [{ texto: 'Leer el resumen en unsis.edu.mx', url: 'https://www.unsis.edu.mx/web/cultura/publicaciones/boletin_universitario/resumen_10_septiembre_2026' }]
  },
  {
    id: 'seminario-03-septiembre-2026',
    titulo: 'Pluralismo religioso y gobernanza comunitaria indígena en Oaxaca',
    fecha: '2026-09-03',
    categoria: 'Seminarios',
    resumen: '«Entre el conflicto y la convivencia» fue el título del seminario del 3 de septiembre sobre religión y gobierno comunitario en Oaxaca.',
    contenido: [
      'El seminario del jueves 3 de septiembre de 2026 se tituló «Entre el conflicto y la convivencia: pluralismo religioso y gobernanza comunitaria indígena en Oaxaca».',
      'El resumen completo está publicado en el Boletín Universitario.'
    ],
    portada: 'Instituto de Estudios Municipales',
    tono: 'rojo',
    enlaces: [{ texto: 'Leer el resumen en unsis.edu.mx', url: 'https://www.unsis.edu.mx/web/cultura/publicaciones/boletin_universitario/resumen_03_septiembre_2026' }]
  },
  {
    id: 'seminario-27-agosto-2026',
    titulo: 'El Congreso de Oaxaca y el derecho humano al agua',
    fecha: '2026-08-27',
    categoria: 'Seminarios',
    resumen: 'El seminario del 27 de agosto analizó el trabajo legislativo en Oaxaca para proteger el derecho humano al agua.',
    contenido: [
      'El seminario del jueves 27 de agosto de 2026 presentó el «Análisis de las actividades parlamentarias del H. Congreso de la Unión del Estado de Oaxaca para la protección del Derecho Humano al Agua».',
      'El resumen completo está publicado en el Boletín Universitario.'
    ],
    portada: 'Instituto de Estudios Municipales',
    tono: 'tinta',
    enlaces: [{ texto: 'Leer el resumen en unsis.edu.mx', url: 'https://www.unsis.edu.mx/web/cultura/publicaciones/boletin_universitario/resumen_27_agosto_2026' }]
  },
  {
    id: 'congreso-ciencias-sociales-2026',
    titulo: 'Abierta la convocatoria del Congreso de Ciencias Sociales y Administrativas',
    fecha: '2026-08-04',
    categoria: 'Congresos',
    resumen: 'Del 11 al 13 de noviembre, el congreso «Gobierno, ciudadanía y tecnología para el desarrollo» reúne a estudiantes, académicos y servidores públicos.',
    contenido: [
      'La UNSIS, a través de la División de Estudios de Posgrado, convoca a estudiantes, académicos, investigadores, servidores públicos y profesionales a participar en el Congreso de Ciencias Sociales y Administrativas «Gobierno, ciudadanía y tecnología para el desarrollo», los días 11, 12 y 13 de noviembre de 2026.',
      'Los ejes del congreso:',
      ['Gobierno digital y tecnologías de la información.', 'Ciudadanía, democracia y desarrollo.', 'Innovación económica y desarrollo sostenible.'],
      'Las bases de participación están en la página del congreso.'
    ],
    imagen: 'imagenes/edificio-posgrado.webp',
    alt: 'Edificio de Posgrado de la UNSIS: fachada blanca con paneles rojos y grandes ventanales, jardines al frente y cielo azul.',
    credito: 'Foto de archivo',
    enlaces: [{ texto: 'Bases de participación', url: 'https://www.unsis.edu.mx/eventos/congresoCSA2026/' }]
  },
  {
    id: 'cisp-2026',
    titulo: 'Tercer Congreso Internacional de Salud Pública (CISP 2026)',
    fecha: '2026-08-04',
    categoria: 'Congresos',
    resumen: 'El 19 y 20 de noviembre, la UNSIS recibe el CISP 2026, un encuentro para compartir investigación e innovación sobre los desafíos de la salud pública.',
    contenido: [
      'La UNSIS, a través del Instituto de Investigación sobre la Salud Pública, invita a la comunidad académica, científica, al sector salud y a la sociedad en general al Tercer Congreso Internacional de Salud Pública (CISP 2026), el 19 y 20 de noviembre de 2026 en la Universidad de la Sierra Sur.',
      'Será un espacio para compartir conocimientos, experiencias, investigaciones e innovación, y fortalecer la colaboración frente a los principales desafíos de la salud pública.',
      'Informes: congresointernalsp.unsis@gmail.com'
    ],
    portada: 'Salud pública',
    tono: 'azul',
    enlaces: [{ texto: 'Página del congreso', url: 'https://www.unsis.edu.mx/eventos/congresoISP2026/' }]
  }
];

/*
  EVENTOS (agenda y convocatorias)
    inicio / fin   AAAA-MM-DD (si dura un día, pon la misma fecha o quita "fin")
    cierre         (opcional) fecha límite de una convocatoria
    cancelado      (opcional) true para marcarlo como cancelado
  El estado (Próximo, En curso, Concluido, Cierra pronto…) se calcula solo.
  Para probar otro día abre: index.html?hoy=2026-10-12
*/
const EVENTOS = [
  {
    titulo: 'XVIII Semana de las Culturas de la Sierra Sur',
    inicio: '2026-10-11',
    fin: '2026-10-16',
    lugar: 'Auditorio de la UNSIS',
    descripcion: 'Conferencias, música, danza, teatro, documentales, exposiciones y expoventa artesanal.',
    enlace: { texto: 'Ver el programa (PDF)', url: 'https://www.unsis.edu.mx/Semana_Culturas/2026/programa_XVIII_SCSS_2026.pdf' }
  },
  {
    titulo: 'Congreso de Ciencias Sociales y Administrativas',
    inicio: '2026-11-11',
    fin: '2026-11-13',
    lugar: 'Convoca la División de Estudios de Posgrado',
    descripcion: '«Gobierno, ciudadanía y tecnología para el desarrollo». Abierto a estudiantes, académicos y servidores públicos.',
    enlace: { texto: 'Bases de participación', url: 'https://www.unsis.edu.mx/eventos/congresoCSA2026/' }
  },
  {
    titulo: 'Tercer Congreso Internacional de Salud Pública (CISP 2026)',
    inicio: '2026-11-19',
    fin: '2026-11-20',
    lugar: 'Universidad de la Sierra Sur',
    descripcion: 'Organiza el Instituto de Investigación sobre la Salud Pública. Informes: congresointernalsp.unsis@gmail.com',
    enlace: { texto: 'Página del congreso', url: 'https://www.unsis.edu.mx/eventos/congresoISP2026/' }
  }
];

/*
  EGRESADOS · TESTIMONIOS DE EJEMPLO
  Son inventados para mostrar cómo se verá la sección. Reemplázalos por
  testimonios reales y cambia "ejemplo" a false para quitar la etiqueta.
*/
const EGRESADOS = [
  {
    nombre: 'Mariana López Santiago',
    carrera: 'Licenciatura en Enfermería',
    generacion: '2014–2019',
    hoy: 'Enfermera en un centro de salud de la Sierra Sur',
    cita: 'Las prácticas en comunidades me enseñaron a escuchar antes de atender. Eso lo uso todos los días.',
    ejemplo: true
  },
  {
    nombre: 'Jorge Ramírez Cruz',
    carrera: 'Licenciatura en Informática',
    generacion: '2012–2017',
    hoy: 'Desarrollador de software en Oaxaca',
    cita: 'En primer semestre la hora diaria de inglés se me hacía eterna. Hoy la uso en cada junta con clientes.',
    ejemplo: true
  },
  {
    nombre: 'Itzel Martínez Hernández',
    carrera: 'Licenciatura en Nutrición',
    generacion: '2016–2021',
    hoy: 'Nutrióloga con consultorio propio en Miahuatlán',
    cita: 'Me fui a hacer mi servicio social y regresé para quedarme. Aquí hace falta lo que aprendimos.',
    ejemplo: true
  }
];

/*
  CIFRAS CLAVE
  "ejemplo: true" muestra la etiqueta «Dato de ejemplo». Las demás cifras
  son reales (fuente: unsis.edu.mx). Los años se calculan solos.
*/
const CIFRAS = [
  { valor: () => aniosDesde('2000-10-02'), etiqueta: 'años desde el inicio de clases, el 2 de octubre de 2000' },
  { valor: 9, etiqueta: 'licenciaturas' },
  { valor: 5, etiqueta: 'posgrados: cuatro maestrías y un doctorado' },
  { valor: 4, etiqueta: 'institutos de investigación' },
  { valor: 2450, etiqueta: 'estudiantes inscritos', ejemplo: true },
  { valor: 6100, etiqueta: 'egresados', ejemplo: true }
];

/* REDES SOCIALES · deja la url vacía mientras no tengas el enlace oficial */
const REDES = [
  { nombre: 'Facebook', url: '' },
  { nombre: 'Instagram', url: '' },
  { nombre: 'YouTube', url: '' }
];

/* ==========================================================================
   2. UTILIDADES
   ========================================================================== */

const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio',
  'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
const MESES_CORTOS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
const UN_DIA = 24 * 60 * 60 * 1000;

/* Convierte 'AAAA-MM-DD' en fecha local (evita el desfase de zona horaria) */
function leerFecha(texto) {
  const [anio, mes, dia] = texto.split('-').map(Number);
  return new Date(anio, mes - 1, dia);
}

/* "Hoy" a medianoche. Se puede simular con ?hoy=AAAA-MM-DD en la dirección */
function obtenerHoy() {
  const simulado = new URLSearchParams(location.search).get('hoy');
  const hoy = simulado && /^\d{4}-\d{2}-\d{2}$/.test(simulado) ? leerFecha(simulado) : new Date();
  hoy.setHours(0, 0, 0, 0);
  return hoy;
}
const HOY = obtenerHoy();

/* 5 de octubre de 2026 */
function fechaLarga(texto) {
  const f = leerFecha(texto);
  return `${f.getDate()} de ${MESES[f.getMonth()]} de ${f.getFullYear()}`;
}

/* Del 11 al 16 de octubre de 2026 · 28 de octubre al 2 de noviembre de 2026 */
function rangoLargo(inicio, fin) {
  const a = leerFecha(inicio);
  const b = leerFecha(fin || inicio);
  if (a.getTime() === b.getTime()) return fechaLarga(inicio);
  if (a.getMonth() === b.getMonth()) {
    return `Del ${a.getDate()} al ${b.getDate()} de ${MESES[b.getMonth()]} de ${b.getFullYear()}`;
  }
  return `Del ${a.getDate()} de ${MESES[a.getMonth()]} al ${b.getDate()} de ${MESES[b.getMonth()]} de ${b.getFullYear()}`;
}

function diasEntre(desde, hasta) {
  return Math.round((hasta - desde) / UN_DIA);
}

function aniosDesde(texto) {
  const f = leerFecha(texto);
  let anios = HOY.getFullYear() - f.getFullYear();
  const aniversario = new Date(HOY.getFullYear(), f.getMonth(), f.getDate());
  if (HOY < aniversario) anios -= 1;
  return anios;
}

/* Escapa texto para insertarlo de forma segura en HTML */
function escapar(texto) {
  return String(texto ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

const numero = new Intl.NumberFormat('es-MX');

/* Revisa que cada noticia tenga sus campos; avisa en la consola si falta algo */
function validarNoticias(lista) {
  const ids = new Set();
  return lista.filter((n, i) => {
    const faltan = ['id', 'titulo', 'fecha', 'categoria', 'resumen'].filter((c) => !n[c]);
    // Una descripción ausente no impide mostrar una noticia antigua.
    if (faltan.length) {
      console.warn(`Noticia #${i + 1} ("${n.titulo || 'sin título'}"): faltan ${faltan.join(', ')}. No se mostrará.`);
      return false;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(n.fecha)) {
      console.warn(`Noticia "${n.titulo}": la fecha debe tener el formato AAAA-MM-DD.`);
      return false;
    }
    if (ids.has(n.id)) console.warn(`Hay dos noticias con el id "${n.id}". Cámbialo para que sea único.`);
    ids.add(n.id);
    return true;
  });
}

/* ==========================================================================
   3. NOTICIAS
   ========================================================================== */

let noticias = [];
let destacada;
let recientes = [];

const POR_PAGINA = 6;
let categoriaActiva = 'Todas';
let visibles = POR_PAGINA;

/* Portada: la foto, o un letrero tipográfico si la nota no tiene foto */
function htmlPortada(n, { prioridad = false } = {}) {
  if (n.imagen) {
    const carga = prioridad ? 'fetchpriority="high"' : 'loading="lazy"';
    return `<img src="${escapar(n.imagen)}" alt="${escapar(n.alt)}" ${carga} decoding="async" width="1055" height="430" data-portada="${escapar(n.id)}">`;
  }
  return htmlLetrero(n);
}

function htmlLetrero(n) {
  const tono = ['rojo', 'azul', 'maiz', 'tinta'].includes(n.tono) ? n.tono : 'rojo';
  return `<div class="portada-letrero portada-letrero--${tono}" aria-hidden="true">
            <span class="portada-letrero__banda">${escapar(n.portada || n.categoria)}</span>
          </div>`;
}

/* Si una foto no carga (ruta mal escrita), se cambia por el letrero */
function vigilarImagenes(contenedor) {
  contenedor.querySelectorAll('img[data-portada]').forEach((img) => {
    img.addEventListener('error', () => {
      const n = noticias.find((x) => x.id === img.dataset.portada);
      console.warn(`No se encontró la imagen "${img.getAttribute('src')}". Revisa la ruta en NOTICIAS.`);
      if (n) img.outerHTML = htmlLetrero(n);
    }, { once: true });
  });
}

function pintarDestacada() {
  const caja = document.getElementById('destacada');
  if (!caja) return;
  if (!destacada) { caja.innerHTML = '<p>No hay una noticia destacada disponible.</p>'; return; }
  const n = destacada;
  const enlaceExtra = n.enlaces && n.enlaces[0]
    ? `<a class="boton boton--contorno" href="${escapar(n.enlaces[0].url)}">${escapar(n.enlaces[0].texto)}</a>`
    : '';

  caja.innerHTML = `
    <figure class="destacada__foto">
      ${htmlPortada(n, { prioridad: true })}
      ${n.imagen && n.credito ? `<figcaption class="destacada__credito">${escapar(n.credito)}</figcaption>` : ''}
    </figure>
    <div class="destacada__letrero">
      <p class="destacada__meta">
        <span class="destacada__categoria">${escapar(n.categoria)}</span>
        <time datetime="${escapar(n.fecha)}">${fechaLarga(n.fecha)}</time>
      </p>
      <h2 class="destacada__titulo" id="destacada-titulo">${escapar(n.titulo)}</h2>
    </div>
    <div class="destacada__texto">
      <p class="destacada__entrada"><span class="lugar">${escapar(CIUDAD)}</span> ${escapar(n.resumen)}</p>
      <div class="destacada__acciones">
        <a class="boton" href="#nota-${escapar(n.id)}">Leer la nota</a>
        ${enlaceExtra}
      </div>
    </div>`;
  vigilarImagenes(caja);
}

function pintarFiltros() {
  const caja = document.getElementById('filtros');
  if (!caja) return;
  const categorias = ['Todas', ...new Set(recientes.map((n) => n.categoria))];
  caja.innerHTML = categorias.map((c) => `
    <button class="filtro" type="button" data-categoria="${escapar(c)}" aria-pressed="${c === categoriaActiva}">${escapar(c)}</button>`).join('');

  caja.onclick = (evento) => {
    const boton = evento.target.closest('.filtro');
    if (!boton) return;
    categoriaActiva = boton.dataset.categoria;
    visibles = POR_PAGINA;
    caja.querySelectorAll('.filtro').forEach((b) => b.setAttribute('aria-pressed', String(b === boton)));
    pintarNoticias(true);
  };
}

function htmlTarjeta(n) {
  return `
    <article class="tarjeta">
      <div class="tarjeta__portada">${htmlPortada(n)}</div>
      <div class="tarjeta__cuerpo">
        <h3 class="tarjeta__titulo"><a class="tarjeta__enlace" href="#nota-${escapar(n.id)}">${escapar(n.titulo)}</a></h3>
        <p class="meta tarjeta__meta">
          <span class="meta__categoria">${escapar(n.categoria)}</span>
          <time datetime="${escapar(n.fecha)}">${fechaLarga(n.fecha)}</time>
        </p>
        <p class="tarjeta__resumen">${escapar(n.resumen)}</p>
      </div>
    </article>`;
}

function pintarNoticias(anunciar = false) {
  const caja = document.getElementById('lista-noticias');
  const botonMas = document.getElementById('ver-mas');
  const estado = document.getElementById('noticias-estado');
  if (!caja) return;

  const filtradas = categoriaActiva === 'Todas'
    ? recientes
    : recientes.filter((n) => n.categoria === categoriaActiva);
  const mostrar = filtradas.slice(0, visibles);

  caja.innerHTML = mostrar.length
    ? mostrar.map(htmlTarjeta).join('')
    : '<p class="noticias__vacio">Todavía no hay noticias en esta categoría.</p>';
  vigilarImagenes(caja);

  botonMas.hidden = filtradas.length <= visibles;
  if (anunciar && estado) {
    const que = categoriaActiva === 'Todas' ? 'todas las categorías' : categoriaActiva;
    estado.textContent = `Mostrando ${mostrar.length} de ${filtradas.length} noticias de ${que}.`;
  }
}

function prepararVerMas() {
  const boton = document.getElementById('ver-mas');
  if (!boton) return;
  boton.addEventListener('click', () => {
    const antes = visibles;
    visibles += POR_PAGINA;
    pintarNoticias(true);
    // Lleva el foco a la primera noticia nueva para seguir leyendo con teclado
    const nueva = document.querySelectorAll('#lista-noticias .tarjeta__enlace')[antes];
    if (nueva) nueva.focus();
  });
}

/* ==========================================================================
   4. LECTOR DE NOTAS (dialog)
   ========================================================================== */

const lector = document.getElementById('lector');
let origenDelFoco = null;

function htmlContenido(contenido, resumen) {
  const bloques = contenido && contenido.length ? contenido : [resumen];
  return bloques.map((b) => Array.isArray(b)
    ? `<ul>${b.map((item) => `<li>${escapar(item)}</li>`).join('')}</ul>`
    : `<p>${escapar(b)}</p>`).join('');
}

function abrirNota(id) {
  const n = noticias.find((x) => x.id === id);
  if (!n || !lector) return;
  origenDelFoco = document.activeElement;

  const enlaces = (n.enlaces || []).map((e, i) =>
    `<a class="boton${i ? ' boton--contorno' : ''}" href="${escapar(e.url)}">${escapar(e.texto)}</a>`).join('');

  document.getElementById('lector-contenido').innerHTML = `
    <div class="lector__portada">${htmlPortada(n)}</div>
    ${n.imagen && n.credito ? `<p class="lector__credito">${escapar(n.credito)}</p>` : ''}
    <p class="meta">
      <span class="meta__categoria">${escapar(n.categoria)}</span>
      <time datetime="${escapar(n.fecha)}">${fechaLarga(n.fecha)}</time>
    </p>
    <h2 class="lector__titulo" id="lector-titulo">${escapar(n.titulo)}</h2>
    <p><span class="lugar">${escapar(CIUDAD)}</span></p>
    ${htmlContenido(n.contenido, n.resumen)}
    ${enlaces ? `<div class="lector__enlaces">${enlaces}</div>` : ''}`;
  vigilarImagenes(lector);

  if (!lector.open) lector.showModal();
  lector.scrollTop = 0;
  history.replaceState(null, '', `#nota-${id}`);
}

function cerrarNota() {
  if (lector && lector.open) lector.close();
}

function prepararLector() {
  if (!lector) return;

  // Cualquier enlace #nota-... abre el lector en lugar de saltar
  document.addEventListener('click', (evento) => {
    const enlace = evento.target.closest('a[href^="#nota-"]');
    if (!enlace) return;
    evento.preventDefault();
    abrirNota(enlace.getAttribute('href').replace('#nota-', ''));
  });

  lector.querySelector('[data-cerrar]').addEventListener('click', cerrarNota);

  // Clic fuera del recuadro (en el fondo oscuro) cierra
  lector.addEventListener('click', (evento) => {
    if (evento.target === lector) cerrarNota();
  });

  // Al cerrar (botón, Esc o fondo): limpia la dirección y regresa el foco
  lector.addEventListener('close', () => {
    history.replaceState(null, '', location.pathname + location.search);
    if (origenDelFoco && document.contains(origenDelFoco)) origenDelFoco.focus();
  });

  // Si la página se abre con #nota-id (enlace compartido), abre esa nota
  const abrirDesdeDireccion = () => {
    if (location.hash.startsWith('#nota-')) abrirNota(decodeURIComponent(location.hash.slice(6)));
  };
  window.addEventListener('hashchange', abrirDesdeDireccion);
  abrirDesdeDireccion();
}

/* ==========================================================================
   5. AGENDA
   ========================================================================== */

/* Calcula el estado de un evento según la fecha de hoy */
function estadoEvento(e) {
  const inicio = leerFecha(e.inicio);
  const fin = leerFecha(e.fin || e.inicio);

  if (e.cancelado) return { texto: 'Cancelado', tipo: 'error', orden: 3 };

  if (e.cierre) {
    const cierre = leerFecha(e.cierre);
    const faltan = diasEntre(HOY, cierre);
    if (faltan < 0) return { texto: 'Convocatoria cerrada', tipo: 'neutro', orden: 2 };
    if (faltan <= 7) return { texto: faltan === 0 ? 'Cierra hoy' : `Cierra en ${faltan} ${faltan === 1 ? 'día' : 'días'}`, tipo: 'aviso', orden: 0 };
  }

  if (HOY > fin) return { texto: 'Concluido', tipo: 'neutro', orden: 2 };
  if (HOY >= inicio) return { texto: 'En curso', tipo: 'exito', orden: 0 };

  const faltan = diasEntre(HOY, inicio);
  if (faltan === 1) return { texto: 'Empieza mañana', tipo: 'info', orden: 1 };
  if (faltan <= 14) return { texto: `Empieza en ${faltan} días`, tipo: 'info', orden: 1 };
  return { texto: 'Próximo', tipo: 'info', orden: 1 };
}

/* Bloque de fecha: "11–16 / oct" o "28 oct – 2 nov" */
function htmlFechaEvento(e) {
  const a = leerFecha(e.inicio);
  const b = leerFecha(e.fin || e.inicio);
  let dias;
  let mes;
  if (a.getTime() === b.getTime()) {
    dias = a.getDate(); mes = MESES_CORTOS[a.getMonth()];
  } else if (a.getMonth() === b.getMonth()) {
    dias = `${a.getDate()}–${b.getDate()}`; mes = MESES_CORTOS[a.getMonth()];
  } else {
    dias = `${a.getDate()}–${b.getDate()}`; mes = `${MESES_CORTOS[a.getMonth()]}–${MESES_CORTOS[b.getMonth()]}`;
  }
  return `<div class="evento__fecha" aria-hidden="true">
            <span class="evento__dias">${dias}</span>
            <span class="evento__mes">${mes}</span>
          </div>`;
}

function pintarAgenda() {
  const caja = document.getElementById('lista-agenda');
  if (!caja) return;

  const eventos = EVENTOS
    .map((e) => ({ ...e, estado: estadoEvento(e) }))
    .sort((x, y) => x.estado.orden - y.estado.orden || leerFecha(x.inicio) - leerFecha(y.inicio));

  caja.innerHTML = eventos.map((e) => `
    <li class="evento${e.estado.orden === 2 ? ' evento--concluido' : ''}">
      ${htmlFechaEvento(e)}
      <div class="evento__cuerpo">
        <h3 class="evento__titulo">${escapar(e.titulo)}</h3>
        <span class="estado estado--${e.estado.tipo}">${escapar(e.estado.texto)}</span>
        <p class="evento__lugar"><time datetime="${escapar(e.inicio)}">${rangoLargo(e.inicio, e.fin)}</time> · ${escapar(e.lugar)}</p>
        ${e.descripcion ? `<p class="evento__descripcion">${escapar(e.descripcion)}</p>` : ''}
        ${e.enlace ? `<a class="evento__enlace enlace-flecha" href="${escapar(e.enlace.url)}">${escapar(e.enlace.texto)}</a>` : ''}
      </div>
    </li>`).join('');
}

/* ==========================================================================
   6. EGRESADOS, CIFRAS Y REDES
   ========================================================================== */

function pintarEgresados() {
  const caja = document.getElementById('testimonios');
  if (!caja) return;
  caja.innerHTML = EGRESADOS.map((e) => `
    <li>
      <figure class="testimonio">
        <blockquote><p>${escapar(e.cita)}</p></blockquote>
        <figcaption>
          <span class="testimonio__nombre">${escapar(e.nombre)}</span>
          <span class="testimonio__dato">${escapar(e.carrera)}, generación ${escapar(e.generacion)}</span>
          <span class="testimonio__dato">${escapar(e.hoy)}</span>
          ${e.ejemplo ? '<span class="marcador">Testimonio de ejemplo</span>' : ''}
        </figcaption>
      </figure>
    </li>`).join('');
}

function pintarCifras() {
  const caja = document.getElementById('cifras');
  if (!caja) return;
  caja.innerHTML = CIFRAS.map((c) => {
    const valor = typeof c.valor === 'function' ? c.valor() : c.valor;
    return `
      <div class="cifra">
        <dt>${escapar(c.etiqueta)}${c.ejemplo ? '<br><span class="marcador">Dato de ejemplo</span>' : ''}</dt>
        <dd>${numero.format(valor)}</dd>
      </div>`;
  }).join('');
}

function pintarRedes() {
  const caja = document.getElementById('redes');
  if (!caja) return;
  caja.innerHTML = REDES.map((r) => r.url
    ? `<li><a href="${escapar(r.url)}">${escapar(r.nombre)}</a></li>`
    : `<li>${escapar(r.nombre)} <span class="marcador">[PENDIENTE: enlace]</span></li>`).join('');
  const anio = document.getElementById('anio');
  if (anio) anio.textContent = String(new Date().getFullYear());
}

/* ==========================================================================
   7. NAVEGACIÓN: menú móvil y sección activa
   ========================================================================== */

function prepararMenu() {
  const boton = document.querySelector('.menu-boton');
  const menu = document.getElementById('menu-principal');
  if (!boton || !menu) return;

  const abrir = (si) => boton.setAttribute('aria-expanded', String(si));
  const estaAbierto = () => boton.getAttribute('aria-expanded') === 'true';

  boton.addEventListener('click', () => abrir(!estaAbierto()));

  // Al elegir una sección se cierra el menú
  menu.addEventListener('click', (evento) => {
    if (evento.target.closest('a')) abrir(false);
  });

  // Esc cierra y regresa el foco al botón
  document.addEventListener('keydown', (evento) => {
    if (evento.key === 'Escape' && estaAbierto()) {
      abrir(false);
      boton.focus();
    }
  });

  // Clic fuera del encabezado cierra
  document.addEventListener('click', (evento) => {
    if (estaAbierto() && !evento.target.closest('.encabezado')) abrir(false);
  });

  // Al pasar a escritorio se resetea
  window.matchMedia('(min-width: 48rem)').addEventListener('change', () => abrir(false));
}

/* Marca en el menú la sección que se está viendo */
function prepararSeccionActiva() {
  if (!('IntersectionObserver' in window)) return;
  const enlaces = [...document.querySelectorAll('.navegacion__enlace')];
  const secciones = enlaces
    .map((a) => document.querySelector(a.getAttribute('href')))
    .filter(Boolean);

  const observador = new IntersectionObserver((entradas) => {
    entradas.forEach((entrada) => {
      if (!entrada.isIntersecting) return;
      enlaces.forEach((a) => {
        const activo = a.getAttribute('href') === `#${entrada.target.id}`;
        a.classList.toggle('es-activo', activo);
        if (activo) a.setAttribute('aria-current', 'location');
        else a.removeAttribute('aria-current');
      });
    });
  }, { rootMargin: '-45% 0px -50% 0px' });

  secciones.forEach((s) => observador.observe(s));
}

/* ==========================================================================
   8. INICIO
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  pintarDestacada();
  pintarFiltros();
  pintarNoticias();
  prepararVerMas();
  pintarCifras();
  pintarEgresados();
  pintarAgenda();
  pintarRedes();
  prepararMenu();
  prepararSeccionActiva();
  prepararLector();
  prepararPublicacion();
  document.getElementById('recargar-noticias')?.addEventListener('click', cargarNoticias);
  if (document.getElementById('lista-noticias')) cargarNoticias();
});

/* Integración AWS. Consulta INTEGRACION-S3.md para el contrato de las Lambda. */
const API_NOTICIAS = Object.freeze({
  obtener: 'https://kewecagxxd44porzgzstv37g5q0nsays.lambda-url.us-east-2.on.aws/',
  agregar: 'https://ufepu6szpto7mzedlr4isb3uiu0rzubq.lambda-url.us-east-2.on.aws/',
  prefirmar: 'https://krveeq3gnhqdy3r3kuyfhubrim0olhaw.lambda-url.us-east-2.on.aws/'
});

async function solicitarJSON(url, opciones = {}) {
  let respuesta;
  try {
    respuesta = await fetch(url, { ...opciones, signal: AbortSignal.timeout(30000) });
  } catch (error) {
    const servicio = new URL(url).origin === new URL(API_NOTICIAS.prefirmar).origin ? 'la Lambda de URLs prefirmadas' : url === API_NOTICIAS.agregar ? 'la Lambda de agregar noticias' : 'la Lambda de obtener noticias';
    console.error(`Falló la conexión con ${servicio}`, { url, error });
    throw new Error(`No se pudo completar la conexión con ${servicio}. Revisa la pestaña Red del navegador y la configuración CORS de esa Lambda.`);
  }
  const texto = await respuesta.text();
  let datos;
  try { datos = texto ? JSON.parse(texto) : {}; }
  catch { throw new Error(`La Lambda devolvió una respuesta que no es JSON (HTTP ${respuesta.status}).`); }
  if (!respuesta.ok) throw new Error(datos.message || datos.error || `Error HTTP ${respuesta.status}.`);
  // Admite respuesta directa y envoltura de API Gateway.
  if (datos && typeof datos.body === 'string') {
    if (Number(datos.statusCode) >= 400) throw new Error(`La Lambda devolvió error ${datos.statusCode}.`);
    datos = JSON.parse(datos.body);
  }
  if (datos?.error) throw new Error(String(datos.error));
  return datos;
}

function urlSegura(valor) {
  if (typeof valor !== 'string' || !valor.trim()) return '';
  try {
    const url = new URL(valor, location.href);
    return ['http:', 'https:'].includes(url.protocol) ? url.href : '';
  } catch { return ''; }
}

function normalizarNoticia(n) {
  if (!n || typeof n !== 'object' || Array.isArray(n)) return {};
  const texto = valor => typeof valor === 'string' ? valor.trim() : '';
  const detalle = texto(n.detalle) || texto(n.detalles);
  const contenido = Array.isArray(n.contenido)
    ? n.contenido.filter(b => typeof b === 'string' || Array.isArray(b))
    : (texto(n.contenido) || detalle).split(/\n\s*\n/).filter(Boolean);
  const cuerpo = contenido.flat().filter(b => typeof b === 'string').join(' ').trim();
  // Los registros antiguos pueden no incluir resumen, categoría o descripción.
  return {
    ...n,
    id: typeof n.id === 'string' || typeof n.id === 'number' ? String(n.id).trim() : '',
    titulo: texto(n.titulo),
    fecha: texto(n.fecha).replace(/^(\d{4}-\d{2}-\d{2})T.*$/, '$1'),
    categoria: texto(n.categoria) || 'General',
    resumen: texto(n.resumen) || cuerpo.slice(0, 280) || 'Abre la noticia para consultar la información disponible.',
    contenido,
    imagen: urlSegura(n.imagen),
    alt: texto(n.alt),
    enlaces: Array.isArray(n.enlaces) ? n.enlaces.filter(e => e && typeof e === 'object').map(e => ({ texto: texto(e.texto) || 'Más información', url: urlSegura(e.url) })).filter(e => e.url) : []
  };
}

let cargandoNoticias = false;
async function cargarNoticias() {
  if (cargandoNoticias) return false;
  cargandoNoticias = true;
  const estado = document.getElementById('noticias-estado');
  const boton = document.getElementById('recargar-noticias');
  const lista = document.getElementById('lista-noticias');
  boton.disabled = true;
  lista.setAttribute('aria-busy', 'true');
  estado.textContent = 'Cargando noticias…';
  try {
    const datos = await solicitarJSON(API_NOTICIAS.obtener, { cache: 'no-store' });
    const entradas = Array.isArray(datos) ? datos : datos.noticias ?? datos.items;
    if (!Array.isArray(entradas)) throw new Error('La Lambda debe devolver un arreglo o un objeto con noticias.');
    const normalizadas = entradas.map(normalizarNoticia);
    const validas = validarNoticias(normalizadas);
    const omitidas = entradas.length - validas.length;
    noticias = validas.sort((a, b) => leerFecha(b.fecha) - leerFecha(a.fecha));
    destacada = noticias.find(n => n.destacada) || noticias[0];
    recientes = noticias.filter(n => n !== destacada);
    categoriaActiva = 'Todas';
    visibles = POR_PAGINA;
    pintarDestacada();
    pintarFiltros();
    pintarNoticias();
    estado.textContent = noticias.length ? `${noticias.length} noticias cargadas.` : 'Todavía no hay noticias publicadas.';
    if (omitidas) estado.textContent = `${noticias.length} noticias cargadas. Se omitieron ${omitidas} registros sin identificador, título o fecha válida. Revisa los avisos de la consola para identificarlos.`;
    if (location.hash.startsWith('#nota-') && !lector?.open) abrirNota(decodeURIComponent(location.hash.slice(6)));
    return true;
  } catch (error) {
    estado.textContent = `No se pudieron actualizar las noticias. ${error.message} Puedes volver a intentarlo con Actualizar noticias.`;
    return false;
  } finally {
    cargandoNoticias = false;
    boton.disabled = false;
    lista.removeAttribute('aria-busy');
  }
}

async function subirImagen(archivo) {
  // La Lambda lee event.queryStringParameters.file y devuelve uploadUrl.
  const endpoint = new URL(API_NOTICIAS.prefirmar);
  endpoint.searchParams.set('file', archivo.name);
  const datos = await solicitarJSON(endpoint.href, { method: 'POST' });
  const uploadUrl = urlSegura(datos.uploadUrl || datos.presignedUrl);
  const imagen = urlSegura(datos.imageUrl || datos.publicUrl);
  if (!uploadUrl) throw new Error('La Lambda de prefirmadas debe devolver uploadUrl o presignedUrl.');
  let respuesta;
  try {
    respuesta = await fetch(uploadUrl, {
      method: 'PUT', headers: { 'Content-Type': archivo.type }, body: archivo,
      signal: AbortSignal.timeout(120000)
    });
  } catch (error) {
    console.error('Falló la subida de la imagen a S3', error);
    throw new Error('No se pudo completar la subida de la imagen a S3. Revisa CORS del bucket de imágenes y la vigencia de la URL prefirmada.');
  }
  if (!respuesta.ok) throw new Error(`No se pudo subir la imagen a S3 (HTTP ${respuesta.status}).`);
  const objeto = new URL(uploadUrl);
  objeto.search = '';
  objeto.hash = '';
  return imagen || objeto.href;
}

// Identificador de noticia compatible con sitios S3 servidos por HTTP.
function crearIdNoticia() {
  if (typeof globalThis.crypto?.randomUUID === 'function') return globalThis.crypto.randomUUID();
  const bytes = new Uint8Array(16);
  if (typeof globalThis.crypto?.getRandomValues === 'function') {
    globalThis.crypto.getRandomValues(bytes);
  } else {
    // Se utiliza para identificar noticias, no para autenticación ni secretos.
    for (let i = 0; i < bytes.length; i++) bytes[i] = Math.floor(Math.random() * 256);
  }
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

function prepararPublicacion() {
  const formulario = document.getElementById('formulario-noticia');
  if (!formulario) return;
  const campos = formulario.elements;
  const hoy = new Date();
  const fechaHoy = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`;
  campos.fecha.value = fechaHoy;
  let enviando = false;
  let imagenSubida = '';
  let idPendiente = null;
  campos.archivo.addEventListener('change', () => { imagenSubida = ''; });
  formulario.addEventListener('submit', async evento => {
    evento.preventDefault();
    if (enviando || !formulario.reportValidity()) return;
    const estado = document.getElementById('publicacion-estado');
    const archivo = campos.archivo.files[0];
    if (['titulo', 'categoria', 'detalle'].some(nombre => !campos[nombre].value.trim())) {
      estado.textContent = 'Completa título, categoría y detalle.'; return;
    }
    if (archivo && (!['image/jpeg', 'image/png', 'image/webp'].includes(archivo.type) || archivo.size === 0 || archivo.size > 10 * 1024 * 1024)) {
      estado.textContent = 'Selecciona una imagen JPG, PNG o WebP de máximo 10 MB.'; return;
    }
    if (archivo && !campos.alt.value.trim()) {
      estado.textContent = 'Agrega una descripción de la imagen.'; campos.alt.focus(); return;
    }
    enviando = true;
    document.getElementById('campos-noticia').disabled = true;
    let guardada = false;
    try {
      if (archivo && !imagenSubida) {
        estado.textContent = 'Subiendo imagen…';
        imagenSubida = await subirImagen(archivo);
      }
      if (!idPendiente) idPendiente = crearIdNoticia();
      estado.textContent = 'Guardando noticia…';
      await solicitarJSON(API_NOTICIAS.agregar, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: idPendiente, titulo: campos.titulo.value.trim(), detalle: campos.detalle.value.trim(),
          fecha: campos.fecha.value, categoria: campos.categoria.value.trim(),
          imagen: archivo ? imagenSubida : '', alt: campos.alt.value.trim()
        })
      });
      guardada = true;
      formulario.reset();
      campos.fecha.value = fechaHoy;
      imagenSubida = '';
      idPendiente = null;
      const actualizada = await cargarNoticias();
      estado.textContent = actualizada ? 'Noticia publicada correctamente.' : 'Noticia guardada. No se pudo actualizar la lista; pulsa Actualizar noticias.';
    } catch (error) {
      estado.textContent = guardada ? 'Noticia guardada. Actualiza la lista.' : `No se confirmó la publicación. ${error.message} Tus datos se conservaron.`;
    } finally {
      enviando = false;
      document.getElementById('campos-noticia').disabled = false;
    }
  });
}
