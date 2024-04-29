import pino from 'pino';

const levelToStatus = {
  10: 'trace',
  20: 'debug',
  30: 'info',
  40: 'warn',
  50: 'error',
  60: 'fatal',
  99: 'compliance',
};
const logger = pino({
  // put browser logs into a single line for datadog.  Used for middleware, which is considered browser?
  browser: {
    write: o => {
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
  },
  // adds a status for datadog
  formatters: {
    level: (label, number) => {
      return { status: label, level: number };
    },
  },
  customLevels: {
    compliance: 99, // compliance logs should be shipped if logging is enabled.
  },
  // level of logs to display. trace|debug|info|warn|error|fatal
  level: process.env.PINO_LOG_LEVEL || 'trace',
}).child({
  app_name: 'consumer-ui',
  service: 'consumer-ui',
  env: process.env.NEXT_PUBLIC_DATADOG_ENV || '',
  version: process.env.NEXT_PUBLIC_GIT_SHA || '',
});

export default logger;
