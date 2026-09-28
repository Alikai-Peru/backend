/**
 * Prueba de humo de la API: recorre todos los endpoints contra un servidor ya
 * levantado y comprueba códigos de estado y respuestas.
 *
 * Uso:
 *   npm run dev        (en una terminal)
 *   npm run probar     (en otra)
 */

const BASE = process.env.API_BASE ?? "http://localhost:4000/api";

let correctas = 0;
let fallidas = 0;
let omitidas = 0;
const fallos: string[] = [];

type Respuesta = { estado: number; cuerpo: any };

async function pedir(
  metodo: string,
  ruta: string,
  opciones: { cuerpo?: unknown; token?: string } = {},
): Promise<Respuesta> {
  const cabeceras: Record<string, string> = {};
  if (opciones.cuerpo !== undefined) {
    cabeceras["Content-Type"] = "application/json";
  }
  if (opciones.token) {
    cabeceras["Authorization"] = `Bearer ${opciones.token}`;
  }

  const respuesta = await fetch(`${BASE}${ruta}`, {
    method: metodo,
    headers: cabeceras,
    body: opciones.cuerpo !== undefined ? JSON.stringify(opciones.cuerpo) : undefined,
  });

  const texto = await respuesta.text();
  let cuerpo: any = texto;
  try {
    cuerpo = JSON.parse(texto);
  } catch {
    // Se deja el texto crudo si la respuesta no es JSON.
  }

  return { estado: respuesta.status, cuerpo };
}

function comprobar(descripcion: string, condicion: boolean, detalle?: string) {
  if (condicion) {
    correctas += 1;
    console.log(`  ok   ${descripcion}`);
  } else {
    fallidas += 1;
    const linea = `${descripcion}${detalle ? ` -> ${detalle}` : ""}`;
    fallos.push(linea);
    console.log(`  FALLA ${linea}`);
  }
}

/**
 * Variante para los formularios públicos, que están sujetos a límite de
 * peticiones. Un 429 no significa que el endpoint esté roto: significa que el
 * límite hizo su trabajo, algo esperable al probar contra NODE_ENV=production.
 */
function comprobarEnvio(
  descripcion: string,
  respuesta: Respuesta,
  condicion: boolean,
  detalle?: string,
) {
  if (respuesta.estado === 429) {
    omitidas += 1;
    console.log(`  omitida ${descripcion} (límite de envíos alcanzado)`);
    return;
  }
  comprobar(descripcion, condicion, detalle);
}

function seccion(titulo: string) {
  console.log(`\n${titulo}`);
}

async function principal() {
  console.log(`\nProbando ${BASE}\n${"=".repeat(50)}`);

  // ---------------------------------------------------------------- lecturas
  seccion("Estado y catálogo");

  const salud = await pedir("GET", "/salud");
  comprobar(
    "GET /salud responde 200 y la base de datos está conectada",
    salud.estado === 200 && salud.cuerpo?.datos?.baseDeDatos === "conectada",
    `estado ${salud.estado}`,
  );

  const indice = await pedir("GET", "/");
  comprobar("GET / lista los endpoints", indice.estado === 200 && !!indice.cuerpo?.datos?.endpoints);

  seccion("Áreas");

  const areas = await pedir("GET", "/areas");
  comprobar(
    "GET /areas devuelve las 6 áreas",
    areas.estado === 200 && areas.cuerpo?.datos?.length === 6,
    `recibidas ${areas.cuerpo?.datos?.length}`,
  );
  comprobar(
    "cada área trae objetivos y programas",
    areas.cuerpo?.datos?.every(
      (a: any) => a.objetivos?.length > 0 && a.programas?.length > 0,
    ),
  );

  const areaSalud = await pedir("GET", "/areas/salud");
  comprobar(
    "GET /areas/salud incluye sus proyectos",
    areaSalud.estado === 200 && areaSalud.cuerpo?.datos?.proyectos?.length > 0,
    `proyectos ${areaSalud.cuerpo?.datos?.proyectos?.length}`,
  );

  const areaFalsa = await pedir("GET", "/areas/no-existe");
  comprobar(
    "GET de un área inexistente responde 404",
    areaFalsa.estado === 404 && areaFalsa.cuerpo?.error?.codigo === "NO_ENCONTRADO",
    `estado ${areaFalsa.estado}`,
  );

  seccion("Proyectos");

  const proyectos = await pedir("GET", "/proyectos");
  comprobar(
    "GET /proyectos devuelve 9 proyectos paginados",
    proyectos.estado === 200 && proyectos.cuerpo?.meta?.total === 9,
    `total ${proyectos.cuerpo?.meta?.total}`,
  );
  comprobar(
    "los aliados llegan como lista de nombres",
    Array.isArray(proyectos.cuerpo?.datos?.[0]?.aliados) &&
      typeof proyectos.cuerpo?.datos?.[0]?.aliados?.[0] === "string",
  );

  const finalizados = await pedir("GET", "/proyectos?estado=FINALIZADO");
  comprobar(
    "filtro por estado FINALIZADO funciona",
    finalizados.estado === 200 &&
      finalizados.cuerpo?.datos?.every((p: any) => p.estado === "FINALIZADO"),
  );

  const porArea = await pedir("GET", "/proyectos?area=cultura");
  comprobar(
    "filtro por área funciona",
    porArea.estado === 200 &&
      porArea.cuerpo?.datos?.length > 0 &&
      porArea.cuerpo.datos.every((p: any) => p.area.slug === "cultura"),
  );

  const paginado = await pedir("GET", "/proyectos?porPagina=4&pagina=2");
  comprobar(
    "la paginación respeta porPagina y pagina",
    paginado.cuerpo?.datos?.length === 4 && paginado.cuerpo?.meta?.pagina === 2,
  );

  const filtroInvalido = await pedir("GET", "/proyectos?estado=INVENTADO");
  comprobar(
    "un filtro inválido responde 422 con el campo señalado",
    filtroInvalido.estado === 422 && !!filtroInvalido.cuerpo?.error?.campos?.estado,
    `estado ${filtroInvalido.estado}`,
  );

  seccion("Cifras");

  const cifras = await pedir("GET", "/cifras");
  comprobar(
    "GET /cifras devuelve las 4 cifras de impacto",
    cifras.estado === 200 && cifras.cuerpo?.datos?.length === 4,
    `recibidas ${cifras.cuerpo?.datos?.length}`,
  );

  // ------------------------------------------------------------ formularios
  seccion("Formulario de contacto");

  const contactoVacio = await pedir("POST", "/contacto", { cuerpo: {} });
  comprobarEnvio(
    "POST /contacto sin datos responde 422",
    contactoVacio,
    contactoVacio.estado === 422,
    `estado ${contactoVacio.estado}`,
  );
  comprobarEnvio(
    "señala los campos obligatorios que faltan",
    contactoVacio,
    ["nombre", "email", "motivo", "mensaje"].every(
      (campo) => !!contactoVacio.cuerpo?.error?.campos?.[campo],
    ),
    JSON.stringify(contactoVacio.cuerpo?.error?.campos),
  );

  const contactoCorreoMalo = await pedir("POST", "/contacto", {
    cuerpo: {
      nombre: "María Quispe",
      email: "no-es-un-correo",
      motivo: "VOLUNTARIADO",
      mensaje: "Quiero postular como voluntaria para el área de educación.",
      aceptaPrivacidad: true,
    },
  });
  comprobarEnvio(
    "rechaza un correo con formato inválido",
    contactoCorreoMalo,
    contactoCorreoMalo.estado === 422 &&
      !!contactoCorreoMalo.cuerpo?.error?.campos?.email,
  );

  const contactoSinPrivacidad = await pedir("POST", "/contacto", {
    cuerpo: {
      nombre: "María Quispe",
      email: "maria@example.com",
      motivo: "VOLUNTARIADO",
      mensaje: "Quiero postular como voluntaria para el área de educación.",
      aceptaPrivacidad: false,
    },
  });
  comprobarEnvio(
    "exige la autorización de privacidad",
    contactoSinPrivacidad,
    contactoSinPrivacidad.estado === 422 &&
      !!contactoSinPrivacidad.cuerpo?.error?.campos?.aceptaPrivacidad,
  );

  const contactoValido = await pedir("POST", "/contacto", {
    cuerpo: {
      nombre: "María Quispe",
      email: "maria@example.com",
      telefono: "+51 987 654 321",
      motivo: "VOLUNTARIADO",
      mensaje:
        "Soy enfermera y quiero sumarme a las brigadas de salud en Loreto. Tengo disponibilidad los fines de semana.",
      aceptaPrivacidad: true,
    },
  });
  comprobarEnvio(
    "POST /contacto válido responde 201 con el id del mensaje",
    contactoValido,
    contactoValido.estado === 201 && !!contactoValido.cuerpo?.datos?.id,
    `estado ${contactoValido.estado} ${JSON.stringify(contactoValido.cuerpo?.error ?? "")}`,
  );
  const idMensaje = contactoValido.cuerpo?.datos?.id as string | undefined;

  seccion("Postulación de voluntariado");

  const voluntarioValido = await pedir("POST", "/voluntarios", {
    cuerpo: {
      nombres: "Carlos",
      apellidos: "Ramírez Soto",
      email: "carlos@example.com",
      telefono: "987654321",
      profesion: "Ingeniero de sistemas",
      disponibilidad: "Sábados por la mañana",
      motivacion:
        "Quiero apoyar en la instalación de aulas de cómputo y formar promotores digitales.",
      areaInteresSlug: "tecnologia",
    },
  });
  comprobarEnvio(
    "POST /voluntarios válido responde 201",
    voluntarioValido,
    voluntarioValido.estado === 201 && !!voluntarioValido.cuerpo?.datos?.id,
    `estado ${voluntarioValido.estado} ${JSON.stringify(voluntarioValido.cuerpo?.error ?? "")}`,
  );

  const voluntarioAreaFalsa = await pedir("POST", "/voluntarios", {
    cuerpo: {
      nombres: "Ana",
      apellidos: "Torres",
      email: "ana@example.com",
      telefono: "987654321",
      profesion: "Docente",
      disponibilidad: "Tardes de lunes a viernes",
      motivacion: "Quiero colaborar con el refuerzo escolar en zonas rurales.",
      areaInteresSlug: "area-que-no-existe",
    },
  });
  comprobarEnvio(
    "rechaza un área de interés inexistente",
    voluntarioAreaFalsa,
    voluntarioAreaFalsa.estado === 422 &&
      !!voluntarioAreaFalsa.cuerpo?.error?.campos?.areaInteresSlug,
  );

  seccion("Donaciones");

  const donacionValida = await pedir("POST", "/donaciones", {
    cuerpo: {
      monto: 150.5,
      frecuencia: "MENSUAL",
      metodo: "YAPE",
      nombre: "Luis Fernández",
      email: "luis@example.com",
      areaSlug: "educacion",
    },
  });
  comprobarEnvio(
    "POST /donaciones válido responde 201 y devuelve el monto en soles",
    donacionValida,
    donacionValida.estado === 201 && donacionValida.cuerpo?.datos?.monto === 150.5,
    `monto ${donacionValida.cuerpo?.datos?.monto}`,
  );
  const idDonacion = donacionValida.cuerpo?.datos?.id as string | undefined;

  const donacionSinCorreo = await pedir("POST", "/donaciones", {
    cuerpo: { monto: 50 },
  });
  comprobarEnvio(
    "pide correo si la donación no es anónima",
    donacionSinCorreo,
    donacionSinCorreo.estado === 422 &&
      !!donacionSinCorreo.cuerpo?.error?.campos?.email,
  );

  const donacionAnonima = await pedir("POST", "/donaciones", {
    cuerpo: { monto: 20, anonima: true },
  });
  comprobarEnvio(
    "acepta una donación anónima sin datos de contacto",
    donacionAnonima,
    donacionAnonima.estado === 201,
    `estado ${donacionAnonima.estado}`,
  );

  const donacionNegativa = await pedir("POST", "/donaciones", {
    cuerpo: { monto: -10, anonima: true },
  });
  comprobarEnvio(
    "rechaza montos negativos",
    donacionNegativa,
    donacionNegativa.estado === 422,
    `estado ${donacionNegativa.estado}`,
  );

  // --------------------------------------------------------- autenticación
  seccion("Autenticación");

  const sinToken = await pedir("GET", "/contacto");
  comprobar(
    "la bandeja de mensajes exige sesión",
    sinToken.estado === 401 && sinToken.cuerpo?.error?.codigo === "NO_AUTENTICADO",
    `estado ${sinToken.estado}`,
  );

  const tokenInvalido = await pedir("GET", "/contacto", { token: "abc.def.ghi" });
  comprobar(
    "un token inválido responde 401",
    tokenInvalido.estado === 401,
    `estado ${tokenInvalido.estado}`,
  );

  const loginMalo = await pedir("POST", "/auth/login", {
    cuerpo: { email: "admin@alikaiperu.org", password: "clave-incorrecta" },
  });
  comprobar(
    "el login rechaza credenciales incorrectas",
    loginMalo.estado === 401,
    `estado ${loginMalo.estado}`,
  );

  const login = await pedir("POST", "/auth/login", {
    cuerpo: {
      email: process.env.ADMIN_EMAIL ?? "admin@alikaiperu.org",
      password: process.env.ADMIN_PASSWORD ?? "Alikai2026!",
    },
  });
  comprobar(
    "el login con credenciales correctas devuelve un token",
    login.estado === 200 && typeof login.cuerpo?.datos?.token === "string",
    `estado ${login.estado} ${JSON.stringify(login.cuerpo?.error ?? "")}`,
  );

  const token = login.cuerpo?.datos?.token as string | undefined;

  if (!token) {
    console.log("\nSin token no se pueden probar las rutas del panel.");
    resumir();
    return;
  }

  const yo = await pedir("GET", "/auth/yo", { token });
  comprobar(
    "GET /auth/yo devuelve el usuario con rol ADMIN",
    yo.estado === 200 && yo.cuerpo?.datos?.rol === "ADMIN",
  );

  // ------------------------------------------------------------ panel admin
  seccion("Panel de administración");

  const bandeja = await pedir("GET", "/contacto", { token });
  comprobar(
    "lista los mensajes recibidos e informa cuántos están sin leer",
    bandeja.estado === 200 &&
      bandeja.cuerpo?.datos?.length > 0 &&
      typeof bandeja.cuerpo?.meta?.sinLeer === "number",
    `total ${bandeja.cuerpo?.meta?.total}`,
  );
  comprobar(
    "la IP de origen no se expone en la respuesta",
    bandeja.cuerpo?.datos?.every((m: any) => m.ipOrigen === undefined),
  );

  const busqueda = await pedir("GET", "/contacto?buscar=enfermera", { token });
  comprobar(
    "la búsqueda por texto encuentra el mensaje",
    busqueda.estado === 200 && busqueda.cuerpo?.datos?.length > 0,
    `resultados ${busqueda.cuerpo?.datos?.length}`,
  );

  if (idMensaje) {
    const detalle = await pedir("GET", `/contacto/${idMensaje}`, { token });
    comprobar(
      "obtiene el detalle de un mensaje por id",
      detalle.estado === 200 && detalle.cuerpo?.datos?.id === idMensaje,
    );

    const marcado = await pedir("PATCH", `/contacto/${idMensaje}`, {
      token,
      cuerpo: { estado: "RESPONDIDO", notaInterna: "Derivada al área de salud." },
    });
    comprobar(
      "marca el mensaje como respondido y registra la fecha",
      marcado.estado === 200 &&
        marcado.cuerpo?.datos?.estado === "RESPONDIDO" &&
        !!marcado.cuerpo?.datos?.respondidoEn,
      `estado ${marcado.estado}`,
    );

    const estadoInvalido = await pedir("PATCH", `/contacto/${idMensaje}`, {
      token,
      cuerpo: { estado: "INVENTADO" },
    });
    comprobar(
      "rechaza un estado no permitido",
      estadoInvalido.estado === 422,
      `estado ${estadoInvalido.estado}`,
    );
  }

  const voluntarios = await pedir("GET", "/voluntarios", { token });
  comprobar(
    "lista las postulaciones de voluntariado",
    voluntarios.estado === 200 && voluntarios.cuerpo?.datos?.length > 0,
  );

  const donaciones = await pedir("GET", "/donaciones", { token });
  comprobar(
    "lista las donaciones con el monto convertido a soles",
    donaciones.estado === 200 &&
      donaciones.cuerpo?.datos?.every((d: any) => typeof d.monto === "number"),
  );

  const resumen = await pedir("GET", "/donaciones/resumen", { token });
  comprobar(
    "el resumen de donaciones calcula totales",
    resumen.estado === 200 &&
      typeof resumen.cuerpo?.datos?.pendiente?.total === "number",
    JSON.stringify(resumen.cuerpo?.datos),
  );

  if (idDonacion) {
    const confirmada = await pedir("PATCH", `/donaciones/${idDonacion}`, {
      token,
      cuerpo: { estado: "CONFIRMADA", referencia: "YAPE-000123" },
    });
    comprobar(
      "confirma una donación y guarda la fecha",
      confirmada.estado === 200 &&
        confirmada.cuerpo?.datos?.estado === "CONFIRMADA" &&
        !!confirmada.cuerpo?.datos?.confirmadaEn,
    );

    // Se compara la diferencia y no un total absoluto, porque la base de datos
    // puede tener donaciones de ejecuciones anteriores.
    const totalAntes = resumen.cuerpo?.datos?.confirmado?.total ?? 0;
    const resumen2 = await pedir("GET", "/donaciones/resumen", { token });
    const totalDespues = resumen2.cuerpo?.datos?.confirmado?.total ?? 0;

    comprobar(
      "el total confirmado aumenta en el monto de la donación",
      Math.abs(totalDespues - totalAntes - 150.5) < 0.001,
      `antes ${totalAntes}, después ${totalDespues}`,
    );
  }

  seccion("Gestión de contenido");

  const cifraActualizada = await pedir("PATCH", "/cifras/proyectos-ejecutados", {
    token,
    cuerpo: { valor: 27 },
  });
  comprobar(
    "actualiza una cifra de impacto",
    cifraActualizada.estado === 200 && cifraActualizada.cuerpo?.datos?.valor === 27,
    `estado ${cifraActualizada.estado}`,
  );

  const nuevoProyecto = await pedir("POST", "/proyectos", {
    token,
    cuerpo: {
      titulo: "Proyecto de prueba automatizada",
      areaSlug: "educacion",
      region: "Lima",
      anio: "2026",
      estado: "PROXIMO",
      resumen: "Proyecto creado por la prueba de humo para validar el alta.",
      beneficiarios: "10 personas",
      avance: 0,
      aliados: ["Aliado de prueba"],
    },
  });
  const slugPrueba = nuevoProyecto.cuerpo?.datos?.slug as string | undefined;
  comprobar(
    "crea un proyecto y genera el slug internamente",
    nuevoProyecto.estado === 201 && slugPrueba === "proyecto-de-prueba-automatizada",
    `estado ${nuevoProyecto.estado} ${JSON.stringify(nuevoProyecto.cuerpo?.error ?? "")}`,
  );

  const slugGemelo = await pedir("POST", "/proyectos", {
    token,
    cuerpo: {
      titulo: "Proyecto de prueba automatizada",
      areaSlug: "educacion",
      region: "Lima",
      anio: "2026",
      resumen: "El slug se desambigua solo si el título se repite.",
      beneficiarios: "10 personas",
    },
  });
  comprobar(
    "genera un slug distinto si el título ya existe",
    slugGemelo.estado === 201 &&
      slugGemelo.cuerpo?.datos?.slug === "proyecto-de-prueba-automatizada-2",
    `estado ${slugGemelo.estado}`,
  );

  if (slugGemelo.cuerpo?.datos?.slug) {
    await pedir("DELETE", `/proyectos/${slugGemelo.cuerpo.datos.slug}`, { token });
  }

  const proyectoEditado = await pedir("PATCH", `/proyectos/${slugPrueba}`, {
    token,
    cuerpo: { avance: 45, estado: "EN_CURSO", aliados: ["Aliado A", "Aliado B"] },
  });
  comprobar(
    "edita un proyecto y reemplaza sus aliados",
    proyectoEditado.estado === 200 &&
      proyectoEditado.cuerpo?.datos?.avance === 45 &&
      proyectoEditado.cuerpo?.datos?.aliados?.length === 2,
    `estado ${proyectoEditado.estado}`,
  );

  const avanceInvalido = await pedir("PATCH", `/proyectos/${slugPrueba}`, {
    token,
    cuerpo: { avance: 250 },
  });
  comprobar(
    "rechaza un avance mayor a 100",
    avanceInvalido.estado === 422,
    `estado ${avanceInvalido.estado}`,
  );

  const areaConProyectos = await pedir("DELETE", "/areas/educacion", { token });
  comprobar(
    "no permite borrar un área con proyectos asociados",
    areaConProyectos.estado === 409,
    `estado ${areaConProyectos.estado}`,
  );

  const proyectoBorrado = await pedir("DELETE", `/proyectos/${slugPrueba}`, {
    token,
  });
  comprobar(
    "elimina el proyecto de prueba",
    proyectoBorrado.estado === 200,
    `estado ${proyectoBorrado.estado}`,
  );

  const yaBorrado = await pedir("GET", `/proyectos/${slugPrueba}`);
  comprobar(
    "el proyecto eliminado ya no está disponible",
    yaBorrado.estado === 404,
    `estado ${yaBorrado.estado}`,
  );

  seccion("Rutas inexistentes");

  const rutaFalsa = await pedir("GET", "/no-existe-esta-ruta");
  comprobar(
    "una ruta inexistente responde 404 en JSON",
    rutaFalsa.estado === 404 &&
      rutaFalsa.cuerpo?.error?.codigo === "RUTA_NO_ENCONTRADA",
    `estado ${rutaFalsa.estado}`,
  );

  resumir();
}

function resumir() {
  console.log(`\n${"=".repeat(50)}`);
  console.log(
    `  ${correctas} correctas, ${fallidas} fallidas` +
      (omitidas > 0 ? `, ${omitidas} omitidas` : ""),
  );

  if (fallos.length > 0) {
    console.log("\nFallos:");
    for (const fallo of fallos) console.log(`  - ${fallo}`);
    process.exitCode = 1;
  } else {
    console.log("  Todo funciona.");
  }

  if (omitidas > 0) {
    console.log(
      "\n  Las omitidas se saltaron porque el límite de envíos por hora se\n" +
        "  alcanzó. Ocurre al probar contra NODE_ENV=production, donde el\n" +
        "  límite es de 5 por formulario. Reinicia el servidor para reiniciar\n" +
        "  los contadores.",
    );
  }
  console.log("");
}

principal().catch((error) => {
  console.error(
    "\nNo se pudo completar la prueba. ¿Está el servidor levantado con npm run dev?\n",
    error,
  );
  process.exit(1);
});
