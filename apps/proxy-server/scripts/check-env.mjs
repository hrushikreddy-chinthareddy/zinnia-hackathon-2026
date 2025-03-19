import '@dotenvx/dotenvx/config';

const requiredEnvVars = [
  'API_URL',
  'LOGIN_API_URL',
  'CLIENT_ID',
  'CLIENT_SECRET',
  'GRANT_TYPE',
  'AUDIENCE',
];

const missingEnvVars = requiredEnvVars.filter((key) => !process.env[key]);

if (missingEnvVars.length > 0) {
  console.error(
    `Missing the following environment variables in .env.local: ${missingEnvVars.join(', ')}. Please reach out to a team member for help.`
  );
  process.exit(1); // Exit with a failure code
}