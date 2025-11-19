'use server';

import { cookies } from 'next/headers';

import { postResetDeliveryDate } from '@/services/bpm/delivery-date';
import { getCookie } from '@/utils/auth';
import { buildCommonLogContext } from '@/utils/logging/server-logging';
import { ACKNOWLEDGEMENT_COOKIE_KEY } from '@/utils/serverClientUtils';
import { LineOfBusiness } from '@zinnia/api-types/types/sor';

export interface AcknowledgeInputs {
  policyAcknowledged: boolean;
  planCode: string;
  policyNumber: string;
  lineOfBusiness: LineOfBusiness;
}

export async function acknowledgePolicyAction(
  formData: AcknowledgeInputs
): Promise<void> {
  const cookieStore = cookies();
  const acknowledged = formData.policyAcknowledged;
  if (!acknowledged) {
    throw new Error('Policy not acknowledged');
  }
  const policyNumber = formData.policyNumber || '';
  const planCode = formData.planCode || '';
  const loggingContext = await buildCommonLogContext();

  const { data, error } = await postResetDeliveryDate(
    {
      planCode,
      policyNumber,
    },
    loggingContext
  );

  if (!data || !!error) {
    console.error(error || 'Error resetting delivery date');
  }

  const deliveryDateEligibilityCookie = await getCookie(
    ACKNOWLEDGEMENT_COOKIE_KEY
  );
  const parsedCookie = JSON.parse(deliveryDateEligibilityCookie || '[]');
  parsedCookie.push(policyNumber);

  cookieStore.set(ACKNOWLEDGEMENT_COOKIE_KEY, JSON.stringify(parsedCookie));
}
