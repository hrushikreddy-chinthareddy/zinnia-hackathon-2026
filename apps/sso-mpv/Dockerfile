FROM node:22-alpine AS base

FROM base AS builder
RUN apk update
WORKDIR /app
COPY /out /app/out

FROM base AS installer
WORKDIR /app
COPY --from=builder /app/out .
RUN npm install -g pnpm
WORKDIR /app/full/apps/sso-mpv
RUN pnpm i
EXPOSE 3000
ENTRYPOINT ["npm", "start"]
