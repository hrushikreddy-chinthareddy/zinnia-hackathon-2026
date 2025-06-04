FROM node:22-alpine AS base
WORKDIR /app

FROM base AS builder

COPY ./out/ ./

RUN npm install -g pnpm

RUN pnpm install --frozen-lockfile
RUN pnpm build

FROM base AS runner

COPY --from=builder /app /app

WORKDIR /app/apps/sso-mpv

EXPOSE 3000

CMD ["pnpm", "start"]
