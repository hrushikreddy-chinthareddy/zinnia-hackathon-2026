import { NextRequest, NextResponse } from 'next/server';

import { fetchCase } from '@/services/case';


export async function GET(_request: NextRequest, { params }: { params: { caseId: string } }) {
  const response = await fetchCase(params.caseId);
  return NextResponse.json(response);
}
