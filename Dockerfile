FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build frontend and backend
RUN npm run build

# Production image, copy all the files and run the server
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 repuradar
USER repuradar

COPY --from=builder --chown=repuradar:nodejs /app/dist ./dist
COPY --from=builder --chown=repuradar:nodejs /app/frontend/dist ./frontend/dist
COPY --from=builder --chown=repuradar:nodejs /app/package.json ./package.json
COPY --from=builder --chown=repuradar:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=repuradar:nodejs /app/Procfile ./Procfile

EXPOSE 5000

CMD ["npm", "run", "start"]