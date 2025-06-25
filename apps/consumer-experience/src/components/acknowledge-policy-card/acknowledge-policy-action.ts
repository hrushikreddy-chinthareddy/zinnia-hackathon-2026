'use server';

import { LineOfBusiness } from '@zinnia/api-types/types/sor';
import { cookies } from 'next/headers';

import { postResetDeliveryDate } from '@/services/bpm';
import { getCookie } from '@/utils/auth';
import { ACKNOWLEDGEMENT_COOKIE_KEY } from '@/utils/serverClientUtils';

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

  try {
    await postResetDeliveryDate({
      planCode,
      policyNumber,
    });

    const deliveryDateEligibilityCookie = await getCookie(
      ACKNOWLEDGEMENT_COOKIE_KEY
    );
    const parsedCookie = JSON.parse(deliveryDateEligibilityCookie || '[]');
    parsedCookie.push(policyNumber);

    cookieStore.set(ACKNOWLEDGEMENT_COOKIE_KEY, JSON.stringify(parsedCookie));
  } catch (error) {
    console.error(error);
  }
}
