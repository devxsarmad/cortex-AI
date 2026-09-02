FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
COPY apps/web/package.json apps/web/package.json
COPY packages/config/package.json packages/config/package.json
COPY packages/shared-types/package.json packages/shared-types/package.json
RUN npm ci

FROM node:22-alpine AS build
WORKDIR /app
ARG NEXT_PUBLIC_API_URL=http://localhost:4000
ARG NEXT_PUBLIC_CORTEX_API_KEY=
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_CORTEX_API_KEY=$NEXT_PUBLIC_CORTEX_API_KEY
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/web/node_modules ./apps/web/node_modules
COPY package.json package-lock.json ./
COPY apps/web ./apps/web
COPY packages ./packages
RUN npm run build --workspace @cortex/web

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/web/node_modules ./apps/web/node_modules
COPY --from=build /app/apps/web/.next ./apps/web/.next
COPY package.json package-lock.json ./
COPY apps/web/package.json apps/web/package.json
EXPOSE 3000
CMD ["npm", "run", "start", "--workspace", "@cortex/web"]
