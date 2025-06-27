import { PartyType } from '@zinnia/api-types/types/sor';
import { useTranslation } from 'next-i18next';
import { useContext } from 'react';

import { RenewalFormDataContext } from '@deps/contexts/OtpRenewalFormContext';
import { isNullEmptyOrUndefined } from '@deps/helpers/string.helpers';
import { Signature } from '@deps/models/case/task';

import { SignatureFields, SingleSignature } from './single-signature';
import Typography, { TypographyVariant } from '../../typography/typography';

export interface SignaturesConfig {
    signatureType: string;
    fields: {
        fieldName: SignatureFields;
        fieldLabel: string;
    }[];
}

interface SignatureValidationsProps {
    configs: SignaturesConfig[];
    isFormStateReadOnly: boolean;
}

export default function SignatureValidations({
    configs,
    isFormStateReadOnly,
}: SignatureValidationsProps) {
    const { setOwnerInformation, ownerInformation, parties, formErrors } =
        useContext(RenewalFormDataContext);
    const { t } = useTranslation(undefined, {
        keyPrefix: 'caseRenewal.request',
    });

    const shouldShowTitleField = (ownerType: string) => {
        let ownerParty;

        // Joint owners come in many flavors, but we just make all of them of type 'Joint'
        if (ownerType === 'Joint') {
            ownerParty = parties.find(
                (party) =>
                    party.SrcRoleOptionIdDesc.includes(ownerType) &&
                    party.SrcRoleType === 0
            );
        } else {
            ownerParty = parties.find(
                (party) =>
                    party.SrcRoleOptionIdDesc === ownerType &&
                    party.SrcRoleType === 0
            );
        }

        return ownerParty?.PersonType.toUpperCase() === PartyType.TRUST;
    };

    const setSignature = (val: Signature) => {
        setOwnerInformation((owners) => {
            return owners?.map((owner) => {
                if (owner.type === val.type) {
                    return {
                        ...owner,
                        signature: { ...owner.signature, ...val },
                    };
                }

                return owner;
            });
        });
    };

    return (
        <>
            <Typography variant={TypographyVariant.H3} className="mb-4">
                {t('signatureValidation')}
            </Typography>

            {configs?.map((config, index) => {
                const owner = ownerInformation?.find(
                    (owner) => owner.type === config.signatureType
                );
                if (owner) {
                    const ownerName = !isNullEmptyOrUndefined(
                        owner.signature?.name
                    )
                        ? owner.signature?.name
                        : owner?.fullName;

                    return (
                        <div key={index} className="mb-4">
                            <SingleSignature
                                fields={config.fields}
                                signature={{
                                    ...owner.signature,
                                    name: (ownerName || '').trim(),
                                    type: owner?.type || '',
                                }}
                                showTitle={shouldShowTitleField(owner.type)}
                                errors={{
                                    [SignatureFields.SignaturePresent]:
                                        formErrors[
                                            `${owner?.type}-${SignatureFields.SignaturePresent}`
                                        ],
                                    [SignatureFields.SignatureDate]:
                                        formErrors[
                                            `${owner?.type}-${SignatureFields.SignatureDate}`
                                        ],
                                }}
                                onDataChange={(val) => setSignature(val)}
                                isFormStateReadOnly={isFormStateReadOnly}
                            />
                        </div>
                    );
                }
            })}
        </>
    );
}
