import pino from 'pino';

const logger = pino({}).child({
  service: 'sso-mypolicyview',
  env: process.env.ENVIRONMENT_NAME || '',
});

export default logger;
