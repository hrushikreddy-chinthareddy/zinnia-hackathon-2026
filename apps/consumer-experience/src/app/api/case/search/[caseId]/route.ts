import { NextRequest, NextResponse } from 'next/server';

import { fetchCase } from '@/services/case';
import { buildCommonLogContext } from '@/utils/logging/server-logging';

export async function GET(
  _request: NextRequest,
  { params }: { params: { caseId: string } }
) {
  const loggingCtx = await buildCommonLogContext();
  const response = await fetchCase(params.caseId, loggingCtx);
  return NextResponse.json(response);
}
