import axios, { AxiosError } from 'axios';

const handleError = (error: unknown | AxiosError) => {
  if (axios.isAxiosError(error)) {
    const err = error as AxiosError;

    console.log('axios error => ', err);
    return;
  }

  const err = error as Error;

  console.log('error =>', err);

  return;
};

export * from 'axios';
export { axios, handleError };
