import { Policy } from '@zinnia/api-types/types/sor';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { useContext, useMemo, useState } from 'react';

import { Program } from '@deps/components/otp-withdrawal-form/rmd-method/program-item';
import { ParentPage } from '@deps/components/transaction-navigation-buttons/transaction-navigation-buttons';
import ApiErrorCard from '@deps/components/workflows/api-error-card/api-error-card';
import { Step } from '@deps/containers/progress-bar-steps/progress-bar-steps-item/progress-bar-steps-item';
import { FormDataContext } from '@deps/contexts/OtpWithdrawalFormContext';
import { DocumentData } from '@deps/models/case/document';
import { ChannelType } from '@deps/models/case/enums';
import { TaskStatus } from '@deps/models/case/task-instance';
import { FormSignature } from '@deps/models/case/withdrawal/case';
import { updateTask } from '@deps/queries/api/v2/task';

import Amount from './steps/amount';
import Start from './steps/start';
import Summary from './steps/summary';
import TabGroupContainer from './tab-group-container';
import {
    buildSSWFormData,
    getDocumentSource,
    sswEditFormValidator,
    SswUpdateType,
    UpdatedProgram,
} from '../ssw-edit-helpers';
import Signature from './steps/signature';

type SswUpdateContainerProps = {
    policy: Policy;
    document: DocumentData;
    programs: Program[];
    programType: string;
};

const SswUpdate = ({
    policy,
    document,
    programs,
    programType,
}: SswUpdateContainerProps) => {
    const { t } = useTranslation(undefined, { keyPrefix: 'sswUpdate' });
    const router = useRouter();
    const [updateProgram, setUpdateProgram] = useState<UpdatedProgram>({});
    const { initialForm, setFormErrors } = useContext(FormDataContext);
    const [isLoading, setIsLoading] = useState(false);
    const [isFormSubmitted, setIsFormSubmitted] = useState(false);
    const [submitError, setSubmitError] = useState(false);
    const [timer] = useState(performance.now());
    const source = getDocumentSource(document.documentNumber);

    let oldProgram: Program[] = [];

    if (updateProgram) {
        oldProgram = programs.filter(
            (item) => item.allocationId === updateProgram.allocationId
        );
    }

    const handleFormAction = async (
        item: Program,
        operationType: SswUpdateType,
        formSign: FormSignature
    ) => {
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
        let res;
        if (operationType === SswUpdateType.PROGRAM_TERMINATE) {
            res = await updateTask(
                initialForm.caseId,
                initialForm?.taskId,
                buildSSWFormData(
                    TaskStatus.Completed,
                    initialForm,
                    formSign,
                    item,
                    updateProgram,
                    document,
                    operationType
                ),
                timer
            );
        }
        if (operationType === SswUpdateType.PROGRAM_UPDATE) {
            res = await updateTask(
                initialForm.caseId,
                initialForm?.taskId,
                buildSSWFormData(
                    TaskStatus.Completed,
                    initialForm,
                    formSign,
                    item,
                    updateProgram,
                    document,
                    operationType
                ),
                timer
            );
        }

        if (res && res?.status === 'COMPLETED') {
            setIsLoading(false);
            setIsFormSubmitted(true);
        } else {
            setSubmitError(true);
            setIsLoading(false);
        }
    };

    const steps = useMemo(
        () => [
            {
                component: (
                    <Start parentPage={ParentPage.CreateCase} policy={policy} />
                ),
                screenReaderLabel: t('tabs.start.tabTitle'),
                index: 0,
                text: t('tabs.start.tabTitle'),
                isVisible: () => true,
            },
            {
                component: (
                    <Amount
                        updateProgram={updateProgram}
                        onProgramUpdate={setUpdateProgram}
                        isReadOnly={false}
                    />
                ),
                screenReaderLabel: t('tabs.amount.tabTitle'),
                index: 1,
                text: t('tabs.amount.tabTitle'),
                isVisible: () => true,
            },

            {
                component: <Signature />,
                screenReaderLabel: t('signTabTitle'),
                isVisible: () => source !== ChannelType.Phone,
                text: t('signTabTitle'),
            },
            {
                component: (
                    <Summary
                        currentProgram={oldProgram?.[0]}
                        updatedProgram={updateProgram}
                        onContinue={handleFormAction}
                    />
                ),
                screenReaderLabel: t('tabs.summary.tabTitle'),
                index: 3,
                text: t('tabs.summary.tabTitle'),
                isVisible: () => true,
            },
            {
                component: <>{<div></div>}</>,
                screenReaderLabel: t('tabs.confirm.tabTitle'),
                index: 4,
                text: t('tabs.confirm.tabTitle'),
                isVisible: () => true,
            },
        ],
        [t, updateProgram]
    );

    const filteredSteps: Step[] = useMemo(
        () =>
            steps
                .filter((item) => item.isVisible?.())
                .map((item, index: number) => ({ ...item, index })),
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

    return (
        <TabGroupContainer
            steps={filteredSteps}
            policy={policy}
            document={document}
            programType={programType as SswUpdateType}
            programs={programs}
            onSswUpdate={handleFormAction}
            setSelectedProgram={setUpdateProgram}
            isFormSubmitted={isFormSubmitted}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
        />
    );
};

export default SswUpdate;
