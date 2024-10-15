import { getAccessToken, withPageAuthRequired } from '@auth0/nextjs-auth0';
import Form from '@rjsf/core';
import { RJSFSchema, UiSchema } from '@rjsf/utils';
import { Radio } from '@zinnia/bloom/components';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { createRef, useState } from 'react';

import DynamicForm from '@deps/components/dynamic-form/dynamic-form';
import NoNavLayout from '@deps/components/no-nav-layout';
import { PageHead } from '@deps/components/page-title';
import TransactionCta from '@deps/components/transaction-cta/transaction-cta';
import WorkflowCard from '@deps/components/workflows/workflow-card/workflow-card';
import { TranslationFiles } from '@deps/config/translations';
import ProgressBarSteps from '@deps/containers/progress-bar-steps/progress-bar-steps';
import { Step } from '@deps/containers/progress-bar-steps/progress-bar-steps-item/progress-bar-steps-item';
import { useWorkflow, WorkflowProvider } from '@deps/contexts/WorkflowContainerContext';
import { serverSidePropsLogout } from '@deps/helpers/logout.helpers';
import { doesUserHavePagePermissions, getUserData } from '@deps/helpers/query-data.helper';
import { DEFAULT_LOCALE } from '@deps/helpers/routing.helper';
import { UserPermission } from '@deps/models/user-profile';
import { getCaseSuitabilityTaskSSR, getFormSchemaSSR } from '@deps/queries/api/cases';
import { logWarn, parseErrorInformation } from '@deps/utils/server-logging';
import nextI18nextConfig from 'next-i18next.config';

type TaskPageProps = {
    caseId: string;
    taskId: string;
    formSchema: RJSFSchema;
    uiSchema: UiSchema;
    taskData: any;
};

type TaskMap = {
    [key: string]: {
        schema: RJSFSchema;
        uiSchema: UiSchema;
        tabTitle: string;
    };
};

const TaskWorkflow = ({ caseId, taskId, formSchema, uiSchema, taskData }: TaskPageProps) => {
    const taskMap: TaskMap = {
        '1': {
            schema: formSchema,
            uiSchema: uiSchema,
            tabTitle: 'Suitability',
        },

        '3': {
            schema: formSchema,
            uiSchema: uiSchema,
            tabTitle: 'Suitability #2',
        },
    };

    const [task] = useState(taskMap[taskId ?? 1]);
    const { currentStepIndex, setCurrentStepIndex, goToNext } = useWorkflow();

    const [formData, setFormData] = useState(taskData);
    const formRef = createRef<Form>();

    const handleContinue = async () => {
        console.log('handleContinue clicked');
        // this is shitty
        if (currentStepIndex === 2 && formRef.current) {
            formRef.current.submit();

            // const uiSchema = formRef.current.state.uiSchema;
            // const schema = formRef.current.state.schema;

            const { errors } = formRef.current.validate(formRef.current.state.formData);
            console.log('Form Errors:', errors);
            if (errors && errors.length === 0) {
                console.log('form data ->', formRef.current.state.formData);
                goToNext();
            }
        } else {
            goToNext();
        }
    };

    const mainCta = {
        text: 'Continue',
        onClick: handleContinue,
    };

    const secondaryCta = {
        text: 'Cancel',
        href: `/cases/${caseId}`,
    };

    const handleProgressBarClick = (step: Step) => {
        console.log('handleProgressBarClick clicked', step);
        if (step.isDisabled || currentStepIndex === step.index) return;

        setCurrentStepIndex(step.index);
    };

    // Task Form Callbacks
    const handleSubmitCallback = ({ formData, errors, schema }: any) => {
        console.log('Submitted data:', formData);
        console.log('Errors:', errors);
        console.log('Schema:', schema);
    };

    // Handle form data change
    const handleChangeCallback = ({ formData, errors, schema, uiSchema }: any) => {
        console.log('Changed data:', formData);
        console.log('Errors:', errors);
        console.log('Schema:', schema);
        console.log('uiSchema:', uiSchema);
        setFormData(formData);
    };

    const steps: Step[] = [
        {
            ariaLabel: 'Input Suitability Data',
            component: (
                <WorkflowCard
                    title={'Input Suitability Data'}
                    footerContent={<TransactionCta className="mt-4" mainCta={mainCta} secondaryCta={secondaryCta} stopLoading={true} />}
                >
                    <div className="flex flex-col gap-2">Is the suitability form complete?</div>
                    <Radio
                        defaultValue="option1"
                        groupLabel=""
                        id="radio-group-default"
                        options={[
                            {
                                ariaLabel: 'All sections are complete and ready for data entry',
                                label: 'All sections are complete and ready for data entry.',
                                value: 'Complete',
                            },
                            {
                                ariaLabel: 'All sections are not complete',
                                label: 'All sections are not complete.',
                                value: 'NotComplete',
                            },
                        ]}
                    />
                </WorkflowCard>
            ),
            text: 'Start',
            index: 0,
            isCompleted: true,
            screenReaderLabel: 'Input Suitability Data',
        },
        {
            ariaLabel: 'Suitability form',
            component: (
                <WorkflowCard
                    title={task.tabTitle}
                    footerContent={<TransactionCta className="mt-4" mainCta={mainCta} secondaryCta={secondaryCta} stopLoading={true} />}
                >
                    <div className="flex flex-col gap-2">
                        <DynamicForm
                            formData={formData}
                            formSchema={task.schema}
                            uiSchema={task.uiSchema}
                            handleChangeCallback={handleChangeCallback}
                            handleSubmitCallback={handleSubmitCallback}
                            ref={formRef}
                        ></DynamicForm>
                    </div>
                </WorkflowCard>
            ),
            text: task.tabTitle,
            index: 1,
            screenReaderLabel: 'Suitability form',
        },
        {
            ariaLabel: 'Summary',
            component: (
                <WorkflowCard
                    title={'Summary'}
                    footerContent={<TransactionCta className="mt-4" mainCta={mainCta} secondaryCta={secondaryCta} stopLoading={true} />}
                >
                    <div className="flex flex-col gap-2">
                        <DynamicForm
                            formData={formData}
                            formSchema={task.schema}
                            uiSchema={task.uiSchema}
                            handleChangeCallback={handleChangeCallback}
                            handleSubmitCallback={handleSubmitCallback}
                            ref={formRef}
                            disabled={true}
                        ></DynamicForm>
                    </div>
                </WorkflowCard>
            ),
            text: 'Summary',
            index: 2,
            screenReaderLabel: 'Summary',
        },
        {
            ariaLabel: 'Confirm',
            text: 'Confirm',
            index: 3,
            screenReaderLabel: 'Confirm',
        },
    ];

    return (
        <div className="workflow-height-adjusted flex w-full max-w-[1130px] grow flex-col self-center">
            <ProgressBarSteps
                classNames={`pb-2 grid-cols-${steps.length}`}
                currentStepIndex={currentStepIndex}
                onClick={handleProgressBarClick}
                steps={steps}
            />
            <div className="flex w-full grow flex-col rounded bg-white shadow-elevation-light-04">{steps[currentStepIndex].component}</div>
        </div>
    );
};
export const TaskPage: React.FC<TaskPageProps> = ({ caseId, taskId, formSchema, uiSchema, taskData }) => {
    const [isLoading] = useState(false);
    // const { currentStepIndex, setCurrentStepIndex } = useWorkflow();

    // this is not great but it's better than the current flash
    return isLoading ? (
        <></>
    ) : (
        <div>
            <PageHead titleKey="caseOverview" />
            <NoNavLayout fullHeight={true}>
                <WorkflowProvider>
                    <TaskWorkflow
                        caseId={caseId ?? ''}
                        taskId={taskId ?? ''}
                        taskData={taskData ?? {}}
                        formSchema={formSchema}
                        uiSchema={uiSchema}
                    />
                </WorkflowProvider>
            </NoNavLayout>
        </div>
    );
};

export const getServerSideProps = withPageAuthRequired({
    getServerSideProps: async (context: any) => {
        const user = await getUserData(context);
        const { locale = DEFAULT_LOCALE, params, query, req, res } = context;

        let accessToken;
        try {
            accessToken = (await getAccessToken(req, res)).accessToken;
        } catch (e) {
            logWarn('cases/:id::Access token expired', {
                ...parseErrorInformation(e),
                file: 'cases/:id/index',
                function: 'getServerSideProps',
            });
            return serverSidePropsLogout();
        }

        const hasPermissionToReadCaseManagement = await doesUserHavePagePermissions(
            accessToken,
            user,
            UserPermission.AllowReadCaseManagement
        );
        if (!hasPermissionToReadCaseManagement) {
            return {
                redirect: {
                    destination: '/403',
                    permanent: false,
                },
            };
        }

        const translations = await serverSideTranslations(locale, [TranslationFiles.COMMON], nextI18nextConfig);

        const caseId = (params?.id as string) || '';
        const taskId = (query?.taskId as string) || '';
        const clientId = (query.clientId as string) || '';
        const taskType = (query.taskType as string) || '';

        const [schema, taskData] = await Promise.all([getFormSchemaSSR(clientId, taskType), getCaseSuitabilityTaskSSR(caseId, taskId)]);

        const { formSchema, uiSchema } = schema ?? {};

        return {
            props: {
                ...translations,
                caseId,
                taskId,
                formSchema,
                uiSchema,
                taskData,
            },
        };
    },
});

export default TaskPage;
