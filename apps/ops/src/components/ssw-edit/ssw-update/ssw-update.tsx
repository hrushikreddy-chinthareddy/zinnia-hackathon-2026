import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { useContext, useMemo, useState } from 'react';

import { Program } from '@deps/components/otp-withdrawal-form/rmd-method/program-item';
import PageLoader, { PageLoaderVariant } from '@deps/components/page-loader/page-loader';
import { ParentPage } from '@deps/components/transaction-navigation-buttons/transaction-navigation-buttons';
import ApiErrorCard from '@deps/components/workflows/api-error-card/api-error-card';
import { Step } from '@deps/containers/progress-bar-steps/progress-bar-steps-item/progress-bar-steps-item';
import { FormDataContext } from '@deps/contexts/OtpWithdrawalFormContext';
import { DocumentData } from '@deps/models/case/document';
import { ChannelType } from '@deps/models/case/enums';
import { TaskStatus } from '@deps/models/case/task-instance';
import { FormSignature } from '@deps/models/case/withdrawal/case';
import { Policy } from '@deps/models/policy/sor-policy';
import { updateTask } from '@deps/queries/api/v2/task';

import Amount from './steps/amount';
import Start from './steps/start';
import Summary from './steps/summary';
import TabGroupContainer from './tab-group-container';
import { buildSSWFormData, getDocumentSource, sswEditFormValidator, SswUpdateType } from '../ssw-edit-helper';
import Signature from './steps/signature';

type SswUpdateContainerProps = {
    policy: Policy;
    document: DocumentData;
    programs: Program[];
    programType: string;
};

const SswUpdate = ({ policy, document, programs, programType }: SswUpdateContainerProps) => {
    const { t } = useTranslation(undefined, { keyPrefix: 'sswUpdate' });
    const router = useRouter();
    const [updateProgram, setUpdateProgram] = useState<Program>(programs[0]);
    const { initialForm, setFormErrors } = useContext(FormDataContext);
    const [isLoading, setIsLoading] = useState(false);
    const [isFormSubmitted, setIsFormSubmitted] = useState(false);
    const [submitError, setSubmitError] = useState(false);
    const [timer] = useState(performance.now());
    const source = getDocumentSource(document.documentNumber);

    const requestProgramUpdate = async (existingProg: Program, operationType: SswUpdateType, formSign: FormSignature) => {
        const successfulCaseUpdate = await updateTask(
            initialForm.caseId,
            initialForm?.taskId,
            buildSSWFormData(TaskStatus.Completed, initialForm, formSign, existingProg, updateProgram, document, operationType),
            timer
        );
        return successfulCaseUpdate;
    };

    const handleFormAction = async (item: Program, operationType: SswUpdateType, formSign: FormSignature) => {
        if (source !== ChannelType.Phone) {
            const formErr = sswEditFormValidator(formSign, t);
            if (Object.keys(formErr).length > 0) {
                setFormErrors(formErr);
                return;
            } else {
                setFormErrors({});
            }
        }

        setIsLoading(true);
        let res: any;
        if (operationType === SswUpdateType.PROGRAM_TERMINATE) {
            res = requestProgramUpdate(item, operationType, formSign);
        }
        if (operationType === SswUpdateType.PROGRAM_UPDATE) {
            res = requestProgramUpdate(item, operationType, formSign);
        }
        if (res?.status === 200) {
            setIsFormSubmitted(true);
            setIsLoading(false);
        } else {
            setSubmitError(true);
            setIsLoading(false);
        }
    };

    const steps = useMemo(
        () => [
            {
                ariaLabel: t('tabs.start.tabTitle'),
                component: <Start parentPage={ParentPage.CreateCase} policy={policy} />,
                screenReaderLabel: t('tabs.start.tabTitle'),
                index: 0,
                text: t('tabs.start.tabTitle'),
                isVisible: () => true,
            },
            {
                ariaLabel: t('tabs.amount.tabTitle'),
                component: <Amount updateProgram={updateProgram} onProgramUpdate={setUpdateProgram} isReadOnly={false} />,
                screenReaderLabel: t('tabs.amount.tabTitle'),
                index: 1,
                text: t('tabs.amount.tabTitle'),
                isVisible: () => true,
            },

            {
                ariaLabel: t('signTabTitle'),
                component: <Signature />,
                screenReaderLabel: t('signTabTitle'),
                isVisible: () => document?.source !== ChannelType.Phone,
                text: t('signTabTitle'),
            },
            {
                ariaLabel: t('tabs.summary.tabTitle'),
                component: <Summary currentProgram={programs[0]} updatedProgram={updateProgram} onContinue={handleFormAction} />,
                screenReaderLabel: t('tabs.summary.tabTitle'),
                index: 3,
                text: t('tabs.summary.tabTitle'),
                isVisible: () => true,
            },
            {
                ariaLabel: t('tabs.confirm.tabTitle'),
                component: <>{isLoading ? <PageLoader variant={PageLoaderVariant.Center} /> : <div></div>}</>,
                screenReaderLabel: t('tabs.confirm.tabTitle'),
                index: 4,
                text: t('tabs.confirm.tabTitle'),
                isVisible: () => true,
            },
        ],
        [t, updateProgram]
    );

    const filteredSteps: Step[] = useMemo(
        () => steps.filter(item => item.isVisible?.()).map((item, index: number) => ({ ...item, index })),
        [steps]
    );

    if (submitError) {
        return (
            <ApiErrorCard
                leaveRoute={'/create-case'}
                submit={{
                    action: () => {
                        router.reload();
                    },
                    text: t('tryAgain'),
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
            programType={programType as SswUpdateType}
            programs={programs}
            onSswUpdate={handleFormAction}
            isFormSubmitted={isFormSubmitted}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
        />
    );
};

export default SswUpdate;
