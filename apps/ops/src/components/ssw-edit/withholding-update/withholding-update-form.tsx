import router from 'next/router';
import { useTranslation } from 'next-i18next';
import { useContext, useState } from 'react';

import Button, {
    ButtonSize,
    ButtonType,
    ButtonVariant,
} from '@deps/components/button/button';
import NavElement, {
    NavElementSize,
    NavElementType,
    NavElementVariant,
} from '@deps/components/nav-element/nav-element';
import NoteSection from '@deps/components/otp-withdrawal-form/note-section';
import SignatureValidations from '@deps/components/otp-withdrawal-form/signature-validation/signature-validations';
import TaxWithholdings from '@deps/components/otp-withdrawal-form/tax-withholdings';
import PageLoader, {
    PageLoaderVariant,
} from '@deps/components/page-loader/page-loader';
import { FormDataContext } from '@deps/contexts/OtpWithdrawalFormContext';
import { DocumentData } from '@deps/models/case/document';
import { ChannelType } from '@deps/models/case/enums';
import { TaskStatus } from '@deps/models/case/task-instance';
import {
    FormSignature,
    FormTaxWithholding,
} from '@deps/models/case/withdrawal/case';
import { updateTask } from '@deps/queries/api/v2/task';
import { ReactComponent as ChevronLeftIcon } from '@deps/styles/elements/icons/icons_outlined/chevron-left.svg';

import { getDocumentSource, sswEditFormValidator } from '../ssw-edit-helpers';
import {
    signaturesConfig,
    taxWithholdingUpdateFormData,
} from './withholding-update.helpers';
import Failed from '../Failed';
import Success from '../Success';

const WithholdingUpdateForm = ({ document }: { document: DocumentData }) => {
    const { t } = useTranslation(undefined, {
        keyPrefix: 'caseWithdrawal.request.withholdingUpdate',
    });
    const {
        initialForm,
        formSignature,
        setFormErrors,
        formTaxWithholding,
        ownerStateOfResidence,
        formComment,
    } = useContext(FormDataContext);
    const [formSubmitted, setFormSubmitted] = useState({
        success: false,
        failed: false,
    });
    const [isLoading, setIsLoading] = useState(false);
    const source = getDocumentSource(initialForm?.data?.documentNumber);

    const handleBackRoute = () => {
        setIsLoading(true);
        router.back();
    };

    const requestTaxWithholdingUpdate = async (
        formSignature: FormSignature,
        formTaxWithholding: FormTaxWithholding
    ) => {
        setIsLoading(true);
        const successfulCaseUpdate = await updateTask(
            initialForm.caseId,
            initialForm?.taskId,
            taxWithholdingUpdateFormData(
                TaskStatus.Completed,
                initialForm,
                formSignature,
                formTaxWithholding,
                document,
                formComment ?? { comment: null }
            )
        );
        if (successfulCaseUpdate) {
            setIsLoading(false);
            setFormSubmitted((pv) => ({ ...pv, success: true }));
        } else {
            setFormSubmitted((pv) => ({ ...pv, failed: true }));
        }
    };

    const handleFormAction = async (
        formSignature: FormSignature,
        formTaxWithholding: FormTaxWithholding
    ) => {
        if (source !== ChannelType.Phone) {
            const formErr = sswEditFormValidator(formSignature, t);
            if (Object.keys(formErr).length > 0) {
                setFormErrors(formErr);
                return;
            } else {
                setFormErrors({});
            }
        }
        requestTaxWithholdingUpdate(formSignature, formTaxWithholding);
    };

    return (
        <>
            {isLoading && (
                <div className="responsive-padding flex h-[300px] w-full grow">
                    <PageLoader variant={PageLoaderVariant.Center} />
                </div>
            )}
            {!formSubmitted.success && !isLoading && (
                <>
                    <NavElement
                        type={NavElementType.Link}
                        className="flex items-center my-4 no-underline relative "
                        size={NavElementSize.Small}
                        startIcon={<ChevronLeftIcon width={16} height={16} />}
                        onClick={handleBackRoute}
                    >
                        <div className="font-bold text-md hover:underline">
                            {t('back')}
                        </div>
                    </NavElement>
                    <TaxWithholdings
                        isFormStateReadOnly={false}
                        ownerStateOfResidence={ownerStateOfResidence}
                    />
                    <div>
                        {source !== ChannelType.Phone && formSignature && (
                            <SignatureValidations
                                isFormStateReadOnly={false}
                                config={signaturesConfig}
                            />
                        )}
                        <NoteSection />
                        <div className="flex flex-col p-4">
                            <div className="flex">
                                <Button
                                    className="mr-4"
                                    onClick={() =>
                                        handleFormAction(
                                            formSignature,
                                            formTaxWithholding
                                        )
                                    }
                                    size={ButtonSize.Small}
                                    variant={ButtonVariant.Default}
                                    disabled={isLoading}
                                    type={ButtonType.Primary}
                                >
                                    {t('submit')}
                                </Button>
                                <NavElement
                                    aria-label={t('cancel') as string}
                                    onClick={() => router.push('/create-case')}
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
            )}

            {formSubmitted.success && (
                <div className="my-auto">
                    <Success
                        successTitle={t('submitted')}
                        successMessage={t('successMessage')}
                        closeCallback={() => router.push('/create-case')}
                    />
                </div>
            )}
            {formSubmitted.failed && (
                <div className="my-auto">
                    <Failed
                        errorTitle={t('failed')}
                        errorMessage={t('errorMessage')}
                        closeCallback={() => router.push('/create-case')}
                    />
                </div>
            )}
        </>
    );
};

export default WithholdingUpdateForm;
