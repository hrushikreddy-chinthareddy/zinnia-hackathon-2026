import { NextRequest, NextResponse } from 'next/server';

import { getAgentInformation } from '@/services/agent';
import {
  buildNextReqLoggingContext,
  logTrace,
  logError,
} from '@/utils/logging/server-logging';

export async function GET(
  _request: NextRequest,
  { params }: { params: { clientCode: string } }
) {
  const loggingContext = buildNextReqLoggingContext(_request);
  logTrace('agent::GET::start', loggingContext);

  try {
    const searchParams = _request.nextUrl.searchParams;
    const agentId = searchParams.get('agentId') as string;
    const { data, error } = await getAgentInformation({
      clientCode: params.clientCode,
      agentId,
    });

    logTrace('agent::GET::complete', {
      ...loggingContext,
    });

    return NextResponse.json({
      data,
      error,
    });
  } catch (error) {
    logError('agent::GET::error', {
      ...loggingContext,
      error,
    });
    throw error;
  }
}
