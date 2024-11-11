import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { useContext, useMemo, useState } from 'react';

import { Program } from '@deps/components/otp-withdrawal-form/rmd-method/program-item';
import PageLoader, { PageLoaderVariant } from '@deps/components/page-loader/page-loader';
import { ParentPage } from '@deps/components/transaction-navigation-buttons/transaction-navigation-buttons';
import ApiErrorCard from '@deps/components/workflows/api-error-card/api-error-card';
import { TranslationFiles } from '@deps/config/translations';
import { Step } from '@deps/containers/progress-bar-steps/progress-bar-steps-item/progress-bar-steps-item';
import { FormDataContext } from '@deps/contexts/OtpWithdrawalFormContext';
import { DocumentData } from '@deps/models/case/document';
import { ApiVersion, ChannelType } from '@deps/models/case/enums';
import { TaskApiVersionMapper } from '@deps/models/case/helpers';
import { TaskStatus } from '@deps/models/case/task-instance';
import { FormSignature } from '@deps/models/case/withdrawal/case';
import { Policy } from '@deps/models/policy/sor-policy';
import { putCaseTask } from '@deps/queries/api/v1/task';
import { updateTask } from '@deps/queries/api/v2/task';

import Amount from './steps/amount';
import Start from './steps/start';
import Summary from './steps/summary';
import TabGroupContainer from './tab-group-container';
import { buildSSWFormData, SswUpdateType } from '../ssw-edit-helper';
import Signature from './steps/signature';

type SswUpdateContainerProps = {
    policy: Policy;
    document: DocumentData;
    programs: Program[];
    programType: string;
};

const SswUpdate = ({ policy, document, programs, programType }: SswUpdateContainerProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON);
    const router = useRouter();
    const [updateProgram, setUpdateProgram] = useState<Program>(programs[0]);
    const { initialForm } = useContext(FormDataContext);
    const [isLoading, setIsLoading] = useState(false);
    const [isFormSubmitted, setIsFormSubmitted] = useState(false);
    const [formError, setFormError] = useState(false);
    const [timer] = useState(performance.now());

    const requestProgramUpdate = async (existingProg: Program, operationType: SswUpdateType, formSign: FormSignature) => {
        let successfulCaseUpdate;
        if (TaskApiVersionMapper[initialForm.taskType] === ApiVersion.v2) {
            successfulCaseUpdate = await updateTask(
                initialForm.caseId,
                initialForm?.taskId,
                buildSSWFormData(TaskStatus.Completed, initialForm, formSign, existingProg, updateProgram, document, operationType) as any,
                timer
            );
        } else {
            successfulCaseUpdate = await putCaseTask(
                initialForm.taskType,
                initialForm.taskId,
                buildSSWFormData(TaskStatus.Completed, initialForm, formSign, existingProg, updateProgram, document, operationType) as any
            );
        }
        return successfulCaseUpdate;
    };

    const handleFormAction = async (item: Program, operationType: SswUpdateType, formSign: FormSignature) => {
        setIsLoading(true);
        let confirmCancel;
        let res;
        if (operationType === SswUpdateType.PROGRAM_TERMINATE) {
            confirmCancel = window.confirm('Do you want to terminate program' as string);
            if (confirmCancel) {
                res = requestProgramUpdate(item, operationType, formSign);
            }
        }
        if (operationType === SswUpdateType.PROGRAM_UPDATE) {
            res = requestProgramUpdate(item, operationType, formSign);
        }
        if (res) {
            setIsLoading(false);
            setIsFormSubmitted(true);
        } else {
            setFormError(true);
        }
    };

    const steps = useMemo(
        () => [
            {
                ariaLabel: t('sswUpdate.tabs.start.tabTitle'),
                component: <Start parentPage={ParentPage.CreateCase} policy={policy} />,
                screenReaderLabel: t('sswUpdate.tabs.start.tabTitle'),
                index: 0,
                text: t('sswUpdate.tabs.start.tabTitle'),
                isVisible: () => true,
            },
            {
                ariaLabel: t('sswUpdate.tabs.amount.tabTitle'),
                component: <Amount updateProgram={updateProgram} onProgramUpdate={setUpdateProgram} isReadOnly={false} />,
                screenReaderLabel: t('sswUpdate.tabs.amount.tabTitle'),
                index: 1,
                text: t('sswUpdate.tabs.amount.tabTitle'),
                isVisible: () => true,
            },

            {
                ariaLabel: t('sswUpdate.tabs.signature.tabTitle'),
                component: <Signature />,
                screenReaderLabel: t('sswUpdate.tabs.signature.tabTitle'),
                isVisible: () => document?.source === ChannelType.Email,
                text: t('sswUpdate.tabs.signature.tabTitle'),
            },
            {
                ariaLabel: t('sswUpdate.tabs.summary.tabTitle'),
                component: <Summary currentProgram={programs[0]} updatedProgram={updateProgram} onContinue={handleFormAction} />,
                screenReaderLabel: t('sswUpdate.tabs.summary.tabTitle'),
                index: 3,
                text: t('sswUpdate.tabs.summary.tabTitle'),
                isVisible: () => true,
            },
            {
                ariaLabel: t('sswUpdate.tabs.confirm.tabTitle'),
                component: <>{<div></div>} </>,
                screenReaderLabel: t('sswUpdate.tabs.confirm.tabTitle'),
                index: 4,
                text: t('sswUpdate.tabs.confirm.tabTitle'),
                isVisible: () => true,
            },
        ],
        [t, updateProgram]
    );

    const filteredSteps: Step[] = useMemo(
        () => steps.filter((item: any) => item.isVisible?.()).map((item: any, index: number) => ({ ...item, index })),
        [steps]
    );

    if (formError) {
        return (
            <ApiErrorCard
                leaveRoute={'/create-case'}
                submit={{
                    action: () => {
                        router.reload();
                    },
                    text: 'tryAgain',
                }}
            />
        );
    }

    if (isLoading) {
        return (
            <div className="fixed left-0 top-0 z-10 flex h-screen w-screen justify-center bg-gray-800 opacity-80">
                <PageLoader variant={PageLoaderVariant.Center} />
            </div>
        );
    }

    return (
        <TabGroupContainer
            steps={filteredSteps}
            policy={policy}
            document={document}
            programType={programType}
            programs={programs}
            onSswUpdate={handleFormAction}
            isFormSubmitted={isFormSubmitted}
            setIsLoading={setIsLoading}
        />
    );
};

export default SswUpdate;
