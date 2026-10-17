# syntax=docker/dockerfile:1
FROM dhi.io/bun:1-dev AS dependencies
WORKDIR /app
COPY package.json bun.lock bunfig.toml ./
COPY apps/web/package.json ./apps/web/package.json
COPY apps/slack-bot/package.json ./apps/slack-bot/package.json
RUN --mount=type=cache,target=/root/.bun/install/cache bun install --frozen-lockfile

FROM dependencies AS build
COPY apps/slack-bot ./apps/slack-bot
WORKDIR /app/apps/slack-bot
RUN bun run generate

FROM dhi.io/bun:1-dev AS production-dependencies
WORKDIR /app
COPY package.json bun.lock bunfig.toml ./
COPY apps/web/package.json ./apps/web/package.json
COPY apps/slack-bot/package.json ./apps/slack-bot/package.json
RUN --mount=type=cache,target=/root/.bun/install/cache bun install --frozen-lockfile --production --ignore-scripts

FROM dhi.io/bun:1 AS runtime
ENV NODE_ENV=production
WORKDIR /app
COPY --from=production-dependencies --chown=65532:65532 /app/node_modules ./node_modules
COPY --from=build --chown=65532:65532 /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=build --chown=65532:65532 /app/apps/slack-bot ./apps/slack-bot
WORKDIR /app/apps/slack-bot
EXPOSE 3001
CMD ["bun", "src/app.js"]
