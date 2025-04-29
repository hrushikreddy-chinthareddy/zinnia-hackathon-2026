import pino from 'pino';

const levelToStatus = {
  10: 'trace',
  20: 'debug',
  30: 'info',
  39: 'compliance',
  40: 'warn',
  50: 'error',
  60: 'fatal',
};

const browserWriter = {
  write: (o: object) => {
    try {
      // level doesn't exist on object, but it does on pino objects
      // @ts-expect-error - pino objects have level
      const status = o?.level ? levelToStatus[o?.level] : '';
      console.log(JSON.stringify({ ...o, status }, undefined, 0));
    } catch (err) {
      if (err instanceof Error) {
        console.log(JSON.stringify(err, ['name', 'message', 'stack]']));
      } else {
        console.log(
          JSON.stringify({ message: 'unknown error occurred while logging' })
        );
      }
    }
  },
};

const formatters = {
  level: (label: string, number: number) => {
    return { status: label, level: number };
  },
  log: (o: Record<string, unknown>) => {
    if (typeof o?.duration === 'number') {
      o.duration = Math.round(o.duration * 1000000); // change duration from milliseconds to nanoseconds
    }
    return o;
  },
};
const logger = pino({
  // put browser logs into a single line for datadog.  Used for middleware, which is considered browser?
  browser: browserWriter,
  // adds a status for datadog
  formatters: formatters,
  customLevels: {
    compliance: 39,
  },
  // level of logs to display. trace|debug|info|warn|error|fatal
  level: process.env.PINO_LOG_LEVEL || 'trace',
}).child({
  app_name: 'consumer-xd',
  service: 'consumer-xd',
  env: process.env.NEXT_PUBLIC_DATADOG_ENV || '',
  version: process.env.NEXT_PUBLIC_GIT_SHA || '',
});

// used to ensure compliance logs are sent to datadog even if the logging level is set to only warn or error
export const complianceLogger = pino({
  browser: browserWriter,
  formatters: formatters,
  customLevels: {
    compliance: 39,
  },
  level: 'trace',
}).child({
  app_name: 'consumer-xd',
  service: 'consumer-xd',
  env: process.env.NEXT_PUBLIC_DATADOG_ENV || '',
  version: process.env.NEXT_PUBLIC_GIT_SHA || '',
});

export default logger;
