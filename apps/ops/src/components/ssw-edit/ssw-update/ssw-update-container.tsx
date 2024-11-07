import router from 'next/router';
import { useTranslation } from 'next-i18next';
import { useContext, useMemo, useState } from 'react';

import CardInfo from '@deps/components/card/card-info/card-info';
import GlobalValuesBar from '@deps/components/global-values/global-values-bar/global-values-bar';
import { Program } from '@deps/components/otp-withdrawal-form/rmd-method/program-item';
import PageLoader, { PageLoaderVariant } from '@deps/components/page-loader/page-loader';
import { ParentPage } from '@deps/components/transaction-navigation-buttons/transaction-navigation-buttons';
import ApiErrorCard from '@deps/components/workflows/api-error-card/api-error-card';
import { TranslationFiles } from '@deps/config/translations';
import ProgressBarSteps from '@deps/containers/progress-bar-steps/progress-bar-steps';
import { Step } from '@deps/containers/progress-bar-steps/progress-bar-steps-item/progress-bar-steps-item';
import { FormDataContext } from '@deps/contexts/OtpWithdrawalFormContext';
import { useWorkflow } from '@deps/contexts/WorkflowContainerContext';
import { policyDataToGlobalValues } from '@deps/helpers/global-values';
import { PolicyDetails } from '@deps/helpers/policy-sor/PolicyDetails';
import { DocumentData } from '@deps/models/case/document';
import { ApiVersion } from '@deps/models/case/enums';
import { TaskApiVersionMapper } from '@deps/models/case/helpers';
import { TaskStatus } from '@deps/models/case/task-instance';
import { PartyRole, Policy } from '@deps/models/policy/sor-policy';
import { putCaseTask } from '@deps/queries/api/v1/task';
import { updateTask } from '@deps/queries/api/v2/task';
import { ReactComponent as CircleCheckIcon } from '@deps/styles/elements/icons/circles/circle-checkmark.svg';

import EditProgram from './edit-program';
import { buildSSWFormData, SswUpdateType } from '../ssw-edit-helper';
import Amount from './steps/amount';
import ChannelStep from './steps/channel';
import Start from './steps/start';
import Summary from './steps/summary';

type SswUpdateContainerProps = {
    policy: Policy;
    document: DocumentData;
    program: Program[];
    programType: string;
};

const SswUpdateContainer = ({ policy, document, program, programType }: SswUpdateContainerProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON);
    const { currentStepIndex, setCurrentStepIndex, goToNext } = useWorkflow();
    const { formSource, initialForm, formSignature } = useContext(FormDataContext);
    const [showSSWEditTabs, setShowSSWEditTabs] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [formSubmitted, setFormSubmitted] = useState(false);
    const [formError, setFormError] = useState(false);
    const [updateProgram, setUpdateProgram] = useState<Program[]>([]);

    const [timer] = useState(performance.now());

    const globalValuesData = useMemo(() => policyDataToGlobalValues(new PolicyDetails(policy), t), [policy, t]);

    const { marketingName, planCode, policyNumber, productType, status, tooltip, variant } = globalValuesData;

    const policyOwnerId = policy?.partyRoles?.find(pr => pr.partyRole === PartyRole.OWNER)?.partyId;

    const policyOwner = policy?.parties?.find(party => party.partyId === policyOwnerId);

    const requestProgramUpdate = async (existingProg: Program, operationType: SswUpdateType) => {
        let successfulCaseUpdate;
        if (TaskApiVersionMapper[initialForm.taskType] === ApiVersion.v2) {
            setIsLoading(true);
            successfulCaseUpdate = await updateTask(
                initialForm.caseId,
                initialForm?.taskId,
                buildSSWFormData(
                    TaskStatus.Completed,
                    initialForm,
                    formSource,
                    formSignature,
                    existingProg,
                    updateProgram,
                    document,
                    operationType
                ) as any,
                timer
            );
        } else {
            successfulCaseUpdate = await putCaseTask(
                initialForm.taskType,
                initialForm.taskId,
                buildSSWFormData(
                    TaskStatus.Completed,
                    initialForm,
                    formSource,
                    formSignature,
                    existingProg,
                    updateProgram,
                    document,
                    operationType
                ) as any
            );
        }
        return successfulCaseUpdate;
    };

    const handleFormAction = async (item: Program, operationType: SswUpdateType) => {
        let confirmCancel;
        let res;
        if (operationType === SswUpdateType.PROGRAM_TERMINATE) {
            confirmCancel = window.confirm('Do you want to terminate program' as string);
            if (confirmCancel) {
                res = requestProgramUpdate(item, operationType);
            }
        }
        if (operationType === SswUpdateType.PROGRAM_UPDATE) {
            res = requestProgramUpdate(item, operationType);
        }

        if (res) {
            setIsLoading(false);
            setFormSubmitted(true);
            goToNext();
        } else {
            setFormError(true);
        }
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
                    text: 'tryAgain',
                }}
            />
        );
    }

    const renderEmptyProgram = program?.length === 0 && (
        <div className="flex justify-center items-center py-20">
            <CardInfo
                cta={{
                    action: () => {
                        router.back();
                    },
                    text: 'back',
                }}
                title={'No Existing Program Found'}
            />
        </div>
    );
    const steps = useMemo(
        () => [
            {
                ariaLabel: t('sswUpdate.tabs.start.tabTitle'),
                component: <Start parentPage={ParentPage.CreateCase} policy={policy} />,
                screenReaderLabel: t('sswUpdate.tabs.start.tabTitle'),
                index: 0,
                text: t('sswUpdate.tabs.start.tabTitle'),
            },
            {
                ariaLabel: t('sswUpdate.tabs.amount.tabTitle'),
                component: <Amount updateProgram={program[0]} onProgramUpdate={setUpdateProgram} isReadOnly={false} />,
                screenReaderLabel: t('sswUpdate.tabs.amount.tabTitle'),
                index: 1,
                text: t('sswUpdate.tabs.amount.tabTitle'),
            },
            {
                ariaLabel: t('sswUpdate.tabs.channel.channel'),
                component: <ChannelStep />,
                screenReaderLabel: t('sswUpdate.tabs.channel.channel'),
                index: 2,
                text: t('sswUpdate.tabs.channel.channel'),
            },
            {
                ariaLabel: t('sswUpdate.tabs.summary.tabTitle'),
                component: <Summary currentProgram={program[0]} updatedProgram={updateProgram} onContinue={handleFormAction} />,
                screenReaderLabel: t('sswUpdate.tabs.summary.tabTitle'),
                index: 3,
                text: t('sswUpdate.tabs.summary.tabTitle'),
            },
            {
                ariaLabel: t('sswUpdate.tabs.confirm.tabTitle'),
                component: <>{<div></div>} </>,
                screenReaderLabel: t('sswUpdate.tabs.confirm.tabTitle'),
                index: 4,
                text: t('sswUpdate.tabs.confirm.tabTitle'),
            },
        ],
        [t, updateProgram]
    );

    const handleClick = (step: Step) => {
        if (step.isDisabled || currentStepIndex === step.index) return;
        if (currentStepIndex !== 4) setCurrentStepIndex(step.index);
    };

    return (
        <div className="workflow-height-adjusted flex w-full max-w-[1130px] grow flex-col self-center bg-gray-100 py-4 my-2">
            <div className="flex">
                <GlobalValuesBar
                    carrierId={initialForm.carrier}
                    marketingName={marketingName}
                    owner={policyOwner}
                    planCode={planCode}
                    policyNumber={policyNumber}
                    productType={productType}
                    status={status}
                    tooltip={tooltip}
                    variant={variant}
                    showJointOwner={false}
                    showDocument={false}
                    showLink={false}
                />
            </div>
            {showSSWEditTabs && (
                <ProgressBarSteps
                    classNames={`grid-cols-${steps.length}`}
                    currentStepIndex={Number(currentStepIndex)}
                    onClick={handleClick}
                    steps={steps}
                />
            )}
            <div className="my-2 flex w-full grow flex-col rounded bg-white shadow-elevation-light-04 p-6">
                {renderEmptyProgram}
                {!formSubmitted && !showSSWEditTabs && (
                    <>
                        <label className="font-primary text-lg font-bold my-3">{t(`sswUpdate.${programType}`)}</label>

                        {program?.map((item: Program, index: number) => (
                            <EditProgram key={index} program={item} onTerminate={handleFormAction} onEdit={setShowSSWEditTabs} />
                        ))}
                    </>
                )}
                {showSSWEditTabs && steps[currentStepIndex].component}

                {formSubmitted && (
                    <div className="flex justify-center items-center py-20">
                        <CardInfo
                            icon={<CircleCheckIcon className="text-semantic-success" height={50} width={50} />}
                            cta={{
                                action: () => {
                                    router.push('/create-case');
                                },
                                text: t('sswUpdate.close'),
                            }}
                            subtitle={' SSW Request has been submitted.'}
                            title={t('sswUpdate.submitted')}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default SswUpdateContainer;
