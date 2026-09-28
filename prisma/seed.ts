import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

import { PrismaClient } from "../generated/prisma/client";
import { entorno } from "../src/config/entorno";

/**
 * Carga en la base de datos el contenido que hoy está escrito a mano en
 * Frontend/src/lib. Es idempotente: se puede ejecutar varias veces sin
 * duplicar registros.
 *
 * TODO (Alikai): estos textos y cifras siguen siendo provisionales. Al
 * reemplazarlos por los reales, actualizarlos aquí o desde el panel de
 * administración.
 */

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: entorno.DATABASE_URL }),
});

const areas = [
  {
    slug: "tecnologia",
    nombre: "Tecnología",
    nombreCorto: "Tecnología",
    lema: "Conectividad que abre puertas",
    resumen:
      "Llevamos internet, equipos y alfabetización digital a zonas donde la señal todavía no llega.",
    descripcion: [
      "En muchas comunidades rurales del Perú, la falta de conectividad es hoy una forma de exclusión: sin señal no hay trámites, ni telemedicina, ni acceso a materiales educativos. Nuestra área de Tecnología trabaja para cerrar esa brecha con soluciones que la propia comunidad pueda mantener.",
      "Instalamos puntos de acceso a internet en escuelas y locales comunales, habilitamos aulas de cómputo con equipos reacondicionados y formamos a docentes y jóvenes para que se conviertan en referentes digitales de su localidad.",
    ].join("\n\n"),
    icono: "Wifi",
    tema: "marino",
    indicadorValor: "18",
    indicadorEtiqueta: "escuelas conectadas",
    orden: 0,
    objetivos: [
      "Instalar y sostener puntos de conexión a internet en escuelas y locales comunales.",
      "Habilitar aulas de cómputo con equipos reacondicionados y software libre.",
      "Formar promotores digitales locales capaces de dar soporte sin apoyo externo.",
      "Acompañar a familias en el uso de servicios digitales del Estado y la banca.",
    ],
    programas: [
      {
        titulo: "Aula Conectada",
        descripcion:
          "Conectividad, equipos y capacitación docente para que una escuela rural integre herramientas digitales a su currículo.",
      },
      {
        titulo: "Promotores Digitales",
        descripcion:
          "Formación técnica para jóvenes de la comunidad que asumen el mantenimiento de los equipos y orientan a sus vecinos.",
      },
      {
        titulo: "Reacondiciona",
        descripcion:
          "Recuperamos computadoras donadas por empresas, las reparamos y las destinamos a centros educativos.",
      },
    ],
  },
  {
    slug: "salud",
    nombre: "Salud",
    nombreCorto: "Salud",
    lema: "Atención donde no llega la posta",
    resumen:
      "Brigadas médicas, prevención y telemedicina para comunidades alejadas de los servicios de salud.",
    descripcion: [
      "Llegar a un centro de salud puede significar varias horas de camino o de río. El área de Salud organiza brigadas con profesionales voluntarios que atienden en el propio territorio, priorizando la prevención antes que la emergencia.",
      "Complementamos las campañas presenciales con teleconsultas apoyadas en los puntos de conectividad que instalamos, y con la formación de agentes comunitarios de salud que dan seguimiento durante todo el año.",
    ].join("\n\n"),
    icono: "HeartPulse",
    tema: "selva",
    indicadorValor: "5 800",
    indicadorEtiqueta: "atenciones médicas",
    orden: 1,
    objetivos: [
      "Realizar campañas de atención primaria, odontológica y oftalmológica en comunidades alejadas.",
      "Reducir la anemia y la desnutrición infantil con tamizaje y acompañamiento nutricional.",
      "Habilitar teleconsultas con especialistas para casos que requieren derivación.",
      "Formar agentes comunitarios de salud que sostengan la prevención localmente.",
    ],
    programas: [
      {
        titulo: "Brigadas Alikai",
        descripcion:
          "Jornadas de atención integral con médicos, odontólogos, obstetras y psicólogos voluntarios.",
      },
      {
        titulo: "Cero Anemia",
        descripcion:
          "Tamizaje de hemoglobina, suplementación y talleres de alimentación con productos de la zona.",
      },
      {
        titulo: "Salud Conectada",
        descripcion:
          "Teleconsultas periódicas entre agentes comunitarios y especialistas en Lima para seguimiento de casos.",
      },
    ],
  },
  {
    slug: "educacion",
    nombre: "Educación",
    nombreCorto: "Educación",
    lema: "Aprender sin importar dónde naciste",
    resumen:
      "Refuerzo escolar, becas y formación docente para cerrar la brecha de aprendizajes.",
    descripcion: [
      "La educación es el eje que conecta todas nuestras áreas. Trabajamos con escuelas públicas para reforzar comprensión lectora y matemática, acompañar a estudiantes en riesgo de deserción y fortalecer las capacidades de los docentes.",
      "Nuestro enfoque es intercultural y bilingüe donde corresponde: aprender no debe significar renunciar a la lengua ni a la identidad de origen.",
    ].join("\n\n"),
    icono: "BookOpen",
    tema: "marino",
    indicadorValor: "2 300",
    indicadorEtiqueta: "estudiantes acompañados",
    orden: 2,
    objetivos: [
      "Elevar los niveles de comprensión lectora y matemática en primaria y secundaria.",
      "Reducir la deserción escolar mediante acompañamiento y becas de permanencia.",
      "Fortalecer las capacidades pedagógicas de docentes rurales.",
      "Garantizar materiales educativos pertinentes y en lengua originaria cuando corresponde.",
    ],
    programas: [
      {
        titulo: "Refuerzo Escolar",
        descripcion:
          "Talleres de lectura y matemática fuera del horario de clases, a cargo de docentes y voluntarios formados.",
      },
      {
        titulo: "Becas Alikai",
        descripcion:
          "Apoyo económico y tutoría para estudiantes destacados en situación de vulnerabilidad.",
      },
      {
        titulo: "Maestros que Inspiran",
        descripcion:
          "Formación continua y comunidades de aprendizaje entre docentes de escuelas rurales.",
      },
    ],
  },
  {
    slug: "agricultura-sostenible",
    nombre: "Agricultura Sostenible",
    nombreCorto: "Agricultura",
    lema: "Tierra que alimenta y genera ingresos",
    resumen:
      "Huertos, riego eficiente y acceso a mercados para pequeños productores familiares.",
    descripcion: [
      "La agricultura familiar produce buena parte de los alimentos del país en condiciones muy desiguales. Acompañamos a pequeños productores para mejorar sus rendimientos sin degradar el suelo, y para vender en mejores condiciones.",
      "Promovemos prácticas agroecológicas, manejo eficiente del agua, recuperación de cultivos andinos y amazónicos, y asociatividad para negociar precios justos.",
    ].join("\n\n"),
    icono: "Sprout",
    tema: "selva",
    indicadorValor: "640",
    indicadorEtiqueta: "familias productoras",
    orden: 3,
    objetivos: [
      "Mejorar la productividad de la agricultura familiar con técnicas agroecológicas.",
      "Optimizar el uso del agua mediante riego tecnificado de bajo costo.",
      "Asegurar la alimentación de las familias con huertos y crianza de animales menores.",
      "Conectar a los productores con mercados y compradores que paguen precios justos.",
    ],
    programas: [
      {
        titulo: "Huertos Familiares",
        descripcion:
          "Instalación de huertos y biohuertos escolares que diversifican la dieta y generan excedentes.",
      },
      {
        titulo: "Agua que Rinde",
        descripcion:
          "Sistemas de riego por goteo y cosecha de agua de lluvia adaptados a la geografía andina.",
      },
      {
        titulo: "Del Campo al Mercado",
        descripcion:
          "Fortalecimiento de asociaciones de productores, manejo poscosecha y articulación comercial.",
      },
    ],
  },
  {
    slug: "ayuda-social",
    nombre: "Ayuda Social",
    nombreCorto: "Ayuda Social",
    lema: "Respuesta rápida cuando más urge",
    resumen:
      "Ayuda humanitaria ante emergencias y acompañamiento a poblaciones en alta vulnerabilidad.",
    descripcion: [
      "Cuando ocurre una emergencia (huaicos, heladas, inundaciones) las primeras semanas definen mucho de lo que viene después. El área de Ayuda Social organiza la respuesta inmediata y, sobre todo, el acompañamiento posterior que suele quedar sin cobertura.",
      "Trabajamos además de forma permanente con adultos mayores, personas con discapacidad y familias en situación de pobreza extrema, articulando con municipios y programas del Estado para que accedan a los servicios que les corresponden.",
    ].join("\n\n"),
    icono: "HandHeart",
    tema: "marino",
    indicadorValor: "9",
    indicadorEtiqueta: "emergencias atendidas",
    orden: 4,
    objetivos: [
      "Entregar ayuda humanitaria oportuna ante emergencias climáticas y desastres.",
      "Acompañar a familias en pobreza extrema para que accedan a programas sociales del Estado.",
      "Atender a adultos mayores y personas con discapacidad en situación de abandono.",
      "Fortalecer las capacidades comunitarias de prevención y gestión de riesgos.",
    ],
    programas: [
      {
        titulo: "Respuesta Inmediata",
        descripcion:
          "Kits de abrigo, alimentos y agua segura distribuidos con comités locales en las primeras 72 horas.",
      },
      {
        titulo: "Abrigo Andino",
        descripcion:
          "Campañas de invierno frente a heladas y friaje en comunidades por encima de los 3 500 m s. n. m.",
      },
      {
        titulo: "Puente Social",
        descripcion:
          "Orientación y trámites para que las familias accedan a pensiones, seguros y programas públicos.",
      },
    ],
  },
  {
    slug: "cultura",
    nombre: "Cultura",
    nombreCorto: "Cultura",
    lema: "Identidad que no se pierde",
    resumen:
      "Preservación de saberes, lenguas y artes tradicionales junto a las nuevas generaciones.",
    descripcion: [
      "El Perú es diverso, y esa diversidad se sostiene en prácticas vivas: lenguas, música, textilería, cerámica, memoria oral. El área de Cultura acompaña a las comunidades para que esos saberes se transmitan y, cuando la comunidad lo decide, se conviertan también en una fuente de ingresos.",
      "Documentamos junto a portadores de tradición, abrimos espacios de encuentro entre maestros artesanos y jóvenes, y apoyamos la comercialización digna del trabajo artesanal.",
    ].join("\n\n"),
    icono: "Theater",
    tema: "dorado",
    indicadorValor: "14",
    indicadorEtiqueta: "talleres culturales",
    orden: 5,
    objetivos: [
      "Documentar y difundir saberes, lenguas originarias y memoria oral de las comunidades.",
      "Crear espacios de transmisión entre maestros portadores de tradición y jóvenes.",
      "Apoyar la puesta en valor y comercialización justa de la artesanía local.",
      "Promover el arte y la música como herramientas de cohesión y salud mental comunitaria.",
    ],
    programas: [
      {
        titulo: "Maestros y Aprendices",
        descripcion:
          "Talleres intergeneracionales de textilería, cerámica y música tradicional en la propia comunidad.",
      },
      {
        titulo: "Memoria Viva",
        descripcion:
          "Registro audiovisual de relatos, lenguas y prácticas culturales, con archivo devuelto a la comunidad.",
      },
      {
        titulo: "Hecho en Comunidad",
        descripcion:
          "Diseño, catálogo y canales de venta para que la artesanía llegue al mercado sin intermediarios abusivos.",
      },
    ],
  },
];

const proyectos = [
  {
    slug: "aula-conectada-valle-sagrado",
    titulo: "Aula Conectada en el Valle Sagrado",
    areaSlug: "tecnologia",
    region: "Cusco",
    anio: "2026",
    estado: "EN_CURSO",
    resumen:
      "Conectividad satelital, aula de cómputo y formación docente en cuatro escuelas rurales del Valle Sagrado.",
    beneficiarios: "480 estudiantes y 32 docentes",
    avance: 65,
    aliados: ["UGEL Calca", "Empresa privada aliada"],
  },
  {
    slug: "brigadas-ribera-amazonica",
    titulo: "Brigadas de salud en la ribera amazónica",
    areaSlug: "salud",
    region: "Loreto",
    anio: "2026",
    estado: "EN_CURSO",
    resumen:
      "Atención primaria itinerante en comunidades ribereñas del bajo Nanay, con seguimiento por teleconsulta.",
    beneficiarios: "1 250 personas de 7 comunidades",
    avance: 40,
    aliados: ["DIRESA Loreto", "Colegio Médico del Perú"],
  },
  {
    slug: "cero-anemia-puno",
    titulo: "Cero Anemia en el altiplano",
    areaSlug: "salud",
    region: "Puno",
    anio: "2025",
    estado: "FINALIZADO",
    resumen:
      "Tamizaje de hemoglobina, suplementación y talleres nutricionales con alimentos locales en 6 comunidades.",
    beneficiarios: "930 niñas y niños menores de 5 años",
    avance: 100,
    aliados: ["Municipalidad distrital", "Red de Salud Puno"],
  },
  {
    slug: "refuerzo-escolar-ancash",
    titulo: "Refuerzo escolar en la sierra de Áncash",
    areaSlug: "educacion",
    region: "Áncash",
    anio: "2026",
    estado: "EN_CURSO",
    resumen:
      "Talleres de comprensión lectora y matemática en horario extendido, con material adaptado al contexto rural.",
    beneficiarios: "610 estudiantes de primaria",
    avance: 75,
    aliados: ["UGEL Huaraz", "Voluntariado universitario"],
  },
  {
    slug: "agua-que-rinde-cajamarca",
    titulo: "Agua que Rinde",
    areaSlug: "agricultura-sostenible",
    region: "Cajamarca",
    anio: "2025",
    estado: "FINALIZADO",
    resumen:
      "Instalación de riego por goteo de bajo costo y reservorios familiares para cultivos de ladera.",
    beneficiarios: "210 familias productoras",
    avance: 100,
    aliados: ["Junta de usuarios de riego", "Cooperación internacional"],
  },
  {
    slug: "huertos-escolares-lima-norte",
    titulo: "Biohuertos escolares en Lima Norte",
    areaSlug: "agricultura-sostenible",
    region: "Lima",
    anio: "2026",
    estado: "EN_CURSO",
    resumen:
      "Biohuertos en patios escolares como herramienta pedagógica y complemento del comedor institucional.",
    beneficiarios: "12 escuelas y 1 400 estudiantes",
    avance: 55,
    aliados: ["Municipalidad de Lima", "Empresa privada aliada"],
  },
  {
    slug: "abrigo-andino-ayacucho",
    titulo: "Abrigo Andino frente al friaje",
    areaSlug: "ayuda-social",
    region: "Ayacucho",
    anio: "2025",
    estado: "FINALIZADO",
    resumen:
      "Campaña de invierno con kits de abrigo y refuerzo de viviendas en comunidades sobre los 3 800 m s. n. m.",
    beneficiarios: "780 personas, 190 familias",
    avance: 100,
    aliados: ["Comité de gestión de riesgos", "Donantes individuales"],
  },
  {
    slug: "memoria-viva-ucayali",
    titulo: "Memoria Viva Shipibo-Konibo",
    areaSlug: "cultura",
    region: "Ucayali",
    anio: "2026",
    estado: "EN_CURSO",
    resumen:
      "Registro audiovisual de relatos y diseño tradicional kené, con archivo digital devuelto a la comunidad.",
    beneficiarios: "3 comunidades nativas",
    avance: 30,
    aliados: ["Federación indígena local", "Ministerio de Cultura"],
  },
  {
    slug: "hecho-en-comunidad-piura",
    titulo: "Hecho en Comunidad: cerámica de Chulucanas",
    areaSlug: "cultura",
    region: "Piura",
    anio: "2027",
    estado: "PROXIMO",
    resumen:
      "Catálogo, formación en costos y canal de venta directa para talleres de cerámica tradicional.",
    beneficiarios: "45 artesanos y artesanas",
    avance: 0,
    aliados: ["Asociación de artesanos", "PROMPERÚ"],
  },
];

const cifras = [
  {
    clave: "personas-beneficiadas",
    valor: 12400,
    sufijo: "+",
    etiqueta: "Personas beneficiadas",
    detalle:
      "Niñas, niños, jóvenes y familias alcanzados por nuestros programas.",
    orden: 0,
  },
  {
    clave: "comunidades-acompanadas",
    valor: 38,
    sufijo: null,
    etiqueta: "Comunidades acompañadas",
    detalle: "Localidades rurales y urbano-marginales en 9 regiones del país.",
    orden: 1,
  },
  {
    clave: "proyectos-ejecutados",
    valor: 26,
    sufijo: null,
    etiqueta: "Proyectos ejecutados",
    detalle: "Iniciativas cerradas con indicadores medidos y auditados.",
    orden: 2,
  },
  {
    clave: "voluntarios-activos",
    valor: 210,
    sufijo: "+",
    etiqueta: "Voluntarios activos",
    detalle: "Profesionales y estudiantes que donan su tiempo cada año.",
    orden: 3,
  },
];

async function sembrarUsuarioAdmin() {
  const passwordHash = await bcrypt.hash(entorno.ADMIN_PASSWORD, 10);
  const email = entorno.ADMIN_EMAIL.toLowerCase();

  await prisma.usuario.upsert({
    where: { email },
    update: { nombre: entorno.ADMIN_NOMBRE, rol: "ADMIN", activo: true },
    create: {
      email,
      nombre: entorno.ADMIN_NOMBRE,
      passwordHash,
      rol: "ADMIN",
    },
  });

  console.log(`  usuario administrador: ${email}`);
}

async function sembrarAreas() {
  for (const area of areas) {
    const { objetivos, programas, ...campos } = area;

    const guardada = await prisma.area.upsert({
      where: { slug: area.slug },
      update: campos,
      create: campos,
    });

    // Se reemplazan las listas para que el script sea idempotente.
    await prisma.objetivoArea.deleteMany({ where: { areaId: guardada.id } });
    await prisma.objetivoArea.createMany({
      data: objetivos.map((texto, indice) => ({
        texto,
        orden: indice,
        areaId: guardada.id,
      })),
    });

    await prisma.programaArea.deleteMany({ where: { areaId: guardada.id } });
    await prisma.programaArea.createMany({
      data: programas.map((programa, indice) => ({
        ...programa,
        orden: indice,
        areaId: guardada.id,
      })),
    });
  }

  console.log(`  áreas: ${areas.length}`);
}

async function sembrarProyectos() {
  for (const proyecto of proyectos) {
    const { areaSlug, aliados, ...campos } = proyecto;

    const area = await prisma.area.findUniqueOrThrow({
      where: { slug: areaSlug },
      select: { id: true },
    });

    const guardado = await prisma.proyecto.upsert({
      where: { slug: proyecto.slug },
      update: { ...campos, areaId: area.id },
      create: { ...campos, areaId: area.id },
    });

    await prisma.aliadoProyecto.deleteMany({
      where: { proyectoId: guardado.id },
    });
    await prisma.aliadoProyecto.createMany({
      data: aliados.map((nombre) => ({ nombre, proyectoId: guardado.id })),
    });
  }

  console.log(`  proyectos: ${proyectos.length}`);
}

async function sembrarCifras() {
  for (const cifra of cifras) {
    await prisma.cifraImpacto.upsert({
      where: { clave: cifra.clave },
      update: cifra,
      create: cifra,
    });
  }

  console.log(`  cifras de impacto: ${cifras.length}`);
}

async function principal() {
  console.log("\nCargando datos iniciales...\n");

  await sembrarUsuarioAdmin();
  await sembrarAreas();
  await sembrarProyectos();
  await sembrarCifras();

  console.log("\nListo.\n");
}

principal()
  .catch((error) => {
    console.error("\nFalló la carga de datos:\n", error);
    process.exit(1);
  })
  .finally(() => void prisma.$disconnect());
