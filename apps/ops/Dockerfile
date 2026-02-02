FROM node:20-alpine AS base

FROM base AS builder
RUN apk add --no-cache libc6-compat
RUN apk update
# Set working directory
WORKDIR /app
# Install turbo globally using the version from package.json
COPY package.json pnpm-lock.yaml* ./
RUN npm install -g turbo@$(node -p "require('./package.json').devDependencies.turbo")
# Copy workspace config files
COPY turbo.json turbo.json
COPY pnpm-workspace.yaml pnpm-workspace.yaml
# Copy only the ops app
COPY apps/ops apps/ops
# Prune the monorepo to only include ops and its dependencies
RUN turbo prune ops --docker

# Add lockfile and package.json's of isolated subworkspace
FROM base AS installer
RUN apk add --update --no-cache libc6-compat make gcc g++ python3 pkgconfig pixman-dev cairo-dev pango-dev libjpeg-turbo-dev
RUN apk update
WORKDIR /app

# Copy pruned lockfile and package.json files
COPY --from=builder /app/out/json/ .
# Use full lockfile instead of pruned one to avoid missing dependencies as this is a known issue with
# https://github.com/vercel/turborepo/issues/2791
COPY --from=builder /app/pnpm-lock.yaml ./pnpm-lock.yaml
RUN --mount=type=secret,id=npmtoken echo "//npm.pkg.github.com/:_authToken=$(cat /run/secrets/npmtoken)" > /root/.npmrc
RUN npm install -g corepack && corepack enable
ENV COREPACK_INTEGRITY_KEYS=0
ENV COREPACK_DEFAULT_TO_LATEST=0
RUN pnpm i --frozen-lockfile

# Copy pruned source code
COPY --from=builder /app/out/full/ .

ARG NEXT_PUBLIC_BACKEND_URL
ARG NEXT_PUBLIC_BASE_URL
ARG NEXT_PUBLIC_SE2_BACKEND_URL
ARG NEXT_PUBLIC_AUTH0_AUDIENCE
ARG NEXT_PUBLIC_THEME
ARG NEXT_PUBLIC_S3_BUCKET_BASE_URL
ARG NEXT_PUBLIC_DATADOG_APPLICATION_ID
ARG NEXT_PUBLIC_DATADOG_CLIENT_TOKEN
ARG NEXT_PUBLIC_DATADOG_BROWSER_APPLICATION_ID
ARG NEXT_PUBLIC_DATADOG_ENV
ARG NEXT_PUBLIC_GOOGLEANALYTICS_ENV
ARG NEXT_PUBLIC_SEGMENT_ANALYTICS_KEY
ARG NEXT_PUBLIC_GIT_SHA
ARG NEXT_PUBLIC_ACCESS_MANAGEMENT_URL
ARG DATADOG_API_KEY
ARG NEXT_PUBLIC_FARMERS_APEX_REDIRECT_URL
ARG NEXT_PUBLIC_ZEMBED_CDN_URL
ARG NEXT_PUBLIC_ZEMBED_API_URL

# Save the public enviroment variables NEXTjs requires for the frontend.
# THESE SHOULD NOT BE SECRETS
RUN echo "NEXT_PUBLIC_BACKEND_URL=${NEXT_PUBLIC_BACKEND_URL}" >> .env.production
RUN echo "NEXT_PUBLIC_BASE_URL=${NEXT_PUBLIC_BASE_URL}" >> .env.production
RUN echo "NEXT_PUBLIC_SE2_BACKEND_URL=${NEXT_PUBLIC_SE2_BACKEND_URL}" >> .env.production
RUN echo "NEXT_PUBLIC_THEME=${NEXT_PUBLIC_THEME}" >> .env.production
RUN echo "NEXT_PUBLIC_AUTH0_AUDIENCE=${NEXT_PUBLIC_AUTH0_AUDIENCE}" >> .env.production
RUN echo "NEXT_PUBLIC_S3_BUCKET_BASE_URL=${NEXT_PUBLIC_S3_BUCKET_BASE_URL}" >> .env.production
RUN echo "NEXT_PUBLIC_DATADOG_APPLICATION_ID=${NEXT_PUBLIC_DATADOG_APPLICATION_ID}" >> .env.production
RUN echo "NEXT_PUBLIC_DATADOG_CLIENT_TOKEN=${NEXT_PUBLIC_DATADOG_CLIENT_TOKEN}" >> .env.production
RUN echo "NEXT_PUBLIC_DATADOG_BROWSER_APPLICATION_ID=${NEXT_PUBLIC_DATADOG_BROWSER_APPLICATION_ID}" >> .env.production
RUN echo "NEXT_PUBLIC_DATADOG_ENV=${NEXT_PUBLIC_DATADOG_ENV}" >> .env.production
RUN echo "NEXT_PUBLIC_GOOGLEANALYTICS_ENV=${NEXT_PUBLIC_GOOGLEANALYTICS_ENV}" >> .env.production
RUN echo "NEXT_PUBLIC_SEGMENT_ANALYTICS_KEY=${NEXT_PUBLIC_SEGMENT_ANALYTICS_KEY}" >> .env.production
RUN echo "NEXT_PUBLIC_GIT_SHA=${NEXT_PUBLIC_GIT_SHA}" >> .env.production
RUN echo "NEXT_PUBLIC_ACCESS_MANAGEMENT_URL=${NEXT_PUBLIC_ACCESS_MANAGEMENT_URL}" >> .env.production
RUN echo "DATADOG_API_KEY=${DATADOG_API_KEY}" >> .env.production
RUN echo "NEXT_PUBLIC_FARMERS_APEX_REDIRECT_URL=${NEXT_PUBLIC_FARMERS_APEX_REDIRECT_URL}" >> .env.production
RUN echo "NEXT_PUBLIC_ZEMBED_CDN_URL=${NEXT_PUBLIC_ZEMBED_CDN_URL}" >> .env.production
RUN echo "NEXT_PUBLIC_ZEMBED_API_URL=${NEXT_PUBLIC_ZEMBED_API_URL}" >> .env.production
ENV NEXT_TELEMETRY_DISABLED 1
ENV NODE_OPTIONS=--max-old-space-size=4096

RUN pnpm turbo build --filter ops
RUN --mount=type=secret,id="DATADOG_API_KEY" DATADOG_API_KEY="$(cat /run/secrets/DATADOG_API_KEY)" npx @datadog/datadog-ci sourcemaps upload ./.next/static --service=zinnia-live-xd --release-version=${NEXT_PUBLIC_GIT_SHA} --minified-path-prefix=/static

FROM base AS runner
WORKDIR /app

# Don't run production as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs

COPY --from=installer /app/apps/ops/public ./public
# COPY --from=installer /app/apps/ops/storybook-static ./storybook-static
COPY --from=installer /app/apps/ops/next.config.js .
COPY --from=installer /app/apps/ops/package.json .

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=installer --chown=nextjs:nodejs /app/apps/ops/.next/standalone ./
COPY --from=installer --chown=nextjs:nodejs /app/apps/ops/.next/static ./apps/ops/.next/static
COPY --from=installer --chown=nextjs:nodejs /app/apps/ops/public ./apps/ops/public

EXPOSE 3000
# Expose the inspector port
EXPOSE 9229
ENV PORT 3000


CMD HOSTNAME="0.0.0.0" NODE_OPTIONS='--max-http-header-size=64000' node apps/ops/server.js
