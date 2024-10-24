import { useTranslation } from 'next-i18next';
import { useState } from 'react';

import SelectSimple from '@deps/components/select/select';
import { ContributionType } from '@deps/models/case/enums';
import { Channel } from '@deps/models/case/renewal/case-renewal';
import { ReactComponent as ChevronLeftIcon } from '@deps/styles/elements/icons/icons_outlined/chevron-left.svg';

import { BankFieldConfigs } from './bank-update.helper';
import Button, { ButtonSize, ButtonType } from '../button/button';
import { FieldSize } from '../fields/field';
import NavElement, { NavElementSize, NavElementType, NavElementVariant } from '../nav-element/nav-element';
import AccountTypes from '../otp-withdrawal-form/form-disbursement/form-disbursement-parts/account-type';
import BankBooleanButtonGroup from '../otp-withdrawal-form/form-disbursement/form-disbursement-parts/bank-boolean-button-group';
import BankTextField from '../otp-withdrawal-form/form-disbursement/form-disbursement-parts/bank-text-field';

const BankUpdateForm = () => {
    const [channel, setChannel] = useState();
    const [contributionType, setContributionType] = useState(ContributionType.Disbursement);

    const { t } = useTranslation(undefined, { keyPrefix: 'bankUpdate' });

    const {
        isVoidCheckField,
        meetSecurityCheck,
        accountType,
        accountNumber,
        reEnterAccountNumber,
        bankRoutingNumber,
        reEnterBankRoutingNumber,
        bankName,
        accountHolder,
    } = BankFieldConfigs();

    const channelOptions = [
        {
            label: t('channelOptions.emailFaxMail'),
            value: Channel.Form,
        },
        {
            label: t('channelOptions.phone'),
            value: Channel.Phone,
        },
    ];

    const typeOptions = [
        {
            label: t('contributionType.contribution'),
            value: ContributionType.Contribution,
        },
        {
            label: t('contributionType.loan'),
            value: ContributionType.Loan,
        },
        {
            label: t('contributionType.disbursement'),
            value: ContributionType.Disbursement,
        },
    ];

    return (
        <>
            <NavElement
                type={NavElementType.Link}
                className="flex items-center my-4"
                size={NavElementSize.Small}
                variant={NavElementVariant.Default}
                // href={'/back'}
                startIcon={<ChevronLeftIcon width={16} height={16} />}
            >
                {t('back')}
            </NavElement>
            <div className="flex justify-between">
                <label className="font-primary text-lg font-bold">Bank Details</label>
                <Button
                    className="mr-4"
                    onClick={() => {}}
                    size={ButtonSize.Small}
                    // variant={isFormStateReadOnly || isLoading ? ButtonVariant.Inactive : ButtonVariant.Default}
                    // disabled={isFormStateReadOnly || isLoading}
                    type={ButtonType.Contrast}
                >
                    {t('terminate')}
                </Button>
            </div>
            <div className=" mx-4">
                <div className="my-4 grid w-full grid-cols-4 gap-4">
                    <SelectSimple
                        disabled={false}
                        className="max-w-lg"
                        label={t('channel') || ''}
                        options={channelOptions}
                        onChange={val => setChannel(val as any)}
                        size={FieldSize.Small}
                        value={channel || ''}
                        name="channel"
                    />
                </div>
                <div className="my-4 grid w-full grid-cols-4 gap-4">
                    <SelectSimple
                        disabled={false}
                        className="max-w-lg"
                        label={t('type') || ''}
                        options={typeOptions}
                        onChange={val => setContributionType(val as ContributionType)}
                        size={FieldSize.Small}
                        value={contributionType}
                        name="sswType"
                    />
                </div>
                <div className="my-4 grid w-full grid-cols-4 gap-4">
                    <BankBooleanButtonGroup
                        fieldLabel={t('isVoidCheckAttached')}
                        fieldName={isVoidCheckField.fieldName}
                        isFormStateReadOnly={false}
                        disbursementInformation={{} as any}
                        classNames={isVoidCheckField.classNames}
                        onDataChange={() => {}}
                    />

                    <BankBooleanButtonGroup
                        fieldLabel={t('doesCheckMeetSecurityRequirements')}
                        fieldName={meetSecurityCheck.fieldName}
                        isFormStateReadOnly={false}
                        disbursementInformation={{} as any}
                        // classNames={meetSecurityCheck.classNames}
                        onDataChange={() => {}}
                    />
                </div>
                <div className="my-4 grid w-full grid-cols-4 gap-4">
                    <AccountTypes
                        fieldLabel={t('type')}
                        fieldName={accountType.fieldName}
                        classNames={accountType.classNames}
                        disbursementInformation={{} as any}
                        isFormStateReadOnly={false}
                        onDataChange={() => {}}
                        error={''}
                    />
                </div>
                <div className="my-4 grid w-full grid-cols-4 gap-4">
                    <BankTextField
                        fieldLabel={t('accountNumber')}
                        fieldName={accountNumber.fieldLabel}
                        classNames={accountNumber.className}
                        // maxLength={}
                        isFormStateReadOnly={false}
                        disbursementInformation={{} as any}
                        onDataChange={() => {}}
                        maskOnBlur={accountNumber.maskOnBlur}
                        validator={accountNumber.validator}
                        error={''}
                        disableCopyPaste={accountNumber.disableCopyPaste}
                    />

                    <BankTextField
                        fieldLabel={t('reEnterAccountNumber')}
                        fieldName={reEnterAccountNumber.fieldLabel}
                        classNames={reEnterAccountNumber.className}
                        // maxLength={}
                        isFormStateReadOnly={false}
                        disbursementInformation={{} as any}
                        onDataChange={() => {}}
                        maskOnBlur={reEnterAccountNumber.maskOnBlur}
                        validator={reEnterAccountNumber.validator}
                        error={''}
                        disableCopyPaste={reEnterAccountNumber.disableCopyPaste}
                    />
                </div>
                <div className="my-4 grid w-full grid-cols-4 gap-4">
                    <BankTextField
                        fieldLabel={t('bankRoutingNumber')}
                        fieldName={bankRoutingNumber.fieldLabel}
                        classNames={bankRoutingNumber.className}
                        // maxLength={}
                        isFormStateReadOnly={false}
                        disbursementInformation={{} as any}
                        onDataChange={() => {}}
                        maskOnBlur={bankRoutingNumber.maskOnBlur}
                        validator={bankRoutingNumber.validator}
                        error={''}
                        disableCopyPaste={bankRoutingNumber.disableCopyPaste}
                    />

                    <BankTextField
                        fieldLabel={t('reEnterBankRoutingNumber')}
                        fieldName={reEnterBankRoutingNumber.fieldLabel}
                        classNames={reEnterBankRoutingNumber.className}
                        // maxLength={}
                        isFormStateReadOnly={false}
                        disbursementInformation={{} as any}
                        onDataChange={() => {}}
                        maskOnBlur={reEnterBankRoutingNumber.maskOnBlur}
                        validator={reEnterBankRoutingNumber.validator}
                        error={''}
                        disableCopyPaste={reEnterBankRoutingNumber.disableCopyPaste}
                    />
                </div>
                <div className="my-4 grid w-full grid-cols-4 gap-4">
                    <BankTextField
                        fieldLabel={t('bankName')}
                        fieldName={bankName.fieldLabel}
                        classNames={bankName.className}
                        // maxLength={}
                        isFormStateReadOnly={false}
                        disbursementInformation={{} as any}
                        onDataChange={() => {}}
                        maskOnBlur={bankName.maskOnBlur}
                        validator={bankName.validator}
                        error={''}
                        disableCopyPaste={bankName.disableCopyPaste}
                    />
                    <BankTextField
                        fieldLabel={t('accountHolder')}
                        fieldName={accountHolder.fieldLabel}
                        classNames={accountHolder.className}
                        // maxLength={}
                        isFormStateReadOnly={false}
                        disbursementInformation={{} as any}
                        onDataChange={() => {}}
                        maskOnBlur={accountHolder.maskOnBlur}
                        validator={accountHolder.validator}
                        error={''}
                        disableCopyPaste={accountHolder.disableCopyPaste}
                    />
                </div>
                <div className="flex flex-col p-4">
                    <div className="flex">
                        <Button
                            className="mr-4"
                            onClick={() => {}}
                            size={ButtonSize.Small}
                            // variant={isFormStateReadOnly || isLoading ? ButtonVariant.Inactive : ButtonVariant.Default}
                            // disabled={isFormStateReadOnly || isLoading}
                            type={ButtonType.Primary}
                        >
                            {t('submit')}
                        </Button>
                        <NavElement
                            aria-label={t('cancel') as string}
                            onClick={() => {}}
                            size={NavElementSize.Small}
                            type={NavElementType.Button}
                            variant={NavElementVariant.Default}
                            disabled={false}
                        >
                            {t('cancel')}
                        </NavElement>
                    </div>
                </div>
            </div>
        </>
    );
};

export default BankUpdateForm;
