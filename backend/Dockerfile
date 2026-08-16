# Stage 1: Base
FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

# Stage 2: Builder
FROM base AS builder
ARG APP_NAME

# Copy konfigurasi workspace & source code
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json nest-cli.json tsconfig*.json ./
COPY prisma ./prisma/
COPY apps ./apps/

# Install dependencies & generate Prisma client
RUN pnpm install --frozen-lockfile
RUN pnpm prisma generate

# Build aplikasi spesifik
RUN pnpm --filter ${APP_NAME} build

# Stage 3: Production Runner
# Production Stage
FROM base AS runner
ARG APP_NAME
ENV APP_NAME_ENV=${APP_NAME}

WORKDIR /app

# Copy root workspace files & node_modules
COPY --from=builder /app/package.json /app/pnpm-workspace.yaml ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma

# Copy hasil build langsung dari lokasi folder app
COPY --from=builder /app/apps/${APP_NAME_ENV}/src ./dist

EXPOSE 3000 3001 3002

# Jalankan aplikasi
CMD ["node", "dist/main.js"]