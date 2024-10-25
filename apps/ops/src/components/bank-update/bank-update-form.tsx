import { useTranslation } from 'next-i18next';
import { useContext, useEffect, useState } from 'react';

import SelectSimple from '@deps/components/select/select';
import { FormDataContext } from '@deps/contexts/OtpWithdrawalFormContext';
import { ContributionType } from '@deps/models/case/enums';
import { Channel } from '@deps/models/case/renewal/case-renewal';
import { DEFAULT_DISBURSEMENT_UPDATE } from '@deps/models/case/withdrawal/disbursement-types';
import { ReactComponent as ChevronLeftIcon } from '@deps/styles/elements/icons/icons_outlined/chevron-left.svg';

import { BankFieldConfigs, channelOptions, typeOptions } from './bank-update.helper';
import Button, { ButtonSize, ButtonType } from '../button/button';
import { FieldSize } from '../fields/field';
import NavElement, { NavElementSize, NavElementType, NavElementVariant } from '../nav-element/nav-element';
import AccountTypes from '../otp-withdrawal-form/form-disbursement/form-disbursement-parts/account-type';
import BankBooleanButtonGroup from '../otp-withdrawal-form/form-disbursement/form-disbursement-parts/bank-boolean-button-group';
import BankTextField from '../otp-withdrawal-form/form-disbursement/form-disbursement-parts/bank-text-field';
import { BankingFields } from '../otp-withdrawal-form/form-disbursement/form-disbursement.helper';

// const INITIAL_BANK_UPDATE_DATA = {
//     updateType: 'BankUpdate',
//     contractNumber: '',
//     bank: [
//         {
//             accountNumber: '',
//             accountType: {
//                 text: 'Checking',
//             },
//             bankName: 'SBI',
//             nameOnBankAccount: 'Saurav',
//             routingNumber: '9876543',
//             bankType: 'Disbursement',
//         },
//     ],
//     doesCheckMeetSecRequiremnt: true,
//     voidCheck: true,
//     programs: null,
// };

const BankUpdateForm = () => {
    const { t } = useTranslation(undefined, { keyPrefix: 'bankUpdate' });

    const [bankUpdateDetails, setBankUpdateDetails] = useState(DEFAULT_DISBURSEMENT_UPDATE);
    const { initialForm, formSource, setFormSource } = useContext(FormDataContext);

    useEffect(() => {
        // setBankUpdateDetails(prevState => {
        //     return { ...prevState, contractNumber: initialForm.data.contractNum };
        // });
        if (!formSource.channel.text) {
            setFormSource(prevState => ({ ...prevState, channel: { text: Channel.Phone } }));
        }
    }, [initialForm]);

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

    const [timer] = useState(performance.now());

    // const handleFormSubmit = async (event: FormEvent) => {
    //     event.preventDefault();
    //     //  setIsLoading(true);
    //     //  setTaskApiError('');
    //     //  if (validateForm() && areDiaryNotesViewed) {
    //     let successfulCaseUpdate;
    //     if (TaskApiVersionMapper[initialForm.taskType] === ApiVersion.v2) {
    //         successfulCaseUpdate = await updateTask(
    //             initialForm.caseId,
    //             initialForm?.taskId,
    //             buildFormV2(TaskStatus.Completed, document, formState),
    //             timer
    //         );
    //     } else {
    //         successfulCaseUpdate = await putCaseTask(
    //             initialForm.caseId,
    //             initialForm.taskId,
    //             buildForm(CaseStatus.Submit, document, formState)
    //         );
    //     }

    //     if (successfulCaseUpdate) {
    //         if (isLocalStorageEnabled()) {
    //             const successMessage = t(
    //                 `createTaskSuccess.${TaskTypeTranslation[formState?.initialForm?.data?.taskType as keyof typeof TaskTypeTranslation]}`,
    //                 {
    //                     contractNumber: document?.contract,
    //                     documentNumber: document?.documentNumber,
    //                 }
    //             );

    //             localStorage.setItem(
    //                 FormSuccessMessageKey[formState?.initialForm?.data?.taskType as keyof typeof FormSuccessMessageKey],
    //                 successMessage
    //             );
    //         }

    //         router.push(`/create-case`);
    //     } else {
    //         //  setTaskApiError(t('submitError') as string);
    //         //  setIsLoading(false);
    //     }
    //     //  } else {
    //     //      setIsLoading(false);
    //     //  }
    // };
    // const realTimeValidationError = validator?.(SupportedValidationOperation.Equal, value, disbursementInformation) || error;

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
                        options={channelOptions(t)}
                        onChange={val => setFormSource(prevState => ({ ...prevState, channel: { text: val } }))}
                        size={FieldSize.Small}
                        value={formSource.channel.text as Channel}
                        name="channel"
                    />
                </div>
                <div className="my-4 grid w-full grid-cols-4 gap-4">
                    <SelectSimple
                        disabled={false}
                        className="max-w-lg"
                        label={t('type') || ''}
                        options={typeOptions(t)}
                        // onChange={() => setBankUpdateDetails(prevState => ({...prevState,}
                        onChange={val => setBankUpdateDetails(prevState => ({ ...prevState, bankType: val }))}
                        size={FieldSize.Small}
                        value={bankUpdateDetails.bankType || ContributionType.Disbursement}
                        name="sswType"
                    />
                </div>
                <div className="my-4 grid w-full grid-cols-4 gap-4">
                    <BankBooleanButtonGroup
                        fieldLabel={t('isVoidCheckAttached')}
                        fieldName={isVoidCheckField.fieldName}
                        isFormStateReadOnly={false}
                        disbursementInformation={bankUpdateDetails as any}
                        classNames={isVoidCheckField.classNames}
                        onDataChange={setBankUpdateDetails}
                    />

                    <BankBooleanButtonGroup
                        fieldLabel={t('doesCheckMeetSecurityRequirements')}
                        fieldName={meetSecurityCheck.fieldName}
                        isFormStateReadOnly={false}
                        disbursementInformation={bankUpdateDetails as any}
                        // classNames={meetSecurityCheck.classNames}
                        onDataChange={setBankUpdateDetails}
                    />
                </div>
                <div className="my-4 grid w-full grid-cols-4 gap-4">
                    <AccountTypes
                        fieldLabel={t('type')}
                        fieldName={accountType.fieldName}
                        classNames={accountType.classNames}
                        disbursementInformation={bankUpdateDetails as any}
                        isFormStateReadOnly={false}
                        onDataChange={setBankUpdateDetails}
                        error={''}
                    />
                    {/* <SelectSimple
                        key={accountType.fieldName}
                        disabled={false}
                        className={accountType.classNames}
                        label={t('type') as string}
                        options={accountTypeOptions(t)}
                        onChange={() => {}}
                        size={FieldSize.Small}
                        // value={bankUpdateDetails.bank[0].accountType.text as ContributionType}
                        value={''}
                        name="accountType"
                    /> */}
                </div>
                <div className="my-4 grid w-full grid-cols-4 gap-4">
                    <BankTextField
                        fieldLabel={t('accountNumber')}
                        fieldName={'accountNumber'}
                        classNames={accountNumber.className}
                        // maxLength={}
                        isFormStateReadOnly={false}
                        disbursementInformation={bankUpdateDetails}
                        onDataChange={setBankUpdateDetails}
                        maskOnBlur={reEnterAccountNumber.maskOnBlur}
                        validator={reEnterAccountNumber.validator}
                        error={''}
                        disableCopyPaste={reEnterAccountNumber.disableCopyPaste}
                    />

                    <BankTextField
                        fieldLabel={t('reEnterAccountNumber')}
                        fieldName={BankingFields.ReEnterAccountNumber}
                        classNames={reEnterAccountNumber.className}
                        // maxLength={}
                        isFormStateReadOnly={false}
                        disbursementInformation={bankUpdateDetails}
                        onDataChange={setBankUpdateDetails}
                        maskOnBlur={reEnterAccountNumber.maskOnBlur}
                        validator={reEnterAccountNumber.validator}
                        error={''}
                        disableCopyPaste={reEnterAccountNumber.disableCopyPaste}
                    />
                </div>
                <div className="my-4 grid w-full grid-cols-4 gap-4">
                    <BankTextField
                        fieldLabel={t('bankRoutingNumber')}
                        fieldName={'routingNumber'}
                        classNames={bankRoutingNumber.className}
                        // maxLength={}
                        isFormStateReadOnly={false}
                        disbursementInformation={bankUpdateDetails}
                        onDataChange={setBankUpdateDetails}
                        maskOnBlur={bankRoutingNumber.maskOnBlur}
                        validator={bankRoutingNumber.validator}
                        error={''}
                        disableCopyPaste={bankRoutingNumber.disableCopyPaste}
                    />

                    <BankTextField
                        fieldLabel={t('reEnterBankRoutingNumber')}
                        fieldName="routingNumber"
                        classNames={reEnterBankRoutingNumber.className}
                        // maxLength={}
                        isFormStateReadOnly={false}
                        disbursementInformation={bankUpdateDetails}
                        onDataChange={setBankUpdateDetails}
                        maskOnBlur={reEnterBankRoutingNumber.maskOnBlur}
                        validator={reEnterBankRoutingNumber.validator}
                        error={''}
                        disableCopyPaste={reEnterBankRoutingNumber.disableCopyPaste}
                    />
                </div>
                <div className="my-4 grid w-full grid-cols-4 gap-4">
                    <BankTextField
                        fieldLabel={t('bankName')}
                        fieldName={bankName.fieldName}
                        classNames={bankName.className}
                        // maxLength={}
                        isFormStateReadOnly={false}
                        disbursementInformation={bankUpdateDetails}
                        onDataChange={setBankUpdateDetails}
                        maskOnBlur={bankName.maskOnBlur}
                        validator={bankName.validator}
                        error={''}
                        disableCopyPaste={bankName.disableCopyPaste}
                    />
                    <BankTextField
                        fieldLabel={t('accountHolder')}
                        fieldName={'nameOnBankAccount'}
                        classNames={accountHolder.className}
                        // maxLength={}
                        isFormStateReadOnly={false}
                        disbursementInformation={bankUpdateDetails}
                        onDataChange={setBankUpdateDetails}
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
