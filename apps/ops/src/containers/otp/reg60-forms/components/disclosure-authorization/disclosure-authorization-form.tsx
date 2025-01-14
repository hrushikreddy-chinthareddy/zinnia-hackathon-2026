import { useTranslation } from 'next-i18next';
import { useState } from 'react';

import Typography, { TypographyVariant } from '@deps/components/typography/typography';
import { TranslationFiles } from '@deps/config/translations';

import { DisclosureAuthorization } from './disclosure-authorization';
import { DisclosureAuthorizationFormProps, DisclosureAuthorizationInformation } from './disclosure-authorization.types';

export const getDefaultDisclosureAuthorization = (): DisclosureAuthorizationInformation => {
    return {
        signatureDate: '',
        expectedAcctValue: '',
        product: '',
        cdscPeriod: '',
    };
};

export default function DisclosureAuthorizationForm({
    configs,
    isFormStateReadOnly,
    formErrors,
    formDisclosureAuthorization,
    setFormDisclosureAuthorization,
}: DisclosureAuthorizationFormProps) {
    const { t } = useTranslation(TranslationFiles.REG60DEFS, { keyPrefix: 'caseReg60.request.disclosureAuthorization' });

    const [disclosureAuthorizationInfo] = useState(formDisclosureAuthorization);

    const handleSetDisclosureAuthorizationInfo = (val: DisclosureAuthorizationInformation) => {
        setFormDisclosureAuthorization({ ...val });
    };
    return (
        <div key="disclosure-authorization-form" className="mb-4">
            <Typography variant={TypographyVariant.H3} className="mb-4">
                {configs.title || (t(`title`) as string)}
            </Typography>
            <div>
                <DisclosureAuthorization
                    isFormStateReadOnly={isFormStateReadOnly}
                    fields={configs.fields}
                    disclosureAuthorizationInfo={disclosureAuthorizationInfo}
                    formErrors={formErrors}
                    onDataChange={val => handleSetDisclosureAuthorizationInfo(val)}
                />
            </div>
        </div>
    );
}
