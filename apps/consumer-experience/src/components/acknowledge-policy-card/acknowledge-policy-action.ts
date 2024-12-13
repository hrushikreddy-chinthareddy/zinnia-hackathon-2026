'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { lineOfBusinessUrlPath } from '@/utils/data';

import { AckowledgeInputs } from './AcknowledgePolicyCard';

// TODO: fix types here!
export async function acknowledgePolicyAction(
  formData: AckowledgeInputs
): Promise<any | never> {
  const cookieStore = await cookies();
  console.log('acknowledging policy');
  const ackowledged = formData.policyAcknowledged;
  if (!ackowledged) {
    throw new Error('Policy not acknowledged');
  }
  const policyNumber = formData.policyNumber || '';
  const planCode = formData.planCode || '';
  const lineOfBusiness = formData.lineOfBusiness;
  console.log('policyNumber', policyNumber);
  console.log({ ackowledged });
  try {
    // const response = await postResetDeliveryDate({
    //   planCode
    //   policyNumber
    // });
    // console.log(response);
    // TODO: need to turn this into a method becuase we're doing the same thing
    // in middleware
    // const deliveryDateEligibilityCookie = await getCookie(
    //   'hasAcknowledgedPolicyOrDoesNotRequireReset'
    // );
    // const parsedCookie = JSON.parse(deliveryDateEligibilityCookie || '{}');
    // parsedCookie[policyNumber] = false;
    // cookieStore.set(
    //   'hasAcknowledgedPolicyOrDoesNotRequireReset',
    //   JSON.stringify(parsedCookie)
    // );
  } catch (error) {
    console.error(error);
    return {
      success: false,
      // TODO: what should happen here?
      message: 'Something went wrong, please try again',
    };
  } finally {
    redirect(
      `/coverage/${lineOfBusinessUrlPath(lineOfBusiness)}/${planCode}/${policyNumber}`
    );
  }
}
