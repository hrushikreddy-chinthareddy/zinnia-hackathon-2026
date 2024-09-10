import { useTranslation } from 'next-i18next';
import { useContext } from 'react';

import ButtonGrp from '@deps/components/button-group/button-group';
import { FormDataContext } from '@deps/contexts/OtpWithdrawalFormContext';
import { MoneyType } from '@deps/models/case/withdrawal/case';

interface MoneyTypeProps {
    moneyTypeOptions: { label: string; value: MoneyType }[];
    isFormStateReadOnly?: boolean,
}
const MoneyTypeComponent = ({ moneyTypeOptions, isFormStateReadOnly }: MoneyTypeProps) => {
    const { t } = useTranslation(undefined, { keyPrefix: 'caseWithdrawal.request.distributionInstruction' });
    const { formDistribution, setFormDistribution } = useContext(FormDataContext);
    
    const setMoneyType = (val: string) => {
        setFormDistribution(ogfd => {
            return { ...ogfd, moneyType: { text: val as MoneyType } };
        });
    };

    return (
        <div className="mt-4">
            <ButtonGrp
                activeValue={formDistribution?.moneyType?.text || ''}
                groupLabel={t(`moneyType`)}
                toggle={val => {
                    setMoneyType(val as MoneyType);
                }}
                labels={moneyTypeOptions}
                disabled={isFormStateReadOnly}
            />
        </div>
    );
};

export default MoneyTypeComponent;
