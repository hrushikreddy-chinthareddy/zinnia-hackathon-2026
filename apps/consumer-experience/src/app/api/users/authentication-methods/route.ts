import { NextResponse } from 'next/server';

import { ManagementTokenApi } from '@/services/management-api-token-http';
import { getSession } from '@/utils/auth';

export async function GET() {
  const session = await getSession();

  // TODO: add handling no session, in which case log out?
  try {
    const authenticatorsRequest = await ManagementTokenApi.get(
      `${process.env.AUTH0_ISSUER_BASE_URL}/api/v2/users/${session?.user?.sub}/authentication-methods`
    );
    const userResponse = await authenticatorsRequest.json();

    console.log(userResponse);
    return NextResponse.json({
      data: userResponse,
      error: null,
    });
  } catch (error) {
    console.log(error);
    // TODO: what should happen here? if the user doesn't have authentication methods or this
    // api call fails? should we just assume it's the latter and handle that?
    return NextResponse.json({
      data: null,
      error,
    });
  }
}
