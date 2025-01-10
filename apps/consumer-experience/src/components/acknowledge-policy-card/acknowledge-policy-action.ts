'use server';

import { cookies } from 'next/headers';

import { postResetDeliveryDate } from '@/services/bpm';
import { getCookie } from '@/utils/auth';
import { ACKNOWLEDGEMENT_COOKIE_KEY } from '@/utils/serverClientUtils';

import { AckowledgeInputs } from './AcknowledgePolicyCard';

export async function acknowledgePolicyAction(
  formData: AckowledgeInputs
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
