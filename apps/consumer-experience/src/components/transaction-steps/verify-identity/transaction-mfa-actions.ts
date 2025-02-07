'use server';

import { FieldValues } from 'react-hook-form';

export const verifyTransactionMfa = async (data: FieldValues) => {
  // call refreshToken endpoint
  // using token in return ->
  //     await setMfaCookie({
  //   value: data.mfa_token,
  // });
  // THEN call sendMfaChallenge with the mfaToken from previous return
  // const response = await ServerApi.sendMfaChallenge({
  //   authenticatorId,
  //   challengeType,
  //   mfaToken,
  // });
  // Not sure what to return here actually
  return new Promise((resolve, reject) => {
    resolve(data);
  });
};
