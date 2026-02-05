import { useTranslation } from 'next-i18next';
import { useEffect, useState } from 'react';

import { FieldSize } from '@deps/components/fields/field';
import SelectSimple from '@deps/components/select/select';
import {
    DisbursementInformation,
    SendCheckOption,
} from '@deps/models/case/withdrawal/disbursement-types';

import { DEFAULT_ADDRESS } from '../../address-entry';
import { defaultSendCheckOptions } from '../form-disbursement.helpers';

const SendCheckSelect = ({
    fieldName,
    classNames,
    isFormStateReadOnly,
    onDataChange,
    selectOptions,
}: DisbursementInformation) => {
    const [selectedValue, setSelectedValue] = useState<SendCheckOption>(
        SendCheckOption.OwnerAddress
    );
    const { t } = useTranslation(undefined, {
        keyPrefix: 'caseWithdrawal.request.distributionMethod',
    });

    const sendCheckOptions = selectOptions ?? defaultSendCheckOptions(t);

    const handleChange = (val: string) => {
        setSelectedValue(val as SendCheckOption);
    };

    useEffect(() => {
        switch (selectedValue) {
            case SendCheckOption.OwnerAddress:
                onDataChange((ogData: any) => ({
                    ...ogData,
                    isPayeeFinancialIns: false,
                    isPayeeCharity: false,
                    isThirdPartyDisbursement: false,
                    isAnnuitant: false,
                    isAddressDifferent: false,
                    address: DEFAULT_ADDRESS,
                }));
                break;
            case SendCheckOption.FinancialInstitution:
                onDataChange((ogData: any) => ({
                    ...ogData,
                    isPayeeFinancialIns: true,
                    isPayeeCharity: false,
                    isThirdPartyDisbursement: false,
                    isAnnuitant: false,
                    isAddressDifferent: false,
                    address: DEFAULT_ADDRESS,
                }));
                break;
            case SendCheckOption.Charity:
                onDataChange((ogData: any) => ({
                    ...ogData,
                    isPayeeFinancialIns: false,
                    isPayeeCharity: true,
                    isThirdPartyDisbursement: false,
                    isAnnuitant: false,
                    isAddressDifferent: false,
                    address: DEFAULT_ADDRESS,
                }));
                break;
            case SendCheckOption.Annuitant:
                onDataChange((ogData: any) => ({
                    ...ogData,
                    isPayeeFinancialIns: false,
                    isPayeeCharity: false,
                    isThirdPartyDisbursement: false,
                    isAnnuitant: true,
                    isAddressDifferent: false,
                    address: DEFAULT_ADDRESS,
                }));
                break;
            case SendCheckOption.ThirdPartyNotFinancialIns:
                onDataChange((ogData: any) => ({
                    ...ogData,
                    isPayeeFinancialIns: false,
                    isPayeeCharity: false,
                    isThirdPartyDisbursement: true,
                    isAnnuitant: false,
                    isAddressDifferent: false,
                    address: DEFAULT_ADDRESS,
                }));
                break;
            case SendCheckOption.DifferentAddress:
                onDataChange((ogData: any) => ({
                    ...ogData,
                    isPayeeFinancialIns: false,
                    isPayeeCharity: false,
                    isThirdPartyDisbursement: false,
                    isAnnuitant: false,
                    isAddressDifferent: true,
                    address: DEFAULT_ADDRESS,
                }));
                break;
            default:
                break;
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedValue]);

    return (
        <div>
            <SelectSimple
                disabled={isFormStateReadOnly}
                className={classNames}
                label={'Please Choose One'}
                options={sendCheckOptions}
                onChange={handleChange}
                size={FieldSize.Small}
                value={selectedValue}
                data-testid="send-check-select"
                key={fieldName}
            />
        </div>
    );
};

export default SendCheckSelect;
