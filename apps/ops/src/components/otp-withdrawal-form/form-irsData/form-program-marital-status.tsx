import { useTranslation } from 'next-i18next';

import Radio, { RadioVariant } from '@deps/components/radio/radio';
import { maritalStatusType } from '@deps/models/case/withdrawal/case';

interface FormProgramProcessDateProps {
  isFormStateReadOnly?: boolean;
  selected: maritalStatusType;
  setSelected: (selected: maritalStatusType) => void;
}

export interface SelectOneOption {
  label: string;
  value: maritalStatusType;

}

export default function FormProgramMaritalStatus({ isFormStateReadOnly, selected, setSelected }: FormProgramProcessDateProps) {

  const { t } = useTranslation(undefined, { keyPrefix: 'caseWithdrawal.request.irsData' });

  const options: SelectOneOption[] = [
    { label: 'Single', value: maritalStatusType.single },
    { label: 'Married Filing Jointly', value: maritalStatusType.marriedFilingJointly },
    { label: 'Married Filing Separately', value: maritalStatusType.marriedFilingSeparately },
  ];

  return (
    <Radio
      items={options}
      label={t('maritalStatus') as string}
      onChange={event => setSelected(event.target.value as maritalStatusType)}
      value={selected}
      variant={isFormStateReadOnly ? RadioVariant.Inactive : RadioVariant.Default}
      disabled={isFormStateReadOnly}
      className='!m-0'
    />
  );
}