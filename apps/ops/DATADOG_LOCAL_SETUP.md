# Datadog Agent - Local Development Setup

This guide explains how to run the Datadog agent locally alongside the Next.js app for APM (Application Performance Monitoring) and distributed tracing.

## Overview

The Datadog agent configuration in `Dockerfile.datadog` matches the ECS task definition. This ensures consistent monitoring behavior between local development and deployed environments.

## Prerequisites

-   Docker installed on your machine
-   Datadog API key (obtain from your Datadog account)
-   The Next.js app configured with Datadog APM instrumentation

## Configuration Details

The Datadog agent is configured with the following settings (matching ECS):

-   **APM Enabled**: `DD_APM_ENABLED=true`
-   **Non-local Traffic**: `DD_APM_NON_LOCAL_TRAFFIC=true` (allows the agent to receive traces from containers/localhost)
-   **DogStatsD**: `DD_DOGSTATSD_NON_LOCAL_TRAFFIC=true` (allows metrics from external sources)
-   **Log Level**: `DD_LOG_LEVEL=ERROR` (minimal logging)
-   **Port**: `8126` (APM trace agent port)

## Quick Start

### 1. Build the Datadog Agent Image

```bash
cd apps/ops
docker build -f Dockerfile.datadog -t datadog-agent-local .
```

### 2. Run the Datadog Agent

```bash
docker run \
  --name datadog-agent \
  -e DD_API_KEY=<YOUR_DATADOG_API_KEY> \
  -p 8126:8126 \
  datadog-agent-local
```

Replace `<YOUR_DATADOG_API_KEY>` with your actual Datadog API key.

### 3. Configure Your Next.js App

Ensure your Next.js app has the following environment variables set (these should already be in your `.env.development.local`):

```bash
DD_AGENT_HOST=127.0.0.1
DD_TRACE_AGENT_PORT=8126
```

### 4. Start Your Next.js App

```bash
npm run dev
# or
yarn dev
```

The app will now send APM traces to the local Datadog agent, which forwards them to Datadog.

## Using Docker Compose (Recommended)

For easier management, you can use Docker Compose to run both the Datadog agent and your Next.js app together.

### Create `docker-compose.datadog.yml`

```yaml
version: '3.8'

services:
    datadog-agent:
        build:
            context: .
            dockerfile: Dockerfile.datadog
        container_name: datadog-agent-local
        environment:
            - DD_API_KEY=${DD_API_KEY}
        ports:
            - '8126:8126'
        networks:
            - app-network

networks:
    app-network:
        driver: bridge
```

### Run with Docker Compose

```bash
# Set your API key
export DD_API_KEY=<YOUR_DATADOG_API_KEY>

# Start the Datadog agent
docker-compose -f docker-compose.datadog.yml up -d

# Start your Next.js app in another terminal
npm run dev
```

## Verifying the Setup

### Check Agent Status

```bash
docker exec -it datadog-agent agent status
```

This will show you the agent's status, including APM configuration and whether it's receiving traces.

### Check Agent Logs

```bash
docker logs datadog-agent
```

### Verify APM Traces

1. Run your Next.js app and generate some traffic (visit pages, make API calls)
2. Go to your Datadog dashboard → APM → Traces
3. You should see traces from your local environment

## Stopping the Agent

### If running in foreground (without -d flag):

Press `Ctrl+C` in the terminal where the agent is running. Then remove the container:

```bash
docker rm datadog-agent
```

### If running in background (with -d flag):

```bash
docker stop datadog-agent
docker rm datadog-agent
```

### If running with docker-compose:

```bash
docker-compose -f docker-compose.datadog.yml down
```

## Troubleshooting

### No traces appearing in Datadog

1. **Check agent is running**: `docker ps | grep datadog`
2. **Verify API key**: Ensure `DD_API_KEY` is set correctly
3. **Check app configuration**: Verify `DD_AGENT_HOST=127.0.0.1` and `DD_TRACE_AGENT_PORT=8126`
4. **Check instrumentation**: Ensure your app has Datadog APM instrumentation enabled (check `instrumentation.ts`)
5. **Network connectivity**: If using Docker for the Next.js app too, ensure both containers are on the same network

### Agent container exits immediately

-   Check logs: `docker logs datadog-agent`
-   Verify the API key is valid
-   Ensure port 8126 is not already in use: `lsof -i :8126`

### Connection refused errors

-   If your Next.js app is in a Docker container, use `host.docker.internal` instead of `127.0.0.1` for `DD_AGENT_HOST`
-   Ensure the Datadog agent container is running before starting your app

## Environment Variables Reference

### Required for Datadog Agent:

-   `DD_API_KEY`: Your Datadog API key (required)

### Required for Next.js App:

-   `DD_AGENT_HOST`: `127.0.0.1` (or `host.docker.internal` if app is containerized)
-   `DD_TRACE_AGENT_PORT`: `8126`

### Optional for Enhanced Monitoring:

-   `DD_SERVICE`: Service name (e.g., `zinnia-live-xd`)
-   `DD_ENV`: Environment name (e.g., `local`, `dev`)
-   `DD_VERSION`: App version for tracking deployments

## Additional Resources

-   [Datadog APM Documentation](https://docs.datadoghq.com/tracing/)
-   [Datadog Agent Docker Documentation](https://docs.datadoghq.com/agent/docker/)
-   [Next.js APM Integration](https://docs.datadoghq.com/tracing/setup_overview/setup/nodejs/)
