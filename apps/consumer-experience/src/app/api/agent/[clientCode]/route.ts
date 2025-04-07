import { NextRequest, NextResponse } from 'next/server';

import { getAgentInformation } from '@/services/agent';

export async function GET(
  _request: NextRequest,
  { params }: { params: { clientCode: string } }
) {
  const searchParams = _request.nextUrl.searchParams;
  const agentId = searchParams.get('agentId') as string;
  const { data, error } = await getAgentInformation({
    clientCode: params.clientCode,
    agentId,
  });

  return NextResponse.json({
    data,
    error,
  });
}
