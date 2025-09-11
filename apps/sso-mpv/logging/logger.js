import pino from 'pino';

const logger = pino({}).child({
  service: 'sso-mpv',
  env: process.env.ENVIRONMENT_NAME || '',
});

export default logger;
