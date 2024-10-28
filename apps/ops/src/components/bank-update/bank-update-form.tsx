import router from 'next/router';
import { useTranslation } from 'next-i18next';
import { FormEvent, useContext, useState } from 'react';

import SelectSimple from '@deps/components/select/select';
import { FormDataContext } from '@deps/contexts/OtpWithdrawalFormContext';
import { ApiVersion, ContributionType } from '@deps/models/case/enums';
import { TaskApiVersionMapper } from '@deps/models/case/helpers';
import { Channel } from '@deps/models/case/renewal/case-renewal';
import { TaskStatus } from '@deps/models/case/task-instance';
import { DEFAULT_DISBURSEMENT_UPDATE } from '@deps/models/case/withdrawal/disbursement-types';
import { putCaseTask } from '@deps/queries/api/v1/task';
import { updateTask } from '@deps/queries/api/v2/task';
import { ReactComponent as CircleCheckIcon } from '@deps/styles/elements/icons/circles/circle-checkmark.svg';
import { ReactComponent as ChevronLeftIcon } from '@deps/styles/elements/icons/icons_outlined/chevron-left.svg';

import { BankUpdateFieldConfigs, bankUpdateForm, channelOptions, signaturesConfig, typeOptions } from './bank-update.helper';
import Button, { ButtonSize, ButtonType, ButtonVariant } from '../button/button';
import CardInfo from '../card/card-info/card-info';
import { FieldSize } from '../fields/field';
import NavElement, { NavElementSize, NavElementType, NavElementVariant } from '../nav-element/nav-element';
import FormDisbursementSection from '../otp-withdrawal-form/form-disbursement/form-disbursement-section';
import SignatureValidations from '../otp-withdrawal-form/signature-validation/signature-validations';
import PageLoader, { PageLoaderVariant } from '../page-loader/page-loader';

const BankUpdateForm = () => {
    const { t } = useTranslation(undefined, { keyPrefix: 'caseWithdrawal.request' });
    const [bankUpdateDetails, setBankUpdateDetails] = useState(DEFAULT_DISBURSEMENT_UPDATE);
    const [isLoading, setIsLoading] = useState(false);
    const [formSubmitted, setFormSubmitted] = useState(false);
    const { initialForm, formSource, setFormSource, formSignature } = useContext(FormDataContext);

    const [timer] = useState(performance.now());
    console.log(initialForm, '<===initi');

    const handleFormSubmit = async (event: FormEvent) => {
        event.preventDefault();
        setIsLoading(true);
        let successfulCaseUpdate;
        if (TaskApiVersionMapper[initialForm.taskType] === ApiVersion.v2) {
            successfulCaseUpdate = await updateTask(
                initialForm.caseId,
                initialForm?.id || '',
                bankUpdateForm(TaskStatus.Completed, initialForm, formSource, bankUpdateDetails, formSignature) as any,
                timer
            );
        } else {
            successfulCaseUpdate = await putCaseTask(
                initialForm.taskType,
                initialForm.taskId,
                bankUpdateForm(TaskStatus.Completed, initialForm, formSource, bankUpdateDetails, formSignature) as any
            );
        }
        if (successfulCaseUpdate) {
            setIsLoading(false);
            setFormSubmitted(true);
        }
    };

    if (isLoading) {
        return (
            <div className="responsive-padding flex h-[300px] w-full grow">
                <PageLoader variant={PageLoaderVariant.Center} />
            </div>
        );
    }

    // if (submitFailed) {
    //     return (
    //         <ApiErrorCard
    //             leaveRoute={'/create-task'}
    //             submit={{
    //                 text: t('submitAddress'),
    //             }}
    //             // submit={{
    //             //     action: submit,
    //             //     text: t('submitAddress'),
    //             // }}
    //         />
    //     );
    // }

    const handleBackRoute = () => {
        setIsLoading(true);
        router.back();
    };

    return (
        <>
            <NavElement
                type={NavElementType.Link}
                className="flex items-center my-4 no-underline relative"
                size={NavElementSize.Small}
                variant={NavElementVariant.Secondary}
                startIcon={<ChevronLeftIcon width={16} height={16} />}
                onClick={handleBackRoute}
            >
                {t('distributionMethod.back')}
            </NavElement>
            {!formSubmitted && (
                <div className="flex justify-between">
                    <label className="font-primary text-lg font-bold">Bank Details</label>
                    <Button
                        className="mr-4"
                        onClick={() => {}}
                        size={ButtonSize.Small}
                        variant={ButtonVariant.Default}
                        disabled={false}
                        type={ButtonType.Contrast}
                    >
                        {t('distributionMethod.terminate')}
                    </Button>
                </div>
            )}

            {!formSubmitted ? (
                <>
                    <div className=" mx-6">
                        <div className="my-4 grid w-full grid-cols-4 gap-4">
                            <SelectSimple
                                disabled={false}
                                className="max-w-lg"
                                label={t('distributionMethod.channel') || ''}
                                options={channelOptions(t)}
                                onChange={val => setFormSource(prevState => ({ ...prevState, channel: { text: val } }))}
                                size={FieldSize.Small}
                                value={formSource.channel?.text || Channel.Phone}
                                name="channel"
                            />
                        </div>
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
                        {formSource.channel.text === Channel.Form && (
                            <SignatureValidations isFormStateReadOnly={false} config={signaturesConfig} />
                        )}

                        <div className="flex flex-col p-4">
                            <div className="flex">
                                <Button
                                    className="mr-4"
                                    onClick={handleFormSubmit}
                                    size={ButtonSize.Small}
                                    variant={ButtonVariant.Default}
                                    disabled={isLoading}
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
            ) : (
                <div className="flex justify-center items-center py-9 ">
                    <CardInfo
                        icon={<CircleCheckIcon className="text-semantic-success" height={50} width={50} />}
                        cta={{
                            action: () => {
                                router.push('/create-case');
                            },
                            text: t('close'),
                        }}
                        title={t('submitted')}
                    />
                </div>
            )}
        </>
    );
};

export default BankUpdateForm;
