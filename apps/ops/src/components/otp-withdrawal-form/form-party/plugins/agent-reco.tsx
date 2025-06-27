import { useTranslation } from 'next-i18next';
import { useEffect, useState, useContext } from 'react';

import CheckboxText from '@deps/components/checkbox/checkbox-text/checkbox-text';
import { FormDataContext } from '@deps/contexts/OtpWithdrawalFormContext';

export const RecommendedByAgent = () => {
    const { t } = useTranslation(undefined, {
        keyPrefix: 'caseWithdrawal.request',
    });
    const {
        formFullSurrenderAck,
        isFormStateReadOnly,
        setFormFullSurrenderAck,
    } = useContext(FormDataContext);
    const [isAgentOrBrokerRecommended, setIsAgentOrBrokerRecommended] =
        useState(
            formFullSurrenderAck?.isAgentOrBrokerRecommended?.text ?? false
        );

    useEffect(() => {
        setFormFullSurrenderAck((ps) => ({
            ...ps,
            isAgentOrBrokerRecommended: {
                text: isAgentOrBrokerRecommended as boolean,
            },
        }));
    }, [isAgentOrBrokerRecommended, setFormFullSurrenderAck]);

    return (
        <div className="my-4 flex flex-wrap gap-8 max-md:flex-col">
            <CheckboxText
                label={t('additionalInformation.isAgentOrBrokerRecommended')}
                checked={isAgentOrBrokerRecommended}
                onChange={(value) => setIsAgentOrBrokerRecommended(value)}
                data-testid="isRecommendedByAgent"
                isDisabled={isFormStateReadOnly}
            />
        </div>
    );
};
