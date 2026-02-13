import { useTranslation } from 'next-i18next';
import { useContext, useMemo } from 'react';

import { FieldSize } from '@deps/components/fields/field';
import SelectSimple from '@deps/components/select/select';
import { FormDataContext } from '@deps/contexts/OtpWithdrawalFormContext';
import { FormDisbursement } from '@deps/models/case/withdrawal/case';
import {
    DisbursementInformation,
    SendCheckOption,
} from '@deps/models/case/withdrawal/disbursement-types';

import { DEFAULT_ADDRESS } from '../../address-entry';
import { defaultSendCheckOptions } from '../form-disbursement.helpers';

const identifySelectedSendCheckOption = (
    formDisbursement: FormDisbursement
): SendCheckOption => {
    if (formDisbursement?.isAnnuitant) {
        return SendCheckOption.Annuitant;
    }
    if (formDisbursement?.isThirdPartyDisbursement) {
        return SendCheckOption.ThirdPartyNotFinancialIns;
    }
    if (formDisbursement?.isPayeeFinancialIns) {
        return SendCheckOption.FinancialInstitution;
    }
    if (formDisbursement?.isAddressDifferent) {
        return SendCheckOption.DifferentAddress;
    }
    if (formDisbursement?.isPayeeCharity) {
        return SendCheckOption.Charity;
    }
    // Default to OwnerAddress if all flags are false
    return SendCheckOption.OwnerAddress;
};

const SendCheckSelect = ({
    fieldName,
    classNames,
    isFormStateReadOnly,
    onDataChange,
    selectOptions,
    annuitantAddress,
}: DisbursementInformation) => {
    const { formDisbursement } = useContext(FormDataContext);

    const selectedValue = useMemo(
        () =>
            identifySelectedSendCheckOption(
                formDisbursement as FormDisbursement
            ),
        [formDisbursement]
    );

    const { t } = useTranslation(undefined, {
        keyPrefix: 'caseWithdrawal.request.distributionMethod',
    });

    const sendCheckOptions = selectOptions ?? defaultSendCheckOptions(t);

    const handleChange = (val: string) => {
        if (isFormStateReadOnly) return;

        const newValue = val as SendCheckOption;

        switch (newValue) {
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
                    address: annuitantAddress || DEFAULT_ADDRESS,
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
    };

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
