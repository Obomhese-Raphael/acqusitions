# syntax=docker/dockerfile:1

FROM node:20-bookworm-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

FROM node:20-bookworm-slim AS deps-dev
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:20-bookworm-slim AS base
WORKDIR /app

COPY package.json package-lock.json ./
COPY src ./src
COPY drizzle ./drizzle
COPY drizzle.config.js ./drizzle.config.js

# Winston writes to ./logs by default
RUN mkdir -p logs

EXPOSE 3000

# --- Development image ---
FROM base AS dev
COPY --from=deps-dev /app/node_modules ./node_modules
ENV NODE_ENV=development
CMD ["npm", "run", "dev"]

# --- Production image ---
FROM base AS prod
COPY --from=deps /app/node_modules ./node_modules
ENV NODE_ENV=production
CMD ["node", "src/index.js"]
