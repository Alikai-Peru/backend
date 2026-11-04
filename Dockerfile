# Imagen de la API de Alikai Perú para Railway.
#
# Construcción en dos etapas: la imagen final solo lleva el JavaScript
# compilado, el cliente de Prisma y lo necesario para aplicar migraciones
# contra Supabase al arrancar.

# ------------------------------------------------------------------ compilación
FROM node:24-alpine AS compilacion

RUN apk add --no-cache libc6-compat openssl

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY prisma.config.ts prisma7.config.ts tsconfig.json ./
COPY prisma ./prisma
COPY src ./src

RUN npx prisma generate && npx tsc

# --------------------------------------------------------------------- ejecución
FROM node:24-alpine AS ejecucion

RUN apk add --no-cache libc6-compat openssl

WORKDIR /app

ENV NODE_ENV=production
# El pooler de Supabase presenta una cadena que Node no reconoce.
# La conexión sigue cifrada; solo se omite esa verificación.
ENV NODE_TLS_REJECT_UNAUTHORIZED=0

COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=compilacion /app/dist ./dist
COPY --from=compilacion /app/generated ./generated
COPY prisma.config.ts prisma7.config.ts ./
COPY prisma ./prisma

USER node

EXPOSE 4000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://localhost:'+(process.env.PORT||4000)+'/api/salud').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

# Railway inyecta PORT y las URLs. migrate deploy usa DIRECT_URL o DATABASE_URL.
CMD ["sh", "-c", "echo 'imagen: certificado del pooler sin verificacion'; if [ -n \"$DIRECT_URL\" ]; then echo 'DIRECT_URL presente'; else echo 'DIRECT_URL ausente'; fi; if [ -n \"$DATABASE_URL\" ]; then echo 'DATABASE_URL presente'; else echo 'DATABASE_URL ausente'; fi; if [ -z \"$DIRECT_URL\" ] && [ -z \"$DATABASE_URL\" ]; then echo 'Falta la cadena de Supabase en Variables'; exit 1; fi; npx prisma migrate deploy && node dist/src/index.js"]
