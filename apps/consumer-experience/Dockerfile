FROM node:20-alpine AS base

FROM base AS builder
RUN apk add --no-cache libc6-compat
RUN apk update
# Set working directory
WORKDIR /app
RUN npm install -g turbo@1.12.2
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
RUN corepack enable pnpm && pnpm i

# Build the project
COPY --from=builder /app/out/full/ .

ARG NEXT_PUBLIC_MOCK_API_REQUEST
ARG NEXT_PUBLIC_BACKEND_URL
ARG NEXT_PUBLIC_BASE_URL

ENV NEXT_PUBLIC_MOCK_API_REQUEST=$NEXT_PUBLIC_MOCK_API_REQUEST \
    NEXT_PUBLIC_BACKEND_URL=$NEXT_PUBLIC_BACKEND_URL \
    NEXT_PUBLIC_BASE_URL=$NEXT_PUBLIC_BASE_URL
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

# ARG AUTH0_SECRET
# ARG AUTH0_BASE_URL
# ARG AUTH0_ISSUER_BASE_URL
# ARG AUTH0_CLIENT_ID
# ARG AUTH0_CLIENT_SECRET
# ARG AUTH0_AUDIENCE
# ARG AUTH0_SESSION_ROLLING_DURATION
# ARG AUTH0_SESSION_AUTO_SAVE
# ARG AUTH0_SESSION_ROLLING
# ARG AUTH0_ORANGANIZATION_ID

# ENV AUTH0_SECRET=$AUTH0_SECRET \
#     AUTH0_BASE_URL=$AUTH0_BASE_URL \
#     AUTH0_ISSUER_BASE_URL=$AUTH0_ISSUER_BASE_URL \
#     AUTH0_CLIENT_ID=$AUTH0_CLIENT_ID \
#     AUTH0_CLIENT_SECRET=$AUTH0_CLIENT_SECRET \
#     AUTH0_AUDIENCE=$AUTH0_AUDIENCE \
#     AUTH0_SESSION_ROLLING_DURATION=$AUTH0_SESSION_ROLLING_DURATION \
#     AUTH0_SESSION_AUTO_SAVE=$AUTH0_SESSION_AUTO_SAVE \
#     AUTH0_SESSION_ROLLING=$AUTH0_SESSION_ROLLING \
#     AUTH0_ORANGANIZATION_ID=$AUTH0_ORANGANIZATION_ID


CMD HOSTNAME="0.0.0.0" NODE_OPTIONS='--max-http-header-size=32000' node apps/consumer-experience/server.js