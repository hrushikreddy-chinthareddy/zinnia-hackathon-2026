// import { policyApiBaseUrl } from '@/services/api-config';
// import { serverApi } from '@/services/server';

export async function GET() {
  try {
    // const { data } = await serverApi.get(policyApiBaseUrl);

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error });
  }
}
