'use server';

import { ServerApi, consumerExperienceAPIBaseUrl } from '@/services';
import { TermsAndConditionApiResponse, User } from '@/types/auth';
import { parseAPIResponse } from '@/utils/api';
import { getSession, setTermsAndConditionsCookie } from '@/utils/auth';
import { logError } from '@/utils/logging/server-logging';

export async function setUserConsent(
  _:
    | {
        error: string;
        errorDescription: string;
        acceptedTermsAndConditions: boolean;
        user?: User | undefined;
      }
    | {
        acceptedTermsAndConditions: boolean;
        user?: User | undefined;
        error?: undefined;
        errorDescription?: undefined;
      }
    | undefined,
  formData: FormData
) {
  const partyId = formData.get('partyId')?.toString();
  try {
    if (formData.get('acceptedTermsAndConditions') === null) {
      return {
        acceptedTermsAndConditions: false,
        error: 'no value selected',
        errorDescription:
          'You must agree to the Privacy Policy and Terms of Use to continue.',
      };
    }

    const req = await ServerApi.post(
      `${consumerExperienceAPIBaseUrl}/agreementToTermsAndConditions`,
      JSON.stringify({
        agreedToTermsAndConditions: true,
        partyId: partyId,
      })
    );

    const data = await parseAPIResponse(req);
    const session = await getSession();

    if (!req.ok || !('agreedToTermsAndConditions' in data)) {
      logError('Error setting user consent', {
        statusCode: req.status,
        statusText: req.status,
        url: req.url,
        apiMessage: data.message,
        sessionId: session?.user?.sid,
      });

      throw data;
    }

    const termsAndConditions = data as TermsAndConditionApiResponse;
    if (termsAndConditions.agreedToTermsAndConditions) {
      await setTermsAndConditionsCookie(true);
      return { acceptedTermsAndConditions: true, user: session?.user };
    }

    return { acceptedTermsAndConditions: false };
  } catch (error) {
    return { acceptedTermsAndConditions: false };
  }
}
