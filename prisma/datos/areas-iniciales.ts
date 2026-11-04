/**
 * Texto de partida de las seis áreas.
 * El panel puede reemplazarlo. Si un área ya tiene lema, la siembra no lo pisa.
 */
export const areasIniciales = [
  {
    slug: "tecnologia",
    nombre: "Tecnología",
    nombreCorto: "Tecnología",
    icono: "Wifi",
    tema: "marino" as const,
    orden: 0,
    lema: "Conectividad que abre puertas",
    resumen:
      "Llevamos internet, equipos y alfabetización digital a escuelas y comunidades donde la señal todavía no llega.",
    descripcion:
      "La distancia no debería decidir quién estudia, quién se atiende o quién vende lo que produce. En muchos pueblos la señal es intermitente y los equipos, cuando existen, no tienen quién los mantenga.\n\nTrabajamos con la escuela, la municipalidad y las familias para instalar una conexión útil, formar a quien la va a cuidar y enseñar a usarla en clase, en la posta y en el negocio local.",
    indicadorValor: "Digital",
    indicadorEtiqueta: "inclusión en territorio",
    objetivos: [
      "Conectar escuelas y locales comunales con un servicio que la comunidad pueda sostener.",
      "Formar promotores locales para el mantenimiento de equipos y redes.",
      "Enseñar un uso práctico de la tecnología en el aula, la salud y el trabajo.",
    ],
    programas: [
      {
        titulo: "Aula conectada",
        descripcion:
          "Internet, computadoras y acompañamiento docente para que la escuela use la red en clase.",
      },
      {
        titulo: "Promotores digitales",
        descripcion:
          "Jóvenes de la comunidad aprenden a instalar, cuidar y explicar los equipos.",
      },
      {
        titulo: "Oficios en línea",
        descripcion:
          "Talleres cortos para vender, estudiar y hacer trámites sin salir del pueblo.",
      },
    ],
  },
  {
    slug: "salud",
    nombre: "Salud",
    nombreCorto: "Salud",
    icono: "HeartPulse",
    tema: "selva" as const,
    orden: 1,
    lema: "Atención donde no llega la posta",
    resumen:
      "Acompañamos prevención, brigadas y hábitos saludables junto a los establecimientos de salud de la comunidad.",
    descripcion:
      "En varias zonas el camino a la posta es largo y la campaña de prevención llega tarde. La familia reconoce el malestar cuando ya es una urgencia.\n\nNos sumamos al personal de salud local: campañas de anemia y control de niño sano, orientación a las madres y una red de promotores que avisa a tiempo.",
    indicadorValor: "Prevención",
    indicadorEtiqueta: "cerca de la familia",
    objetivos: [
      "Acercar controles básicos y campañas de prevención a la comunidad.",
      "Formar promotores de salud que articulen con la posta.",
      "Reforzar hábitos de alimentación, higiene y cuidado del agua.",
    ],
    programas: [
      {
        titulo: "Brigadas comunitarias",
        descripcion:
          "Jornadas de despistaje y orientación con el establecimiento de salud del distrito.",
      },
      {
        titulo: "Cero anemia",
        descripcion:
          "Seguimiento a niñas y niños, con consejería a las familias y a la escuela.",
      },
      {
        titulo: "Promotores de salud",
        descripcion:
          "Vecinos capacitados para detectar señales de alarma y derivar a tiempo.",
      },
    ],
  },
  {
    slug: "educacion",
    nombre: "Educación",
    nombreCorto: "Educación",
    icono: "BookOpen",
    tema: "marino" as const,
    orden: 2,
    lema: "Aprender sin importar dónde naciste",
    resumen:
      "Refuerzo escolar, lectura y formación docente para que la escuela rural no se quede atrás.",
    descripcion:
      "Una escuela con pocos docentes atiende varios grados a la vez. El refuerzo, cuando existe, depende de que alguien de fuera pueda llegar.\n\nAcompañamos el aula con materiales, horas de refuerzo y formación para el docente, de modo que el avance se note en lectura, matemáticas y asistencia.",
    indicadorValor: "Aula",
    indicadorEtiqueta: "refuerzo y lectura",
    objetivos: [
      "Mejorar lectura y matemáticas en primaria con refuerzo constante.",
      "Acompañar al docente rural con materiales y formación breve.",
      "Involucrar a las familias en la asistencia y en el hábito de leer.",
    ],
    programas: [
      {
        titulo: "Refuerzo escolar",
        descripcion:
          "Horas extra de lectura y matemáticas, dentro de la escuela y con la misma comunidad.",
      },
      {
        titulo: "Docente acompañado",
        descripcion:
          "Encuentros cortos para planificar clases multigrado y compartir materiales.",
      },
      {
        titulo: "Biblioteca viva",
        descripcion:
          "Libros, lectura en voz alta y un rincón de consulta que la escuela administra.",
      },
    ],
  },
  {
    slug: "agricultura-sostenible",
    nombre: "Agricultura Sostenible",
    nombreCorto: "Agricultura",
    icono: "Sprout",
    tema: "selva" as const,
    orden: 3,
    lema: "Tierra que alimenta y genera ingresos",
    resumen:
      "Huertos, riego y buenas prácticas para que la parcela familiar rinda sin agotar el suelo ni el agua.",
    descripcion:
      "La chacra familiar alimenta la casa y, cuando sobra, es el único ingreso. El riego inseguro y el suelo cansado reducen esa cosecha año a año.\n\nTrabajamos técnicas simples: huertos escolares y familiares, cuidado del agua y organización para vender mejor lo que ya se produce.",
    indicadorValor: "Chacra",
    indicadorEtiqueta: "alimento e ingreso",
    objetivos: [
      "Mejorar la producción familiar sin depender de insumos caros.",
      "Cuidar el suelo y el agua con prácticas que la comunidad pueda repetir.",
      "Acercar la cosecha a la olla escolar y al mercado local.",
    ],
    programas: [
      {
        titulo: "Huertos familiares",
        descripcion:
          "Parcelas de hortalizas para la olla diaria y para la venta del excedente.",
      },
      {
        titulo: "Agua que rinde",
        descripcion:
          "Riego sencillo y cuidado de la fuente, acordado con la comunidad.",
      },
      {
        titulo: "Biohuertos escolares",
        descripcion:
          "El huerto de la escuela alimenta el refrigerio y enseña a cultivar.",
      },
    ],
  },
  {
    slug: "ayuda-social",
    nombre: "Ayuda Social",
    nombreCorto: "Ayuda Social",
    icono: "HandHeart",
    tema: "marino" as const,
    orden: 4,
    lema: "Respuesta rápida cuando más urge",
    resumen:
      "Abrigo, alimentos y apoyo inmediato para familias afectadas por el frío, la lluvia o una emergencia.",
    descripcion:
      "El friaje, el huayco o una enfermedad inesperada dejan a una familia sin abrigo, sin despensa y sin a quién llamar esa semana.\n\nOrganizamos ayuda concreta y de corto plazo, coordinada con la autoridad local, y la usamos para detectar qué programa permanente hace falta después.",
    indicadorValor: "Urgente",
    indicadorEtiqueta: "apoyo a la familia",
    objetivos: [
      "Entregar abrigo, alimentos y útiles a familias en emergencia.",
      "Coordinar la entrega con la municipalidad y los líderes comunales.",
      "Pasar de la ayuda puntual a un programa que se sostenga.",
    ],
    programas: [
      {
        titulo: "Abrigo andino",
        descripcion:
          "Frazadas, ropa de cama y abrigo para las noches de helada.",
      },
      {
        titulo: "Olla de emergencia",
        descripcion:
          "Alimentos básicos para los días en que la familia no puede abastecerse.",
      },
      {
        titulo: "Mochila escolar",
        descripcion:
          "Útiles y uniformes para que una emergencia no corte el año escolar.",
      },
    ],
  },
  {
    slug: "cultura",
    nombre: "Cultura",
    nombreCorto: "Cultura",
    icono: "Theater",
    tema: "dorado" as const,
    orden: 5,
    lema: "Identidad que no se pierde",
    resumen:
      "Lengua, oficio y memoria local para que las niñas y los niños hereden lo que la comunidad sabe hacer.",
    descripcion:
      "Cuando la escuela solo enseña en castellano y el oficio de los abuelos no tiene relevo, el pueblo guarda la fiesta pero pierde la práctica.\n\nAcompañamos talleres de lengua, música, cerámica y relato oral, con maestros de la propia comunidad y un registro sencillo de lo que no quieren que se olvide.",
    indicadorValor: "Memoria",
    indicadorEtiqueta: "oficio y lengua",
    objetivos: [
      "Dar un lugar a la lengua y al relato local dentro de la escuela.",
      "Transmitir oficios de la comunidad a las nuevas generaciones.",
      "Registrar fiestas, cantos y saberes con el permiso de quien los guarda.",
    ],
    programas: [
      {
        titulo: "Taller de oficio",
        descripcion:
          "Cerámica, tejido o el saber local, enseñado por maestras y maestros del pueblo.",
      },
      {
        titulo: "Lengua en el aula",
        descripcion:
          "Horas de quechua u otra lengua originaria junto a la clase regular.",
      },
      {
        titulo: "Memoria viva",
        descripcion:
          "Relatos, cantos y fotos reunidos con las familias para la escuela y el local comunal.",
      },
    ],
  },
] as const;
