# ════════════════════════════════════════════════
# Stage 1 — dependências
# ════════════════════════════════════════════════
FROM node:20-alpine AS deps
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci --prefer-offline

# ════════════════════════════════════════════════
# Stage 2 — build
# ════════════════════════════════════════════════
FROM node:20-alpine AS builder
WORKDIR /app

# Variáveis injetadas em tempo de build (baked no bundle cliente)
ARG NEXT_PUBLIC_BASE_PATH=/mestre
ARG MESTRE_API_URL=http://node:3001
ENV NEXT_PUBLIC_BASE_PATH=$NEXT_PUBLIC_BASE_PATH
ENV MESTRE_API_URL=$MESTRE_API_URL

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

# ════════════════════════════════════════════════
# Stage 3 — imagem de produção (minimal)
# ════════════════════════════════════════════════
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3002
ENV HOSTNAME=0.0.0.0

# next.config.js com output:'standalone' gera .next/standalone/
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
# pasta public é opcional — cria vazia se não existir
RUN mkdir -p ./public

EXPOSE 3002

CMD ["node", "server.js"]
