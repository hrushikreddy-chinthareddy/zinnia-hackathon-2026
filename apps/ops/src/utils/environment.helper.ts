export const isProd = () => {
    return process.env.NEXT_PUBLIC_BACKEND_URL === 'https://api.zinnia.io';
  };
  
  export const isUat = () => {
    return process.env.NEXT_PUBLIC_BACKEND_URL === 'https://uat.api.zinnia.io';
  };
  
  export const logDataDog = () => {
    return process.env.NEXT_PUBLIC_DATADOG_ENV !== 'dev';
  };
  
  export const isMockAllowed = () => {
    return !isProd() && !isUat();
  };
  