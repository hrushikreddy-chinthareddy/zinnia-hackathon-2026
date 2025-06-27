import { TFunction } from 'next-i18next';
import { useCallback } from 'react';

import {
    SignatureFieldNames,
    SignatureFields,
} from '@deps/components/otp-withdrawal-form/signature-validation/signature-validation-parts/signature-parts';
import { SignatureValidationTypeWithdrawal } from '@deps/models/case/renewal/signature-validation';
import {
    FormValidationErrors,
    SignatureWithdrawal,
} from '@deps/models/case/withdrawal/case';

export const useSignatureStepConfig = (
    t: TFunction,
    isJointOwnerExist: boolean,
    isAnnuitant: boolean
) => {
    const formValidation = useCallback(
        (signatures: SignatureWithdrawal[]): FormValidationErrors => {
            const errors = {} as FormValidationErrors;

            if (isAnnuitant) {
                const annuitantSignature = signatures?.find(
                    (sigInfo) =>
                        sigInfo?.signType?.text ===
                        SignatureValidationTypeWithdrawal.Annuitant
                );

                // No choice made for signature
                if (
                    annuitantSignature?.isSigned !== false &&
                    !annuitantSignature?.isSigned
                ) {
                    errors[
                        `${SignatureValidationTypeWithdrawal.Annuitant}${SignatureFieldNames.SignaturePresent}`
                    ] = t('signatureShouldBePresent');
                }
            } else {
                const ownerSignature = signatures?.find(
                    (sigInfo) =>
                        sigInfo?.signType?.text ===
                        SignatureValidationTypeWithdrawal.Owner
                );

                // No choice made for signature
                if (
                    ownerSignature?.isSigned !== false &&
                    !ownerSignature?.isSigned
                ) {
                    errors[
                        `${SignatureValidationTypeWithdrawal.Owner}${SignatureFieldNames.SignaturePresent}`
                    ] = t('signatureShouldBePresent');
                }
            }

            return errors;
        },
        [t]
    );
    const signaturesConfig = [
        ...(!isAnnuitant
            ? [
                  {
                      key: `sig-val-owner`,
                      fields: [
                          {
                              component: SignatureFields.SignatureType,
                              key: 'owner-type',
                          },
                          {
                              component: SignatureFields.SignaturePrintName,
                              key: 'owner-sign-print-name',
                          },
                          {
                              component: SignatureFields.SignaturePresent,
                              key: 'owner-sign-present',
                          },
                          {
                              component: SignatureFields.SignatureTitle,
                              key: 'owner-title',
                          },
                          {
                              component: SignatureFields.SignatureDate,
                              key: 'owner-date',
                          },
                      ],
                      signatureType: SignatureValidationTypeWithdrawal.Owner,
                  },
              ]
            : []),
        ...(isJointOwnerExist
            ? [
                  {
                      key: `sig-val-joint`,
                      fields: [
                          {
                              component: SignatureFields.SignatureType,
                              key: 'joint-type',
                          },
                          {
                              component: SignatureFields.SignaturePrintName,
                              key: 'joint-sign-print-name',
                          },
                          {
                              component: SignatureFields.SignaturePresent,
                              key: 'joint-sign-present',
                          },
                          {
                              component: SignatureFields.SignatureTitle,
                              key: 'joint-title',
                          },
                          {
                              component: SignatureFields.SignatureDate,
                              key: 'joint-date',
                          },
                      ],
                      signatureType:
                          SignatureValidationTypeWithdrawal.JointOwner,
                      shouldDisplay: (): boolean => {
                          return true;
                      },
                  },
              ]
            : []),
        ...(isAnnuitant
            ? [
                  {
                      key: `sig-val-annuitant`,
                      fields: [
                          {
                              component: SignatureFields.SignatureType,
                              key: 'annuitant-type',
                          },
                          {
                              component: SignatureFields.SignaturePrintName,
                              key: 'annuitant-sign-print-name',
                          },
                          {
                              component: SignatureFields.SignaturePresent,
                              key: 'annuitant-sign-present',
                          },
                          {
                              component: SignatureFields.SignatureTitle,
                              key: 'annuitant-title',
                          },
                          {
                              component: SignatureFields.SignatureDate,
                              key: 'annuitant-date',
                          },
                      ],
                      signatureType:
                          SignatureValidationTypeWithdrawal.Annuitant,
                  },
              ]
            : []),
    ];

    return {
        signaturesConfig,
        formValidation,
    };
};
