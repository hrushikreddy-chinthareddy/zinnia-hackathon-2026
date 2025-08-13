import { NextRequest, NextResponse } from 'next/server';

import { ApiResponse } from '@/services';
import { getAgentInformation } from '@/services/agent';
import { ModifiedAgentData } from '@/types/agent';
import { logTrace, logWarn } from '@/utils/logging/log-fns';
import { buildNextReqLoggingContext } from '@/utils/logging/server-logging';

export async function GET(
  _request: NextRequest,
  { params }: { params: { clientCode: string } }
): Promise<NextResponse<ApiResponse<ModifiedAgentData>>> {
  const loggingContext = await buildNextReqLoggingContext(_request);
  logTrace('agent::GET::start', loggingContext);

  try {
    const searchParams = _request.nextUrl.searchParams;
    const agentId = searchParams.get('agentId') as string;
    const { data, error } = await getAgentInformation(
      {
        clientCode: params.clientCode,
        agentId,
      },
      loggingContext
    );

    logTrace('agent::GET::complete', {
      ...loggingContext,
    });

    if (!data || error) throw error;

    return NextResponse.json({
      data,
      error,
    });
  } catch (error) {
    logWarn('agent::GET::error', {
      ...loggingContext,
      error,
    });
    throw error;
  }
}
