# ----------------------------
# Stage 0: Base image
# ----------------------------
FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app

# ----------------------------
# Stage 1: Prune with Turbo
# ----------------------------
FROM base AS builder
RUN npm install -g turbo@2.1.3
COPY . .
RUN turbo prune sso-mpv --docker

# ----------------------------
# Stage 2: Install and Build
# ----------------------------
FROM base AS installer

# Install native deps for packages that need compilation
RUN apk add --no-cache make gcc g++ python3 pkgconfig pixman-dev cairo-dev pango-dev libjpeg-turbo-dev
RUN apk update
WORKDIR /app
COPY .gitignore .gitignore
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/pnpm-lock.yaml ./pnpm-lock.yaml

# Authenticate for GitHub packages if needed (use BuildKit secret)
RUN --mount=type=secret,id=npmtoken \
  echo "//npm.pkg.github.com/:_authToken=$(cat /run/secrets/npmtoken)" > /root/.npmrc

RUN npm install -g corepack && corepack enable
ENV COREPACK_INTEGRITY_KEYS=0
ENV COREPACK_DEFAULT_TO_LATEST=0

# Install dependencies
RUN pnpm i

# Copy full pruned source for build
COPY --from=builder /app/out/full/ .

# Build just the app
RUN pnpm turbo run build --filter=sso-mpv

# ----------------------------
# Stage 3: Runtime image
# ----------------------------
FROM base AS runner
WORKDIR /app

COPY --from=installer /app/apps/sso-mpv/package.json .

# RUN npm install -g pnpm

# # ✅ Copy full app contents from installer
COPY --from=installer /app/ ./


# # Copy lockfile for reproducibility
# COPY --from=installer /app/pnpm-lock.yaml ./pnpm-lock.yaml

EXPOSE 3000

CMD node apps/sso-mpv/index.js
