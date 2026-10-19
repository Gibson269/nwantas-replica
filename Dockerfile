# syntax=docker/dockerfile:1.4
# ==============================================================================
# Nwantas Enterprise School Operating System - Multi-Stage Production Dockerfile
# Optimized for Nuxt 4 / Nitro Node-Server Engine
# ==============================================================================

# Stage 1: Build Dependencies & Production Bundle
FROM node:24-alpine AS builder

WORKDIR /app

# Install build prerequisites
RUN apk add --no-cache python3 make g++

# Copy package specifications
COPY package.json package-lock.json ./

# Install exact dependencies
RUN npm ci

# Copy full application codebase
COPY . .

# Generate SQLite default schema/seeds and build production bundle
RUN npm run build

# Stage 2: Minimal Production Runtime
FROM node:24-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000
ENV NITRO_PRESET=node-server

# Install curl for container health check
RUN apk add --no-cache curl

# Create unprivileged user for security compliance
RUN addgroup -S nwantas && adduser -S nwantas -G nwantas

# Copy compiled Nitro bundle and database schemas
COPY --from=builder --chown=nwantas:nwantas /app/.output ./.output
COPY --from=builder --chown=nwantas:nwantas /app/server/database/schema.sql ./server/database/schema.sql

# Persistent data directory for SQLite database & uploaded documents
RUN mkdir -p /app/.data && chown -R nwantas:nwantas /app/.data

VOLUME ["/app/.data"]

USER nwantas

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD curl -f http://localhost:3000/api/v1/classes || exit 1

CMD ["node", ".output/server/index.mjs"]
