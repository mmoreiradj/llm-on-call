FROM node:22-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
WORKDIR /app

# Add a non-root user and group with a specific UID and GID
RUN addgroup -S -g 1500 appgroup && adduser -S -u 1500 -G appgroup appuser

FROM base AS dev
COPY package.json ./
RUN pnpm install
COPY . .
RUN chown -R appuser:appgroup /app
USER appuser
EXPOSE 3000
CMD [ "pnpm", "run", "start:dev" ]

FROM base AS build
COPY package.json ./
RUN pnpm install
COPY . .
RUN pnpm run build && \
  pnpm prune --prod
RUN chown -R appuser:appgroup /app

FROM node:22-alpine AS prod 
ENV NODE_ENV=production
RUN apk add --no-cache tini

# Add a non-root user and group in the prod stage with specific UID and GID
RUN addgroup -S -g 1500 appgroup && adduser -S -u 1500 -G appgroup appuser

WORKDIR /app
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
RUN chown -R appuser:appgroup /app

# Switch to non-root user
USER appuser

EXPOSE 3000
ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "dist/main.js"]