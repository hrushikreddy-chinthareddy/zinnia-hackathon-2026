'use server';

import { FieldValues } from 'react-hook-form';

import { ServerApi } from '@/services';
import { sendMfaChallenge } from '@/services/auth';
import { setMfaCookie } from '@/utils/auth';

export const verifyTransactionMfa = async (formData: FieldValues) => {
  const loggingContext = {
    file: 'transaction-mfa-actions.ts',
    function: 'verifyTransactionMfa',
  };
  console.log(formData);
  try {
    const response = await ServerApi.refreshToken();
    const data = await response.json();
    console.log('mfa_token' in data, data);

    if ('mfa_token' in data) {
      //TODO: need to clear this after the code has been entered!!
      // the clearing happens in the verifyMfaChallenge method in setLoginCookies
      // will that work for this version of this?
      await setMfaCookie({
        value: data.mfa_token,
      });

      try {
        await sendMfaChallenge({
          authenticatorId: formData.verificationType,
          challengeType: 'oob',
          loggingContext,
        });
      } catch (e) {
        console.log('here in error', e);
      }
    } else {
      // TODO: what happens here???
      console.log('no mfa token');
    }
  } catch (e) {
    console.log('here in error', e);
  }

  // Not sure what to return here actually
  return new Promise((resolve, reject) => {
    resolve(true);
  });
};
