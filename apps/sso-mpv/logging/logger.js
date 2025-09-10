import { createLogger, transports, config } from 'winston';

// TODO: We need to actually integrate this with data dog. Currently this just logs to the server console.
const logger = createLogger({
  levels: config.syslog.levels,
  transports: [new transports.Console()],
});

export default logger;
