//
// for this integration to work the following environment variables must be
// set on the ECS task definition:
//
// Frontend Specific:
//
//   {
//     "name": "DD_AGENT_HOST",
//     "value": "127.0.0.1"
//   },
//   {
//     "name": "DD_TRACE_AGENT_PORT",
//     "value": "8126"
//   }
//
// Datadog Agent Specific:
//
// {
//   "name": "DD_APM_ENABLED",
//   "value": "true"
// },
// {
//   "name": "DD_APM_NON_LOCAL_TRAFFIC",
//   "value": "true"
// },
// {
//   "name": "DD_LOG_LEVEL",
//   "value": "ERROR"
// },
// {
//   "name": "DD_DOGSTATSD_NON_LOCAL_TRAFFIC",
//   "value": "true"
// }
//

export async function register() {
    if (process.env.NEXT_RUNTIME === 'nodejs') {
        try {
            const config = {
                logInjection: true,
                runtimeMetrics: true,
                tracePropagationStyle: ['datadog', 'tracecontext'],
                hostname: process.env.DD_AGENT_HOST || '127.0.0.1',
                port: parseInt(process.env.DD_TRACE_AGENT_PORT || '8126', 10),
                service: process.env.DD_SERVICE || 'zinnia-live-xd',
                env: process.env.NEXT_PUBLIC_DATADOG_ENV || '',
                version: process.env.NEXT_PUBLIC_GIT_SHA || '',
            };

            const tracer = await import('dd-trace');
            tracer.default.init(config);
        } catch (error) {
            console.error(
                '❌ [INSTRUMENTATION] Failed to initialize Datadog tracer:',
                error
            );
        }
    } else {
        console.log(
            '⚠️ [INSTRUMENTATION] Skipping - not nodejs runtime:',
            process.env.NEXT_RUNTIME
        );
    }
}
