import { useTranslation } from 'next-i18next';
import { useContext, useEffect, useState } from 'react';

import CheckboxText from '@deps/components/checkbox/checkbox-text/checkbox-text';
import FieldLabel from '@deps/components/fields/field-label';
import { FormDataContext } from '@deps/contexts/OtpWithdrawalFormContext';

interface ContractReplacementProps {
    isFormStateReadOnly?: boolean;
}

export default function ContractReplacement({
    isFormStateReadOnly,
}: ContractReplacementProps) {
    const { formProgram, setFormProgram } = useContext(FormDataContext);
    const { t } = useTranslation(undefined, {
        keyPrefix: 'caseWithdrawal.request.amountDetails.contractReplacement',
    });

    const [isContractReplaced, setIsContractReplaced] = useState(
        formProgram?.isContractReplaced?.text || false
    );

    useEffect(() => {
        setFormProgram((fs) => ({
            ...fs,
            isContractReplaced: {
                text: isContractReplaced,
            },
        }));
    }, [isContractReplaced]);

    return (
        <div>
            <FieldLabel
                classNames="font-secondary text-md !mb-4"
                label={t('title') as string}
            />

            <div className="my-4 flex flex-wrap gap-8 max-md:flex-col">
                <CheckboxText
                    label={t('isContractReplaced')}
                    checked={isContractReplaced}
                    onChange={() => setIsContractReplaced(!isContractReplaced)}
                    data-testid="isContractReplaced"
                    isDisabled={isFormStateReadOnly}
                />
            </div>
        </div>
    );
}
