import { useSearchParams } from 'next/navigation';
import { useTranslation } from 'next-i18next';
import React, { useContext, useEffect, useState } from 'react';

import CheckboxText from '@deps/components/checkbox/checkbox-text/checkbox-text';
import { FormDataContext } from '@deps/contexts/OtpWithdrawalFormContext';
import { TaskStatus } from '@deps/models/case/task-instance';
import { CaseStatus } from '@deps/models/case/withdrawal/case';
import { FEATURE_FLAGS } from '@deps/utils/optimizely/flags';

const SpousalConsent = () => {
    const { t } = useTranslation();
    const { formSignature, currentFormState, setFormSignature, featureFlagDecisions } = useContext(FormDataContext);
    const [spousalConsent, setSpousalConsent] = useState(formSignature?.isSpousalConsentRequired?.text || false);
    const searchParams = useSearchParams();

    const shouldShowNewExperience = featureFlagDecisions?.[FEATURE_FLAGS.NEW_EXP];
    const isFormStateReadOnly = shouldShowNewExperience
        ? (searchParams.get('action') === 'readonly' || ((currentFormState !== CaseStatus.Pending && currentFormState !== TaskStatus.New) && searchParams.get('action') !== 'duplicate'))
        : false;

    useEffect(() => {
        setFormSignature(fs => ({
            ...fs,
            isSpousalConsentRequired: { text: spousalConsent },
        }));
        return () => {
            setFormSignature(fs => ({
                ...fs,
                isSpousalConsentRequired: null,
            }));
        };
    }, [spousalConsent]);

    return (
        <div className="mt-4 flex flex-wrap gap-8 max-md:flex-col">
            <div className="flex-1">
                <CheckboxText
                    label={t('caseWithdrawal.request.signatureValidation.spouseConsentText')}
                    checked={spousalConsent}
                    onChange={() => setSpousalConsent(!spousalConsent)}
                    isDisabled={isFormStateReadOnly}
                />
            </div>
        </div>
    );
};

export default SpousalConsent;
