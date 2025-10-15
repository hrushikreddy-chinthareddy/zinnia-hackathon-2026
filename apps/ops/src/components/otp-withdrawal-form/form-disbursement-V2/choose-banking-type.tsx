import { FieldSize } from '@zinnia/bloom/components';
import { useTranslation } from 'next-i18next';
import { useContext } from 'react';

import Radio, { RadioOrientation } from '@deps/components/radio/radio';
import SelectSimple from '@deps/components/select/select';
import { FormDataContext } from '@deps/contexts/OtpWithdrawalFormContext';

import { SelectedBanking } from './form-disbursement.types';
import {
    getBankTypeOptions,
    getBankTypeOptionsMap,
    radioOptions,
    typeKeyMap,
} from '../form-disbursement/form-disbursement.helpers';

interface ChooseBankingTypeProps {
    fieldLabel?: string;
    fieldName?: string;
    classNames?: string;
    isFormStateReadOnly: boolean;
    bankingTypeOptions?: any[];
    onDataChange: any;
    handleRadioChange: any;
    defaultDisbursementInfo: any;
}

const ChooseBankingType = ({
    isFormStateReadOnly,
    classNames,
    defaultDisbursementInfo,
    onDataChange,
    handleRadioChange,
}: ChooseBankingTypeProps) => {
    const { t } = useTranslation(undefined, {
        keyPrefix: 'caseWithdrawal.request.distributionMethod',
    });
    const { bankDetails } = useContext(FormDataContext);

    const bankingType =
        defaultDisbursementInfo?.bankVerification?.selectedBankingType;

    const selectedOpt = getBankTypeOptionsMap(t, bankingType);

    if (bankDetails?.selectedBanking === SelectedBanking.OnFile) {
        return null;
    }

    return (
        <div className={classNames}>
            <SelectSimple
                disabled={isFormStateReadOnly}
                label={t('chooseBankingType') as string}
                options={getBankTypeOptions(t)}
                onChange={(val) => onDataChange(val)}
                size={FieldSize.Small}
                value={
                    defaultDisbursementInfo?.bankVerification
                        ?.selectedBankingType ?? ''
                }
                data-testid="bankDropdown"
                key={'select-bank'}
            />
            <div className="col-span-1 my-3">
                {selectedOpt?.map((item) => {
                    const validationsKey: any =
                        bankingType && typeKeyMap[bankingType];
                    const radioValue =
                        defaultDisbursementInfo?.bankVerification
                            ?.validationsMap?.[validationsKey]?.[
                            item.fieldName
                        ];
                    return (
                        <div key={item.label}>
                            <Radio
                                items={radioOptions(t)}
                                label={item.label}
                                value={`${radioValue}`}
                                onChange={(val) =>
                                    handleRadioChange(item.fieldName, val)
                                }
                                orientation={RadioOrientation.Horizontal}
                                className="my-2"
                                name={item.label}
                                disabled={isFormStateReadOnly}
                            />
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ChooseBankingType;
