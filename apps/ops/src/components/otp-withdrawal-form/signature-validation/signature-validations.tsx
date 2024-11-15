import { useTranslation } from 'next-i18next';
import { useContext, useEffect, useState } from 'react';

import Typography, { TypographyVariant } from '@deps/components/typography/typography';
import CardContainer from '@deps/containers/card-container/card-container';
import { FormDataContext, OtpWithdrawalFormState } from '@deps/contexts/OtpWithdrawalFormContext';
import { SignatureValidationTypeWithdrawal } from '@deps/models/case/renewal/signature-validation';
import { PartyRoles, FormValidationErrors, SignatureWithdrawal } from '@deps/models/case/withdrawal/case';

import SignatureValidation, { SignatureValidationField } from './signature-validation';
import { SignatureFieldNames, SignaturePartProps } from './signature-validation-parts/signature-parts';

export type SignatureValidationConfig = {
    bonusField?: React.FC<SignaturePartProps>;
    fields: SignatureValidationField[];
    key: string;
    shouldDisplay?: (formData: OtpWithdrawalFormState) => boolean;
    signatureType: SignatureValidationTypeWithdrawal;
    partyRole?: PartyRoles;
};
type SignatureValidationProps = {
    config: SignatureValidationConfig[];
    children?: React.ReactNode;
    headerTranslationKey?: string;
    isFormStateReadOnly?: boolean;
};

export const getDefaultSignature = (signatureType: SignatureValidationTypeWithdrawal): SignatureWithdrawal => {
    return {
        isSigned: null,
        signDate: {
            text: '',
        },
        signExtension: null,
        signName: null,
        signOtherTitle: null,
        signTitle: {
            text: '',
        },
        signTitles: [
            {
                text: null,
            },
        ],
        signType: {
            text: signatureType,
        },
        spousalConsent: {
            text: null,
        },
    };
};

export default function SignatureValidations({
    config,
    children,
    headerTranslationKey = 'header',
    isFormStateReadOnly,
}: SignatureValidationProps) {
    const { t } = useTranslation(undefined, { keyPrefix: 'caseWithdrawal.request.signatureValidation' });
    const formDataContext = useContext(FormDataContext);

    const [displaySignatures, setDisplaySignatures] = useState(config);
    const setSignature = (signatureType: SignatureValidationTypeWithdrawal) => (val: SignatureWithdrawal) => {
        formDataContext.setFormSignature(fs => {
            return { ...fs, signatures: [...fs.signatures.filter(sig => sig.signType.text !== signatureType), val] };
        });
    };

    const getErrors = (signatureType: SignatureValidationTypeWithdrawal): FormValidationErrors => {
        return {
            [SignatureFieldNames.IsSignatureValid]: formDataContext.formErrors[`${signatureType}${SignatureFieldNames.IsSignatureValid}`],
            [SignatureFieldNames.SignatureComment]: formDataContext.formErrors[`${signatureType}${SignatureFieldNames.SignatureComment}`],
            [SignatureFieldNames.SignatureDate]: formDataContext.formErrors[`${signatureType}${SignatureFieldNames.SignatureDate}`],
            [SignatureFieldNames.SignaturePresent]: formDataContext.formErrors[`${signatureType}${SignatureFieldNames.SignaturePresent}`],
            [SignatureFieldNames.SignatureTitle]: formDataContext.formErrors[`${signatureType}${SignatureFieldNames.SignatureTitle}`],
            [SignatureFieldNames.SignatureType]: formDataContext.formErrors[`${signatureType}${SignatureFieldNames.SignatureType}`],
        };
    };

    useEffect(() => {
        const newDisplaySignatures = config.filter(({ shouldDisplay = () => true }) => {
            return shouldDisplay(formDataContext);
        });

        // Only update displaySignatures if it has changed
        if (newDisplaySignatures.length === displaySignatures.length) {
            let shouldUpdate = false;
            for (let i = 0; i < newDisplaySignatures.length; ++i) {
                const newDisplay = newDisplaySignatures[i];
                const oldDisplay = displaySignatures[i];
                if (newDisplay.signatureType !== oldDisplay.signatureType || newDisplay.key !== oldDisplay.key) {
                    shouldUpdate = true;
                }
            }
            if (!shouldUpdate) {
                return;
            }
        }

        setDisplaySignatures(newDisplaySignatures);
        formDataContext.setFormSignature(fs => {
            return {
                ...fs,
                signatures: fs.signatures.filter(sig => {
                    const signType = sig.signType.text;
                    return newDisplaySignatures.find(displaySig => displaySig.signatureType === signType);
                }),
            };
        });
    }, [config, formDataContext]);

    return (
        <CardContainer classNames="w-full" containerClassNames="border-b-2 border-gray-100">
            <Typography variant={TypographyVariant.H3} className="mb-4">
                {t(headerTranslationKey)}
            </Typography>
            {children}
            {displaySignatures.map(({ signatureType, partyRole, fields, bonusField }) => (
                <div className="mt-6" key={`sig-val-${signatureType}`}>
                    <SignatureValidation
                        bonusField={bonusField}
                        errors={getErrors(signatureType)}
                        fields={fields}
                        onDataChange={setSignature(signatureType)}
                        sigProp={
                            formDataContext.formSignature?.signatures.find(val => val.signType?.text === signatureType) ||
                            getDefaultSignature(signatureType)
                        }
                        isFormStateReadOnly={isFormStateReadOnly}
                        preSelectedValues={{
                            ...(partyRole && {
                                ssn: {
                                    text:
                                        formDataContext.initialForm?.data?.formRequest?.formParty?.parties?.find(
                                            p => p.partyRoleType == partyRole
                                        )?.taxId ?? null,
                                },
                            }),
                        }}
                    />
                </div>
            ))}
        </CardContainer>
    );
}
