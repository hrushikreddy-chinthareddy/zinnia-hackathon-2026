'use server';

import { FieldValues } from 'react-hook-form';

import { ServerApi } from '@/services';
import { setMfaCookie } from '@/utils/auth';

export const verifyTransactionMfa = async (formData: FieldValues) => {
  console.log(formData);
  try {
    const response = await ServerApi.refreshToken();
    const data = await response.json();
    console.log('mfa_token' in data, data);

    if ('mfa_token' in data) {
      //TODO: need to clear this after the code has been entered!!
      await setMfaCookie({
        value: data.mfa_token,
      });

      try {
        const response = await ServerApi.sendMfaChallenge({
          authenticatorId: formData.verificationType,
          challengeType: 'oob',
          mfaToken: data.mfa_token,
        });
        console.log('send mfa challenge in transaction mfa actions', response);
      } catch (e) {
        console.log('send mfa no bueno');
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
