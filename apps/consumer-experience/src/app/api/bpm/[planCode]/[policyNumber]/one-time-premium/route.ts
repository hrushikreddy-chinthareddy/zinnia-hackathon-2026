export const POST = async () => {
  return new Response(JSON.stringify({}), {
    headers: {
      'Content-Type': 'application/json',
    },
  });
};
