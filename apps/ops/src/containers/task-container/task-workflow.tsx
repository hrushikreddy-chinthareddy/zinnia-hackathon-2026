import Form from '@rjsf/core';
import { RJSFSchema, UiSchema } from '@rjsf/utils';
import { Radio } from '@zinnia/bloom/components';
import { createRef, useState } from 'react';

import DynamicForm from '@deps/components/dynamic-form/dynamic-form';
import TransactionCta from '@deps/components/transaction-cta/transaction-cta';
import WorkflowCard from '@deps/components/workflows/workflow-card/workflow-card';
import { useWorkflow } from '@deps/contexts/WorkflowContainerContext';
import { TaskType } from '@deps/models/case/task';

import ProgressBarSteps from '../progress-bar-steps/progress-bar-steps';
import { Step } from '../progress-bar-steps/progress-bar-steps-item/progress-bar-steps-item';

type TaskMap = {
    [key in TaskType]: {
        schema?: RJSFSchema;
        uiSchema?: UiSchema;
        tabTitle?: string;
    };
};

type TaskPageProps = {
    caseId: string;
    taskId: string;
    taskType: TaskType;
    formSchema: RJSFSchema;
    uiSchema: UiSchema;
    taskData: any;
};

export const TaskWorkflow = ({ caseId, taskType, formSchema, uiSchema, taskData }: TaskPageProps) => {
    const taskMap: TaskMap = {
        [TaskType.Suitability]: {
            schema: formSchema,
            uiSchema: uiSchema,
            tabTitle: 'Input Suitability Data',
        },
        [TaskType.Withdrawal]: {},
        [TaskType.OFT]: {},
        [TaskType.RMD]: {},
        [TaskType.SSW]: {},
        [TaskType.RENEWAL]: {},
        [TaskType.REG60]: {},
    };

    const [task] = useState(taskMap[taskType]);
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
                    title={task.tabTitle || ''}
                    subtitle={'Manually enter all suitability data. Note that canceling at any point would erase all.'}
                    footerContent={<TransactionCta className="mt-4" mainCta={mainCta} secondaryCta={secondaryCta} stopLoading={true} />}
                >
                    <div className="flex flex-col gap-2">
                        <DynamicForm
                            formData={formData}
                            formSchema={task.schema || {}}
                            uiSchema={task.uiSchema || {}}
                            handleChangeCallback={handleChangeCallback}
                            handleSubmitCallback={handleSubmitCallback}
                            ref={formRef}
                        ></DynamicForm>
                    </div>
                </WorkflowCard>
            ),
            text: task.tabTitle || '',
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
                            formSchema={task.schema || {}}
                            uiSchema={task.uiSchema || {}}
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
