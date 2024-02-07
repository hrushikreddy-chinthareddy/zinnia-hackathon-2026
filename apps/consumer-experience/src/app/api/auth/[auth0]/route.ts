import { handleAuth } from '@auth0/nextjs-auth0';

export const GET = handleAuth({
  // async login(req, res) {
  //     // After login, redirect back to the welcome page and it will determine where the user should land based on the user's permissions.
  //     await handleLogin(req, res, {
  //         returnTo: '/',
  //         authorizationParams: {
  //             scope: 'openid profile email offline_access',
  //             grant_type: 'password',
  //             audience: process.env.NEXT_PUBLIC_SE2_BACKEND_URL,
  //         },
  //     });
  // }
});
