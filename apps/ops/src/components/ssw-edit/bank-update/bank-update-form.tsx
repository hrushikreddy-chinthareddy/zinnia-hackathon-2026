import router from 'next/router';
import { useTranslation } from 'next-i18next';
import { FormEvent, useContext, useState } from 'react';

import SelectSimple from '@deps/components/select/select';
import { FormDataContext } from '@deps/contexts/OtpWithdrawalFormContext';
import { DocumentData } from '@deps/models/case/document';
import { BankUpdateType, ChannelType, ContributionType } from '@deps/models/case/enums';
import { TaskStatus } from '@deps/models/case/task-instance';
import { DEFAULT_DISBURSEMENT_UPDATE } from '@deps/models/case/withdrawal/disbursement-types';
import { updateTask } from '@deps/queries/api/v2/task';
import { ReactComponent as CircleCheckIcon } from '@deps/styles/elements/icons/circles/circle-checkmark.svg';
import { ReactComponent as ChevronLeftIcon } from '@deps/styles/elements/icons/icons_outlined/chevron-left.svg';

import { BankUpdateFieldConfigs, bankUpdateFormData, signaturesConfig, typeOptions } from './bank-update.helper';
import Button, { ButtonSize, ButtonType, ButtonVariant } from '../../button/button';
import CardInfo from '../../card/card-info/card-info';
import { FieldSize } from '../../fields/field';
import NavElement, { NavElementSize, NavElementType, NavElementVariant } from '../../nav-element/nav-element';
import FormDisbursementSection from '../../otp-withdrawal-form/form-disbursement/form-disbursement-section';
import SignatureValidations from '../../otp-withdrawal-form/signature-validation/signature-validations';
import PageLoader, { PageLoaderVariant } from '../../page-loader/page-loader';
import ApiErrorCard from '../../workflows/api-error-card/api-error-card';

type BankUpdateFormProps = {
    document: DocumentData;
};
const BankUpdateForm = ({ document }: BankUpdateFormProps) => {
    const { t } = useTranslation(undefined, { keyPrefix: 'caseWithdrawal.request' });
    const [bankUpdateDetails, setBankUpdateDetails] = useState(DEFAULT_DISBURSEMENT_UPDATE);
    const [isLoading, setIsLoading] = useState(false);
    const [formSubmitted, setFormSubmitted] = useState(false);
    const [formError, setFormError] = useState(false);
    const [timer] = useState(performance.now());

    const { initialForm, formSignature } = useContext(FormDataContext);

    const requestBankUpdate = async (bankUpdateType: BankUpdateType) => {
        setIsLoading(true);
        const successfulCaseUpdate = await updateTask(
            initialForm.caseId,
            initialForm?.taskId,
            bankUpdateFormData(TaskStatus.Completed, initialForm, bankUpdateDetails, formSignature, document, bankUpdateType),
            timer
        );

        if (successfulCaseUpdate) {
            setIsLoading(false);
            setFormSubmitted(true);
        } else {
            setFormError(true);
        }
    };

    const handleFormAction = async (event: FormEvent, bankUpdateType: BankUpdateType) => {
        event.preventDefault();
        let confirmCancel;
        if (bankUpdateType === BankUpdateType.BankTerminate) {
            confirmCancel = window.confirm(t('distributionMethod.confirmTerminate') as string);
            if (confirmCancel) {
                requestBankUpdate(bankUpdateType);
            }
        }
        if (bankUpdateType === BankUpdateType.BankUpdate) {
            requestBankUpdate(bankUpdateType);
        }
    };

    const handleBackRoute = () => {
        setIsLoading(true);
        router.back();
    };

    if (isLoading) {
        return (
            <div className="responsive-padding flex h-[300px] w-full grow">
                <PageLoader variant={PageLoaderVariant.Center} />
            </div>
        );
    }

    if (formError) {
        return (
            <ApiErrorCard
                leaveRoute={'/create-case'}
                submit={{
                    action: () => {
                        router.reload();
                    },
                    text: t('distributionMethod.tryAgain'),
                }}
            />
        );
    }

    return (
        <>
            {!formSubmitted && (
                <>
                    <NavElement
                        type={NavElementType.Link}
                        className="flex items-center my-4 no-underline relative "
                        size={NavElementSize.Small}
                        variant={NavElementVariant.Secondary}
                        startIcon={<ChevronLeftIcon width={16} height={16} />}
                        onClick={handleBackRoute}
                    >
                        <div className="font-bold text-md hover:underline">{t('distributionMethod.back')}</div>
                    </NavElement>

                    <div className="flex justify-between">
                        <label className="font-primary text-lg font-bold">{t('distributionMethod.bankUpdateTitle')}</label>
                        <Button
                            className="mr-4"
                            onClick={e => handleFormAction(e, BankUpdateType.BankTerminate)}
                            size={ButtonSize.Small}
                            variant={ButtonVariant.Default}
                            disabled={false}
                            type={ButtonType.Contrast}
                        >
                            {t('distributionMethod.terminate')}
                        </Button>
                    </div>
                </>
            )}

            {!formSubmitted ? (
                <>
                    <div className=" mx-6">
                        <div className="my-4 grid w-full grid-cols-4 gap-4">
                            <SelectSimple
                                disabled={false}
                                className="max-w-lg"
                                label={t('distributionMethod.type') || ''}
                                options={typeOptions(t)}
                                onChange={val => setBankUpdateDetails(prevState => ({ ...prevState, bankType: val }))}
                                size={FieldSize.Small}
                                value={bankUpdateDetails.bankType || ContributionType.Disbursement}
                                name="sswType"
                            />
                        </div>
                        <div>
                            <FormDisbursementSection
                                fields={BankUpdateFieldConfigs(t)[0]?.fields}
                                disbursementInformation={bankUpdateDetails}
                                onDataChange={setBankUpdateDetails}
                                isFormStateReadOnly={false}
                            />
                        </div>
                    </div>
                    <div>
                        {document.source === ChannelType.Email && formSignature && (
                            <SignatureValidations isFormStateReadOnly={false} config={signaturesConfig} />
                        )}

                        <div className="flex flex-col p-4">
                            <div className="flex">
                                <Button
                                    className="mr-4"
                                    onClick={e => handleFormAction(e, BankUpdateType.BankUpdate)}
                                    size={ButtonSize.Small}
                                    variant={ButtonVariant.Default}
                                    disabled={isLoading}
                                    type={ButtonType.Primary}
                                >
                                    {t('distributionMethod.submit')}
                                </Button>
                                <NavElement
                                    aria-label={t('cancel') as string}
                                    onClick={() => router.push('/create-case')}
                                    size={NavElementSize.Small}
                                    type={NavElementType.Button}
                                    variant={NavElementVariant.Default}
                                    disabled={false}
                                >
                                    {t('distributionMethod.cancel')}
                                </NavElement>
                            </div>
                        </div>
                    </div>
                </>
            ) : (
                <div className="flex justify-center items-center my-auto ">
                    <CardInfo
                        icon={<CircleCheckIcon className="text-semantic-success" height={50} width={50} />}
                        cta={{
                            action: () => {
                                router.push('/create-case');
                            },
                            text: t('distributionMethod.close'),
                        }}
                        subtitle={t('distributionMethod.submitedMessage')}
                        title={t('distributionMethod.submitted')}
                    />
                </div>
            )}
        </>
    );
};

export default BankUpdateForm;
