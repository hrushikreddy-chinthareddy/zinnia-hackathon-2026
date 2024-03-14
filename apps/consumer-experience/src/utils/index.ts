export const isProd = () => {
  return process.env.NEXT_PUBLIC_BACKEND_URL === 'https://api.zinnia.io';
};
