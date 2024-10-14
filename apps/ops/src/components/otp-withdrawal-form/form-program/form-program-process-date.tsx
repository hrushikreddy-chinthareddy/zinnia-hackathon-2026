import { useTranslation } from 'next-i18next';
import { useContext, useEffect, useState } from 'react';

import Radio, { RadioVariant } from '@deps/components/radio/radio';
import { FormDataContext } from '@deps/contexts/OtpWithdrawalFormContext';
import { ProcessRequestType } from '@deps/models/case/withdrawal/case';

interface FormProgramProcessDateProps {
    options: SelectOneOption[];
    isFormStateReadOnly?: boolean;
}

export interface SelectOneOption {
    label: string;
    value: ProcessRequestType;
    subElement?: JSX.Element;
}

export default function FormProgramProcessDate({ options, isFormStateReadOnly }: FormProgramProcessDateProps) {
    const { formProgram, setFormProgram } = useContext(FormDataContext);
    const { t } = useTranslation(undefined, { keyPrefix: 'caseWithdrawal.request.amountDetails.processTimeframe' });
    const [selected, setSelected] = useState<ProcessRequestType | ''>(formProgram?.processRequestType?.[0]?.text || '');

    useEffect(() => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { asOfDate: intentionallyRemovingThisValue, ...rest } = formProgram;

        const formProcessRequestType = selected ? [{ text: selected }] : null;
        const selectedAsOfDate = selected === ProcessRequestType.AsOfDate ? intentionallyRemovingThisValue?.text ?? null : null;
        setFormProgram({
            ...rest,
            asOfDate: { text: selectedAsOfDate }, // setting null for default, value will update from as-of-date component
            processRequestType: formProcessRequestType,
        });
    }, [selected]);

    return (
        <div className="mt-8">
            <Radio
                items={options}
                label={t('selectOne') as string}
                onChange={event => setSelected(event.target.value as ProcessRequestType)}
                value={selected}
                variant={isFormStateReadOnly ? RadioVariant.Inactive : RadioVariant.Default}
                disabled={isFormStateReadOnly}
            />
        </div>
    );
}
