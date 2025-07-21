/**
 * Ensure that when setting or removing a cookie that needs
 * to be at the ROOT domain e.g. .mypolicyview.com, you explicitly set the cookie domain.
 * So that regardless if on client or server, the cookie responds correctly
 */
// TODO: should the vercel one come first? Right now this logic only works in vercel
// because we haven't set the NEXT_PUBLIC_AUTH0_COOKIE_DOMAIN_MYPOLICYVIEW variable
// is there a reason we did it in this order
export const COOKIE_DOMAIN =
  process.env.NEXT_PUBLIC_AUTH0_COOKIE_DOMAIN_MYPOLICYVIEW ||
  process.env.NEXT_PUBLIC_VERCEL_BRANCH_URL;
