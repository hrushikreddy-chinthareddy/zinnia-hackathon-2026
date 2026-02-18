import { TFunction } from 'next-i18next';
import { useCallback, useMemo, useState } from 'react';

import {
    SignatureFieldNames,
    SignatureFields,
} from '@deps/components/otp-withdrawal-form/signature-validation/signature-validation-parts/signature-parts';
import {
    SignatureValidationTypeWithdrawal,
    SignatureDesignation,
} from '@deps/models/case/renewal/signature-validation';
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

            // Only validate if owner signature exists in the array
            if (ownerSignature) {
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

    const customOptions = [
        {
            label: t('selectOption'),
            value: SignatureDesignation.Unselected,
        },
        {
            label: t('trustee'),
            value: SignatureDesignation.Trustee,
        },
        {
            label: t('executor'),
            value: SignatureDesignation.Executor,
        },
        {
            label: t('custodian'),
            value: SignatureDesignation.Custodian,
        },
        {
            label: t('guardian'),
            value: SignatureDesignation.Guardian,
        },
        {
            label: t('attorneyInFact'),
            value: SignatureDesignation.AttorneyInFact,
        },
        {
            label: t('assignee'),
            value: SignatureDesignation.Assignee,
        },
        {
            label: t('authorizedSignatory'),
            value: SignatureDesignation.AuthorizedSignatory,
        },
        { label: t('na'), value: SignatureDesignation.NA },
    ];

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
                        customOptions: customOptions,
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
                                  customOptions: customOptions,
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
