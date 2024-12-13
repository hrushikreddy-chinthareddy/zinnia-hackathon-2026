'use server';

import { LineOfBusiness } from '@zinnia/api-types/types/sor';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { getCookie } from '@/utils/auth';
import { lineOfBusinessUrlPath } from '@/utils/data';

// TODO: fix types here!
export async function acknowledgePolicyAction(
  formData: FormData
): Promise<any | never> {
  const cookieStore = await cookies();
  console.log('acknowledging policy');
  const policyNumber = formData.get('policyAcknowledged') as string;
  const planCode = formData.get('planCode');
  const lineOfBusiness = formData.get('lineOfBusiness') as LineOfBusiness;
  console.log('policyNumber', policyNumber);
  // const policyNumber = formData.get('policyAcknowledged')?.toString() || '';
  // const planCode = formData.get('planCode')?.toString() || '';

  try {
    // const response = await postResetDeliveryDate({
    //   planCode
    //   policyNumber
    // });
    // console.log(response);
    // TODO: need to turn this into a method becuase we're doing the same thing
    // in middleware
    const deliveryDateEligibilityCookie = await getCookie(
      'hasAcknowledgedPolicyOrDoesNotRequireReset'
    );
    const parsedCookie = JSON.parse(deliveryDateEligibilityCookie || '{}');
    parsedCookie[policyNumber] = false;
    cookieStore.set(
      'hasAcknowledgedPolicyOrDoesNotRequireReset',
      JSON.stringify(parsedCookie)
    );
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
