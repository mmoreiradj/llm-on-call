FROM node:22-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
WORKDIR /app

FROM base AS dev
COPY package.json pnpm-lock.yaml ./
RUN pnpm i --frozen-lockfile
COPY . .
EXPOSE 3000
CMD [ "pnpm", "run", "start:dev" ]

FROM base AS build
COPY package.json pnpm-lock.yaml ./
RUN pnpm i --frozen-lockfile
COPY . .

RUN pnpm run build && \
  pnpm prune --prod

FROM node:22-alpine AS prod
ENV NODE_ENV=production
RUN apk add --no-cache tini

WORKDIR /app
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules

EXPOSE 3000
ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "dist/main.js"]
