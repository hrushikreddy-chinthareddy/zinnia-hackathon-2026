import { NextRequest, NextResponse } from 'next/server';

import { getComponentVisibility } from '@/services/display-rules';
import { logError, logTrace } from '@/utils/logging/log-fns';
import { buildNextReqLoggingContext } from '@/utils/logging/server-logging';

export async function GET(
  _request: NextRequest,
  {
    params,
  }: {
    params: {
      planCode: string;
      policyNumber: string;
    };
  }
) {
  const loggingContext = await buildNextReqLoggingContext(_request);
  logTrace(
    `component-visibility::${params.planCode}::${params.policyNumber}::GET::start`,
    loggingContext
  );

  try {
    const { data: visibility } = await getComponentVisibility(
      {
        policyNumber: params.policyNumber,
        planCode: params.planCode,
      },
      { user: loggingContext.user, correlationId: loggingContext.correlationId }
    );

    if (!visibility) {
      logError(
        `component-visibility::${params.planCode}::${params.policyNumber}::GET::error`,
        {
          ...loggingContext,
          error: 'No component visibility found',
        }
      );
      return NextResponse.json({
        data: null,
        error: 'No component visibility found',
      });
    }

    // Execute all functions and create a new object with the results
    // This is because objects that contain methods are not able to be stringified
    // We just evaluate everything and return the boolean object instead on client side
    const visibilityResults = Object.entries(visibility).reduce(
      (result, [key, func]) => {
        result[key] = func();
        return result;
      },
      {} as Record<string, boolean>
    );

    return NextResponse.json(visibilityResults);
  } catch (error) {
    logError(
      `getComponentVisibility::${params.planCode}::${params.policyNumber}}::GET::error`,
      {
        ...loggingContext,
        error,
      }
    );
    throw error;
  }
}
