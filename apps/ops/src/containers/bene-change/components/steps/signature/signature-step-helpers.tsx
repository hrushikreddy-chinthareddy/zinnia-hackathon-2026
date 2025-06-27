import { TFunction } from 'next-i18next';
import { useCallback, useMemo, useState } from 'react';

import {
    SignatureFieldNames,
    SignatureFields,
} from '@deps/components/otp-withdrawal-form/signature-validation/signature-validation-parts/signature-parts';
import { SignatureValidationTypeWithdrawal } from '@deps/models/case/renewal/signature-validation';
import {
    FormValidationErrors,
    SignatureWithdrawal,
} from '@deps/models/case/withdrawal/case';

const spousalSignatureStateCodes: string[] = [
    'CA',
    'ID',
    'LA',
    'NM',
    'NV',
    'TX',
    'WI',
];

export const useReRegSignatureStepConfig = (
    t: TFunction,
    isJointOwnerExist: boolean,
    ownerState: string,
    carrierId: string
) => {
    const [isIrrevocableBene, setIssirrovocableBene] = useState(false);
    const [isOwnerSignGuaranteeStamp, setIsOwnerSignGuaranteeStamp] =
        useState(false);

    const formValidation = useCallback(
        (signatures: SignatureWithdrawal[]): FormValidationErrors => {
            const errors = {} as FormValidationErrors;
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

            return errors;
        },
        [t]
    );

    const signaturesConfig = useMemo(
        () => [
            {
                key: `sig-val-owner`,
                fields: [
                    {
                        component: SignatureFields.SignatureType,
                        key: 'owner-type',
                    },
                    {
                        component: SignatureFields.SignaturePresent,
                        key: 'owner-sign-present',
                    },
                    {
                        component: SignatureFields.SignatureTitle,
                        key: 'owner-title',
                    },
                    ...(isOwnerSignGuaranteeStamp && carrierId === 'FLIC'
                        ? [
                              {
                                  component: SignatureFields.SignGuaranteeStamp,
                                  key: 'owner-sign-guarantee-stamp',
                              },
                          ]
                        : []),
                    {
                        component: SignatureFields.SignatureDate,
                        key: 'owner-date',
                    },
                ],
                signatureType: SignatureValidationTypeWithdrawal.Owner,
            },
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
            ...(isIrrevocableBene
                ? [
                      {
                          key: `sig-val-irrevocable-beneficiary`,
                          fields: [
                              {
                                  component: SignatureFields.SignatureType,
                                  key: 'irrevocable-beneficiary-type',
                              },
                              {
                                  component: SignatureFields.SignaturePresent,
                                  key: 'irrevocable-beneficiary-sign-present',
                              },
                              {
                                  component: SignatureFields.SignatureDate,
                                  key: 'irrevocable-beneficiary-date',
                              },
                          ],
                          signatureType:
                              SignatureValidationTypeWithdrawal.IrrevocableBeneficiary,
                      },
                  ]
                : []),
            ...(ownerState?.toUpperCase() === 'MA' && carrierId === 'FLIC'
                ? [
                      {
                          key: `sig-val-witness`,
                          fields: [
                              {
                                  component: SignatureFields.SignatureType,
                                  key: 'witness-type',
                              },
                              {
                                  component: SignatureFields.SignaturePresent,
                                  key: 'witness-sign-present',
                              },
                              {
                                  component: SignatureFields.SignatureDate,
                                  key: 'witness-date',
                              },
                          ],
                          signatureType:
                              SignatureValidationTypeWithdrawal.Witness,
                      },
                  ]
                : []),
            ...(!!ownerState &&
            spousalSignatureStateCodes.includes(ownerState?.toUpperCase()) &&
            carrierId === 'FLIC'
                ? [
                      {
                          key: `sig-val-spouse`,
                          fields: [
                              {
                                  component: SignatureFields.SignatureType,
                                  key: 'spouse-type',
                              },
                              {
                                  component: SignatureFields.SignaturePresent,
                                  key: 'spouse-sign-present',
                              },
                              {
                                  component: SignatureFields.SignatureDate,
                                  key: 'spouse-date',
                              },
                          ],
                          signatureType:
                              SignatureValidationTypeWithdrawal.Spouse,
                      },
                  ]
                : []),
        ],
        [
            isIrrevocableBene,
            isOwnerSignGuaranteeStamp,
            isJointOwnerExist,
            ownerState,
        ]
    );

    return {
        signaturesConfig,
        formValidation,
        isIrrevocableBene,
        setIssirrovocableBene,
        setIsOwnerSignGuaranteeStamp,
        spousalSignatureStateCodes,
    };
};
