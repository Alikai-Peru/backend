# Backend de Alikai Perú

API REST que da soporte al sitio web: formulario de contacto, postulaciones de
voluntariado, registro de donaciones y gestión del contenido institucional
(áreas, proyectos y cifras de impacto).

> **Nota sobre el alcance.** Esta versión se diseñó a partir de las
> funcionalidades que el frontend ya necesita, porque el documento de
> especificación del proyecto todavía no está en el repositorio. Cuando esté
> disponible, hay que revisar el modelo de datos y los endpoints contra él.

## Tecnologías

| Pieza            | Elección               | Motivo                                              |
| ---------------- | ---------------------- | --------------------------------------------------- |
| Ejecución        | Node.js + TypeScript   | Mismo lenguaje que el frontend                      |
| Servidor         | Express 5              | Estándar, simple y con soporte nativo de async      |
| Base de datos    | PostgreSQL 16 (Docker) | Mismo motor que Supabase, el destino de producción  |
| ORM              | Prisma 7               | Migraciones versionadas y consultas con tipos       |
| Validación       | Zod                    | Valida y tipa las entradas en un solo paso          |
| Autenticación    | JWT + bcrypt           | Sesiones sin estado para el panel de administración |
| Seguridad básica | Helmet + rate limit    | Cabeceras seguras y control de abuso en formularios |

## Requisitos

- Node.js 20 o superior
- Docker Desktop en ejecución

No hace falta instalar PostgreSQL: corre en un contenedor.

## Puesta en marcha

Desde la carpeta `Backend/`:

```bash
npm install              # instala dependencias
npm run bd:arriba        # levanta Postgres en Docker
npm run db:migrar        # crea las tablas
npm run db:sembrar       # carga contenido inicial y usuario admin
npm run dev              # API en http://localhost:4000
```

En una máquina nueva hay que crear el `.env` antes de migrar:

```powershell
Copy-Item .env.example .env
```

El `.env` de este repositorio ya viene con los valores de desarrollo que
coinciden con el `docker-compose.yml`.

Para comprobar que responde:

```bash
curl http://localhost:4000/api/salud
```

### Sobre el puerto de la base de datos

El contenedor expone Postgres en el **puerto 5433** del host, no en el 5432,
porque esa máquina ya tiene una instalación nativa de Postgres ocupándolo. Si
en otro equipo el 5432 está libre, se puede cambiar el mapeo en
`docker-compose.yml` y la `DATABASE_URL`.

## Modos de ejecución

**Desarrollo (recomendado).** Solo la base de datos en Docker; la API en el
host para conservar la recarga automática al guardar:

```bash
npm run bd:arriba
npm run dev
```

**Todo en contenedores.** Útil para verificar la imagen antes de desplegar:

```bash
npm run docker:completo    # construye la imagen y levanta API + Postgres
docker compose --profile completo logs -f api
docker compose --profile completo down
```

En este modo la API corre con `NODE_ENV=production`, así que los límites de
peticiones son los estrictos: 5 envíos por hora y por formulario.

Comandos útiles del contenedor de base de datos:

```bash
npm run bd:logs                                      # ver los logs
npm run bd:abajo                                     # detener (conserva datos)
docker compose down -v                               # detener y BORRAR los datos
docker exec -it alikai_postgres psql -U alikai -d alikai   # consola SQL
```

Los datos viven en el volumen `alikai_datos_postgres`, así que sobreviven a
reinicios del contenedor y de la máquina.

## Probar la API

Con el servidor levantado, en otra terminal:

```bash
npm run probar
```

Recorre los 49 casos de `pruebas/humo.ts`: lecturas públicas, validaciones de
los tres formularios, inicio de sesión, permisos y las operaciones del panel.
Al terminar informa cuántas pasaron, cuántas fallaron y cuántas se omitieron
por límite de envíos.

Después de probar los formularios, para dejar la base limpia sin perder el
contenido:

```bash
npm run db:limpiar
```

## Scripts disponibles

| Script                    | Qué hace                                                  |
| ------------------------- | --------------------------------------------------------- |
| `npm run dev`             | Servidor con recarga automática                           |
| `npm run probar`          | Prueba de humo contra el servidor levantado               |
| `npm run build`           | Genera el cliente de Prisma y compila a `dist/`           |
| `npm start`               | Ejecuta la versión compilada                              |
| `npm run typecheck`       | Revisa los tipos sin compilar                             |
| `npm run bd:arriba`       | Levanta Postgres en Docker                                |
| `npm run bd:abajo`        | Detiene Postgres conservando los datos                    |
| `npm run bd:logs`         | Sigue los logs de Postgres                                |
| `npm run docker:completo` | Levanta API y Postgres en contenedores                    |
| `npm run db:migrar`       | Aplica cambios del esquema y crea la migración            |
| `npm run db:sembrar`      | Carga o actualiza el contenido inicial (es idempotente)   |
| `npm run db:limpiar`      | Borra mensajes, postulaciones y donaciones de prueba      |
| `npm run db:studio`       | Abre Prisma Studio para ver y editar datos en el navegador |
| `npm run db:reiniciar`    | Recrea la base desde cero (pide confirmación, borra todo) |

`npm run db:studio` es la forma más cómoda de revisar qué llegó a la base de
datos mientras pruebas los formularios.

## Endpoints

Todas las respuestas usan la misma forma:

```jsonc
// correcta
{ "ok": true, "datos": { }, "meta": { } }

// con error
{ "ok": false, "error": { "codigo": "DATOS_INVALIDOS", "mensaje": "...", "campos": { } } }
```

### Públicos

| Método | Ruta                   | Descripción                                      |
| ------ | ---------------------- | ------------------------------------------------ |
| GET    | `/api/salud`           | Estado del servicio y de la base de datos        |
| GET    | `/api`                 | Índice de endpoints disponibles                  |
| GET    | `/api/areas`           | Las seis áreas con sus objetivos y programas     |
| GET    | `/api/areas/:slug`     | Un área con sus proyectos                        |
| GET    | `/api/proyectos`       | Proyectos con filtros `area`, `estado`, `region` |
| GET    | `/api/proyectos/:slug` | Detalle de un proyecto                           |
| GET    | `/api/cifras`          | Cifras de impacto                                |
| POST   | `/api/contacto`        | Envío del formulario de contacto                 |
| POST   | `/api/voluntarios`     | Postulación de voluntariado                      |
| POST   | `/api/donaciones`      | Registro de una donación                         |

Los listados aceptan `pagina` y `porPagina` (máximo 100) y devuelven el total
en `meta`.

### Autenticación

| Método | Ruta              | Descripción                                  |
| ------ | ----------------- | -------------------------------------------- |
| POST   | `/api/auth/login` | Devuelve el token a partir de correo y clave |
| GET    | `/api/auth/yo`    | Datos del usuario del token                  |

El token se envía en cada petición protegida:

```
Authorization: Bearer <token>
```

Credenciales que crea el script de semillas (definidas en `.env`):

- Correo: `admin@alikaiperu.org`
- Contraseña: `Alikai2026!`

Hay que cambiarlas antes de exponer la API fuera de la máquina local.

### Administración

Requieren token. Las operaciones de borrado están limitadas al rol `ADMIN`.

| Método | Ruta                      | Descripción                                 |
| ------ | ------------------------- | ------------------------------------------- |
| GET    | `/api/contacto`           | Bandeja de mensajes con búsqueda y filtros  |
| GET    | `/api/contacto/:id`       | Detalle de un mensaje                       |
| PATCH  | `/api/contacto/:id`       | Cambia el estado o agrega una nota interna  |
| GET    | `/api/voluntarios`        | Postulaciones recibidas                     |
| PATCH  | `/api/voluntarios/:id`    | Avanza el estado de una postulación         |
| GET    | `/api/donaciones`         | Donaciones registradas                      |
| GET    | `/api/donaciones/resumen` | Totales confirmados, pendientes y mensuales |
| PATCH  | `/api/donaciones/:id`     | Confirma o rechaza una donación             |
| POST   | `/api/areas`              | Crea un área                                |
| PATCH  | `/api/areas/:slug`        | Edita un área                               |
| POST   | `/api/proyectos`          | Crea un proyecto                            |
| PATCH  | `/api/proyectos/:slug`    | Edita un proyecto                           |
| PATCH  | `/api/cifras/:clave`      | Actualiza una cifra de impacto              |

### Ejemplos

En PowerShell resulta cómodo `Invoke-RestMethod`:

```powershell
# Enviar un mensaje de contacto
$cuerpo = @{
  nombre           = "María Quispe"
  email            = "maria@example.com"
  motivo           = "VOLUNTARIADO"
  mensaje          = "Soy enfermera y quiero sumarme a las brigadas de salud."
  aceptaPrivacidad = $true
} | ConvertTo-Json

Invoke-RestMethod -Uri http://localhost:4000/api/contacto -Method Post `
  -ContentType "application/json; charset=utf-8" -Body $cuerpo

# Iniciar sesión y leer la bandeja
$sesion = Invoke-RestMethod -Uri http://localhost:4000/api/auth/login -Method Post `
  -ContentType "application/json" `
  -Body '{"email":"admin@alikaiperu.org","password":"Alikai2026!"}'

Invoke-RestMethod -Uri http://localhost:4000/api/contacto `
  -Headers @{ Authorization = "Bearer $($sesion.datos.token)" }
```

## Despliegue: Railway + Supabase

La API corre en Railway. Postgres vive en Supabase (no uses el Postgres de
Railway). En el servicio de Railway configura **Root Directory** = `Backend`
si el repositorio es el monorepo completo.

### 1. Crear el proyecto en Supabase

1. New project → anota la contraseña de `postgres`.
2. **Project Settings → Database → Connection string**.
3. Copia dos cadenas:

| Variable | Cuál usar |
| -------- | --------- |
| `DATABASE_URL` | Pooler **Transaction**, puerto **6543**, añade `?pgbouncer=true` |
| `DIRECT_URL` | Pooler **Session**, puerto **5432** (las migraciones van por aquí) |

### 2. Variables en Railway

| Variable | Ejemplo |
| -------- | ------- |
| `DATABASE_URL` | `postgresql://postgres.XXX:CLAVE@aws-0-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true` |
| `DIRECT_URL` | `postgresql://postgres.XXX:CLAVE@aws-0-sa-east-1.pooler.supabase.com:5432/postgres` |
| `NODE_ENV` | `production` |
| `JWT_SECRET` | 48 bytes en hex (`node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`) |
| `JWT_EXPIRACION` | `8h` |
| `CORS_ORIGENES` | URL del frontend, p. ej. `https://alikaiperu.org` |
| `ADMIN_EMAIL` | correo del primer administrador |
| `ADMIN_PASSWORD` | contraseña segura (mínimo 8) |
| `ADMIN_NOMBRE` | `Administrador Alikai` |

`PORT` lo inyecta Railway. El `Dockerfile` aplica `prisma migrate deploy` al
arrancar y luego levanta Express en `0.0.0.0`. El healthcheck es `GET /api/salud`.

### 3. Semillas (una sola vez)

Con las mismas variables, desde tu máquina:

```bash
cd Backend
npx prisma migrate deploy
npm run db:sembrar
```

O abre una shell en Railway y ejecuta `npm run db:sembrar`.

### 4. Frontend

En Vercel (u otro host) define `API_URL` con la URL pública de Railway, por
ejemplo `https://alikai-api.up.railway.app`.

## Pasar a Supabase

Supabase es PostgreSQL, así que el esquema y las migraciones sirven tal cual.
El cambio se reduce a la configuración:

1. Crear el proyecto en Supabase y copiar las cadenas de conexión desde
   **Settings → Database → Connection string**.

2. En el `.env` de producción usar las dos variables:

   ```env
   # Pooler en modo transaction: para la aplicación
   DATABASE_URL="postgresql://postgres.<ref>:<clave>@aws-0-<region>.pooler.supabase.com:6543/postgres?pgbouncer=true"

   # Conexión directa: solo para migraciones
   DIRECT_URL="postgresql://postgres.<ref>:<clave>@aws-0-<region>.pooler.supabase.com:5432/postgres"
   ```

   `prisma7.config.ts` ya prefiere `DIRECT_URL` cuando existe, porque el pooler
   en modo *transaction* no admite las sentencias que ejecuta Prisma Migrate.

3. Aplicar las migraciones y cargar el contenido:

   ```bash
   npx prisma migrate deploy
   npm run db:sembrar
   ```

4. Generar un `JWT_SECRET` nuevo y cambiar la contraseña del administrador.

No hace falta tocar el código: `src/db/prisma.ts` usa el adaptador
`@prisma/adapter-pg`, que sirve igual para el contenedor local y para Supabase.

**Lo que conviene decidir antes.** Supabase trae su propio sistema de
autenticación y políticas RLS. Esta API implementa la suya con JWT propio, que
es suficiente para el panel de administración. Si más adelante quieres que los
usuarios del sitio inicien sesión, vale la pena evaluar si conviene adoptar
Supabase Auth en lugar de mantener dos sistemas.

## Estructura

```
Backend/
├─ docker-compose.yml    Postgres local y, con perfil, la API
├─ Dockerfile            Imagen de la API en dos etapas
├─ prisma/
│  ├─ schema.prisma      Modelo de datos y enumeraciones
│  ├─ migrations/        Historial de migraciones
│  ├─ seed.ts            Contenido inicial (áreas, proyectos, cifras, admin)
│  └─ limpiar.ts         Borra los envíos de prueba
├─ pruebas/
│  └─ humo.ts            Prueba de extremo a extremo de todos los endpoints
├─ src/
│  ├─ index.ts           Arranque y cierre ordenado del servidor
│  ├─ app.ts             Middleware y montaje de rutas
│  ├─ config/entorno.ts  Validación de variables de entorno
│  ├─ db/prisma.ts       Cliente de base de datos
│  ├─ dominio/           Validadores derivados de las enumeraciones
│  ├─ middleware/        Autenticación, validación, errores y límites
│  ├─ rutas/             Un archivo por recurso
│  ├─ tipos/             Extensiones de tipos de Express
│  └─ utilidades/        Errores HTTP, paginación y parámetros
├─ .env                  Configuración local (no se versiona)
└─ prisma7.config.ts     Configuración del CLI de Prisma
```

## Decisiones de diseño

**Postgres desde el inicio.** El primer borrador usó SQLite por comodidad, pero
se migró antes de escribir más código: desarrollar contra un motor distinto al
de producción esconde diferencias que aparecen al desplegar. Una ya apareció al
migrar: `contains` distingue mayúsculas en Postgres y no en SQLite, así que la
búsqueda de la bandeja necesitó `mode: "insensitive"`.

**Enumeraciones nativas.** Los estados son tipos `enum` de Postgres, no texto
libre. La base de datos rechaza un valor inválido incluso desde una consulta
manual. Los validadores de Zod en `src/dominio/enumeraciones.ts` se derivan de
las enumeraciones que genera Prisma, así que agregar un valor en el esquema lo
habilita en la API sin tocar una segunda lista.

**Montos en céntimos.** Las donaciones se guardan como enteros
(`montoCentimos`) para evitar los errores de redondeo de los decimales. La API
recibe y devuelve soles; la conversión ocurre en la capa de rutas.

**Slugs como identificador público.** Áreas y proyectos se consultan y editan
por `slug`, no por su id interno, para que las URLs coincidan con las del
sitio.

**Listas que se reemplazan.** Al editar los objetivos de un área o los aliados
de un proyecto, la lista completa se sustituye dentro de una transacción. Es
más predecible que conciliar elemento por elemento desde un formulario.

**Un límite por formulario.** Contacto, voluntariado y donaciones tienen
contadores independientes: enviar un mensaje no debe agotar la cuota de quien
además quiere postular como voluntario.

**Las migraciones no corren al arrancar.** El contenedor solo sirve la API. Si
varias réplicas migraran al iniciar, competirían por el mismo cambio de
esquema; `prisma migrate deploy` se ejecuta como paso aparte del despliegue.

## Pendientes

- **Notificación por correo** cuando llega un mensaje o una postulación. Hoy
  todo queda guardado en la base de datos, así que nada se pierde; falta el
  aviso al equipo (`src/rutas/contacto.ts`).
- **Pasarela de pago** para donaciones (Culqi, Izipay o Mercado Pago). Hoy la
  donación se registra como `PENDIENTE` y se confirma a mano
  (`src/rutas/donaciones.ts`).
- **Conectar el frontend.** El sitio sigue leyendo el contenido desde
  `Frontend/src/lib/*.ts` y su formulario usa una Server Action que solo
  valida. Falta apuntar ambos a esta API.
- **Subida de imágenes** para proyectos y áreas. Cuando se use Supabase, su
  Storage es la opción natural.
- **Pruebas unitarias** además de la prueba de humo actual.
- **Revisar contra el documento de especificación** cuando esté disponible.
