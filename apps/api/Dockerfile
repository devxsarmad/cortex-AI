FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
COPY apps/api/package.json apps/api/package.json
COPY packages/config/package.json packages/config/package.json
COPY packages/shared-types/package.json packages/shared-types/package.json
RUN npm ci

FROM node:22-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/api/node_modules ./apps/api/node_modules
COPY package.json package-lock.json ./
COPY apps/api ./apps/api
COPY packages ./packages
RUN npm run build --workspace @cortex/api

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=build /app/apps/api/dist ./apps/api/dist
COPY package.json package-lock.json ./
COPY apps/api/package.json apps/api/package.json
EXPOSE 4000
CMD ["npm", "run", "start", "--workspace", "@cortex/api"]
