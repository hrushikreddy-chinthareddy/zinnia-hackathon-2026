import { useTranslation } from 'next-i18next';

import Radio, { RadioVariant } from '@deps/components/radio/radio';
import { maritalStatusType } from '@deps/models/case/withdrawal/case';

import { MaritalStatusAllowances } from '../maritial-status-allowance-withholdings';

interface FormProgramProcessDateProps {
    isFormStateReadOnly?: boolean;
    selected: maritalStatusType | MaritalStatusAllowances;
    setSelected: (selected: maritalStatusType) => void;
    options: SelectOneOption[];
}

export interface SelectOneOption {
    label: string;
    value: maritalStatusType | MaritalStatusAllowances;
}

export default function FormProgramMaritalStatus({ isFormStateReadOnly, selected, setSelected, options }: FormProgramProcessDateProps) {
    const { t } = useTranslation(undefined, { keyPrefix: 'caseWithdrawal.request.irsData' });

    return (
        <Radio
            items={options}
            label={t('maritalStatus') as string}
            onChange={event => setSelected(event.target.value as maritalStatusType)}
            value={selected}
            variant={isFormStateReadOnly ? RadioVariant.Inactive : RadioVariant.Default}
            className="!m-0"
        />
    );
}
