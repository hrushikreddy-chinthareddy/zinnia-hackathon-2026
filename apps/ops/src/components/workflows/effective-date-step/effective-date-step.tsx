import dayjs from 'dayjs';
import { useTranslation } from 'next-i18next';
import React, { useCallback, useState } from 'react';

import AssistiveText, { AssistiveTextVariant } from '@deps/components/assistive-text/assistive-text';
import { FieldSize, FieldType, FieldVariant } from '@deps/components/fields/field';
import FieldDateSelect from '@deps/components/fields/field-date-select/field-date-select';
import TransactionNavigationButtons, { ParentPage } from '@deps/components/transaction-navigation-buttons/transaction-navigation-buttons';
import WorkflowCard from '@deps/components/workflows/workflow-card/workflow-card';
import { TranslationFiles } from '@deps/config/translations';
import { useWorkflow } from '@deps/contexts/WorkflowContainerContext';
import { Policy } from '@deps/models/policy/sor-policy';
import { NUMERIC_DATE_FORMAT } from '@deps/types/constants';

const EffectiveDate = ({
    policy,
    effectiveDate,
    setEffectiveDate,
}: {
    effectiveDate: string;
    policy: Policy;
    setEffectiveDate: (value: string) => void;
}) => {
    const { t } = useTranslation(TranslationFiles.COMMON, { keyPrefix: 'cancelFreelook.date' });
    const { goToNext } = useWorkflow();

    const [formError, setFormError] = useState<null | string>(null);

    const invalidDate = t('effectiveDateError');

    const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const dateValue = event.target.value;
        setEffectiveDate(dateValue);
    };

    const isDateValid = (date: string): boolean => {
        return dayjs(date, NUMERIC_DATE_FORMAT).isValid() && date !== '';
    };

    const handleContinue = useCallback(() => {
        if (isDateValid(effectiveDate) === false) {
            return setFormError(invalidDate);
        }

        goToNext();
    }, [effectiveDate, goToNext, invalidDate]);

    return (
        <WorkflowCard
            title={t('label')}
            footerContent={
                <TransactionNavigationButtons
                    className="mt-4"
                    handleContinue={handleContinue}
                    parentPage={ParentPage.Withdrawals}
                    planCode={policy.product?.planCode}
                    policyNumber={policy.policyNumber}
                />
            }
        >
            <div className="flex flex-col gap-4" data-testid="effective-date">
                <FieldDateSelect
                    isFutureDateDisabled={false}
                    formatOptions={{ format: '##/##/####' }}
                    className="flex max-w-[155px]"
                    labelTooltip={t('effectiveDate') as string}
                    labelTooltipBody={t('effectiveDateTooltip') as string}
                    label={t('effectiveDate') as string}
                    value={effectiveDate}
                    onChange={handleDateChange}
                    size={FieldSize.Small}
                    type={FieldType.BaseActive}
                    variant={isDateValid(effectiveDate) ? FieldVariant.Default : FieldVariant.Error}
                    message={isDateValid(effectiveDate) ? undefined : invalidDate}
                />
                {!!formError && formError !== invalidDate && (
                    <AssistiveText className="mt-2" variant={AssistiveTextVariant.Error} text={formError}></AssistiveText>
                )}
            </div>
        </WorkflowCard>
    );
};

export default EffectiveDate;
