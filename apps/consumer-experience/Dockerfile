FROM node:20-alpine AS base

FROM base AS builder
RUN apk add --no-cache libc6-compat
RUN apk update
# Set working directory
WORKDIR /app
RUN npm install -g turbo@2.0.4
COPY . .
RUN turbo prune consumer-experience --docker

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
RUN RUN corepack enable && pnpm i

# Build the project
COPY --from=builder /app/out/full/ .

ARG NEXT_PUBLIC_MOCK_API_REQUEST
ARG NEXT_PUBLIC_BACKEND_URL
ARG NEXT_PUBLIC_BASE_URL
ARG NEXT_PUBLIC_DATADOG_APPLICATION_ID
ARG NEXT_PUBLIC_DATADOG_CLIENT_TOKEN
ARG NEXT_PUBLIC_DATADOG_ENV
ARG NEXT_PUBLIC_AUTH0_COOKIE_DOMAIN
ARG NEXT_PUBLIC_AUTH0_COOKIE_DOMAIN_MYPOLICYVIEW
ARG NEXT_PUBLIC_SEGMENT_ANALYTICS_KEY

ENV NEXT_PUBLIC_MOCK_API_REQUEST=$NEXT_PUBLIC_MOCK_API_REQUEST \
    NEXT_PUBLIC_BACKEND_URL=$NEXT_PUBLIC_BACKEND_URL \
    NEXT_PUBLIC_BASE_URL=$NEXT_PUBLIC_BASE_URL \
    NEXT_PUBLIC_DATADOG_APPLICATION_ID=$NEXT_PUBLIC_DATADOG_APPLICATION_ID \
    NEXT_PUBLIC_DATADOG_CLIENT_TOKEN=$NEXT_PUBLIC_DATADOG_CLIENT_TOKEN \
    NEXT_PUBLIC_DATADOG_ENV=$NEXT_PUBLIC_DATADOG_ENV \
    NEXT_PUBLIC_AUTH0_COOKIE_DOMAIN=$NEXT_PUBLIC_AUTH0_COOKIE_DOMAIN \
    NEXT_PUBLIC_AUTH0_COOKIE_DOMAIN_MYPOLICYVIEW=$NEXT_PUBLIC_AUTH0_COOKIE_DOMAIN_MYPOLICYVIEW \
    NEXT_PUBLIC_SEGMENT_ANALYTICS_KEY=$NEXT_PUBLIC_SEGMENT_ANALYTICS_KEY
ENV NEXT_TELEMETRY_DISABLED 1

RUN pnpm turbo run build --filter=consumer-experience

FROM base AS runner
WORKDIR /app

# Don't run production as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs

COPY --from=installer /app/apps/consumer-experience/next.config.js .
COPY --from=installer /app/apps/consumer-experience/package.json .

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=installer --chown=nextjs:nodejs /app/apps/consumer-experience/.next/standalone ./
COPY --from=installer --chown=nextjs:nodejs /app/apps/consumer-experience/.next/static ./apps/consumer-experience/.next/static
COPY --from=installer --chown=nextjs:nodejs /app/apps/consumer-experience/public ./apps/consumer-experience/public

EXPOSE 3000

ENV PORT 3000


CMD HOSTNAME="0.0.0.0" NODE_OPTIONS='--max-http-header-size=32000' node apps/consumer-experience/server.js