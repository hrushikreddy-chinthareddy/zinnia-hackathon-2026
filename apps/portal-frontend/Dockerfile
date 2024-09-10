FROM node:20-alpine AS base

FROM base AS builder
RUN apk add --no-cache libc6-compat
RUN apk update
# Set working directory
WORKDIR /app
RUN npm install -g turbo@2.0.4
COPY . .
RUN turbo prune portal-frontend --docker

# Add lockfile and package.json's of isolated subworkspace
FROM base AS installer
RUN apk add --no-cache libc6-compat
RUN apk update
WORKDIR /app

# First install the dependencies (as they change less often)
COPY .gitignore .gitignore
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN --mount=type=secret,id=npmtoken echo "//npm.pkg.github.com/:_authToken=$(cat /run/secrets/npmtoken)" > /root/.npmrc
RUN corepack enable pnpm && pnpm i

# Build the project
COPY --from=builder /app/out/full/ .

ARG NEXT_PUBLIC_BACKEND_URL
ARG NEXT_PUBLIC_BASE_URL
ARG NEXT_PUBLIC_SE2_BACKEND_URL
ARG NEXT_PUBLIC_THEME
ARG NEXT_PUBLIC_S3_BUCKET_BASE_URL
ARG NEXT_PUBLIC_DATADOG_APPLICATION_ID
ARG NEXT_PUBLIC_DATADOG_CLIENT_TOKEN
ARG NEXT_PUBLIC_DATADOG_ENV
ARG NEXT_PUBLIC_GOOGLEANALYTICS_ENV
ARG NEXT_PUBLIC_GIT_SHA
ARG DATADOG_API_KEY

# Save the public enviroment variables NEXTjs requires for the frontend.
# THESE SHOULD NOT BE SECRETS
RUN echo "NEXT_PUBLIC_BACKEND_URL=${NEXT_PUBLIC_BACKEND_URL}" >> .env.production
RUN echo "NEXT_PUBLIC_BASE_URL=${NEXT_PUBLIC_BASE_URL}" >> .env.production
RUN echo "NEXT_PUBLIC_SE2_BACKEND_URL=${NEXT_PUBLIC_SE2_BACKEND_URL}" >> .env.production
RUN echo "NEXT_PUBLIC_THEME=${NEXT_PUBLIC_THEME}" >> .env.production
RUN echo "NEXT_PUBLIC_S3_BUCKET_BASE_URL=${NEXT_PUBLIC_S3_BUCKET_BASE_URL}" >> .env.production
RUN echo "NEXT_PUBLIC_DATADOG_APPLICATION_ID=${NEXT_PUBLIC_DATADOG_APPLICATION_ID}" >> .env.production
RUN echo "NEXT_PUBLIC_DATADOG_CLIENT_TOKEN=${NEXT_PUBLIC_DATADOG_CLIENT_TOKEN}" >> .env.production
RUN echo "NEXT_PUBLIC_DATADOG_ENV=${NEXT_PUBLIC_DATADOG_ENV}" >> .env.production
RUN echo "NEXT_PUBLIC_GOOGLEANALYTICS_ENV=${NEXT_PUBLIC_GOOGLEANALYTICS_ENV}" >> .env.production
RUN echo "NEXT_PUBLIC_GIT_SHA=${NEXT_PUBLIC_GIT_SHA}" >> .env.production
ENV NEXT_TELEMETRY_DISABLED 1

RUN pnpm turbo run build --filter=portal-frontend
RUN pnpm run build-storybook --filter=portal-frontend
RUN --mount=type=secret,id="DATADOG_API_KEY" DATADOG_API_KEY="$(cat /run/secrets/DATADOG_API_KEY)" npx @datadog/datadog-ci sourcemaps upload ./.next/static --service=zinnia-live-xd --release-version=${NEXT_PUBLIC_GIT_SHA} --minified-path-prefix=/static

FROM base AS runner
WORKDIR /app

# Don't run production as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs

COPY --from=installer /app/apps/portal-frontend/public ./public
COPY --from=installer /app/apps/portal-frontend/storybook-static ./storybook-static
COPY --from=installer /app/apps/portal-frontend/next.config.js .
COPY --from=installer /app/apps/portal-frontend/package.json .

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=installer --chown=nextjs:nodejs /app/apps/portal-frontend/.next/standalone ./
COPY --from=installer --chown=nextjs:nodejs /app/apps/portal-frontend/.next/static ./apps/portal-frontend/.next/static
COPY --from=installer --chown=nextjs:nodejs /app/apps/portal-frontend/public ./apps/portal-frontend/public

EXPOSE 3000
# Expose the inspector port
EXPOSE 9229
ENV PORT 3000


CMD HOSTNAME="0.0.0.0" NODE_OPTIONS='--max-http-header-size=32000' node apps/portal-frontend/server.js