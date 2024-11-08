import router from 'next/router';
import { useTranslation } from 'next-i18next';
import { useMemo, useState } from 'react';

import CardInfo from '@deps/components/card/card-info/card-info';
import GlobalValuesBar from '@deps/components/global-values/global-values-bar/global-values-bar';
import NavElement, { NavElementSize, NavElementType, NavElementVariant } from '@deps/components/nav-element/nav-element';
import { Program } from '@deps/components/otp-withdrawal-form/rmd-method/program-item';
import ProgressBarSteps from '@deps/containers/progress-bar-steps/progress-bar-steps';
import { Step } from '@deps/containers/progress-bar-steps/progress-bar-steps-item/progress-bar-steps-item';
import { WorkflowProvider, useWorkflow } from '@deps/contexts/WorkflowContainerContext';
import { policyDataToGlobalValues } from '@deps/helpers/global-values';
import { PolicyDetails } from '@deps/helpers/policy-sor/PolicyDetails';
import { PartyRole, Policy } from '@deps/models/policy/sor-policy';
import { ReactComponent as CircleCheckIcon } from '@deps/styles/elements/icons/circles/circle-checkmark.svg';
import { ReactComponent as ChevronLeftIcon } from '@deps/styles/elements/icons/icons_outlined/chevron-left.svg';

import SswOperations from './ssw-operations';
import { SswUpdateType } from '../ssw-edit-helper';

type TabGroupContainerProps = {
    steps: Step[];
    policy: Policy;
    programType: string;
    programs: Program[];
    onSswUpdate: (item: Program, type: SswUpdateType) => {};
    isFormSubmitted: boolean;
    setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
};
const TabGroupContent = ({ steps, policy, programType, programs, onSswUpdate, isFormSubmitted, setIsLoading }: TabGroupContainerProps) => {
    const { t } = useTranslation();
    const [isSswUpdateView, setSswUpdateView] = useState(false);
    const { currentStepIndex, setCurrentStepIndex } = useWorkflow();
    const globalValuesData = useMemo(() => policyDataToGlobalValues(new PolicyDetails(policy), t), [policy, t]);
    const { marketingName, planCode, policyNumber, productType, status, tooltip, variant } = globalValuesData;
    const handleClick = (step: Step) => {
        if (step.isDisabled || currentStepIndex === step.index) return;
        if (step.text === 'Confirm') setCurrentStepIndex(step.index);
    };
    const policyOwnerId = policy?.partyRoles?.find(pr => pr.partyRole === PartyRole.OWNER)?.partyId;
    const policyOwner = policy?.parties?.find(party => party.partyId === policyOwnerId);
    return (
        <div className="workflow-height-adjusted flex w-full max-w-[1130px] grow flex-col self-center">
            <div className="flex mt-4">
                <GlobalValuesBar
                    carrierId={policy?.carrierId}
                    marketingName={marketingName}
                    owner={policyOwner}
                    planCode={planCode}
                    policyNumber={policyNumber}
                    productType={productType}
                    status={status}
                    tooltip={tooltip}
                    variant={variant}
                />
            </div>
            {isSswUpdateView && (
                <ProgressBarSteps
                    classNames={`grid-cols-${steps.length}`}
                    currentStepIndex={Number(currentStepIndex)}
                    onClick={handleClick}
                    steps={steps}
                />
            )}
            <div className="my-2 flex w-full grow flex-col rounded bg-white shadow-elevation-light-04">
                {!isFormSubmitted && (
                    <NavElement
                        type={NavElementType.Link}
                        className="flex items-center my-4 mx-2 relative"
                        size={NavElementSize.Small}
                        variant={NavElementVariant.Secondary}
                        startIcon={<ChevronLeftIcon width={16} height={16} />}
                        onClick={() => {
                            setIsLoading(true);
                            router.back();
                        }}
                    >
                        <div className="font-bold text-md hover:underline">{t('sswUpdate.back')}</div>
                    </NavElement>
                )}
                {isSswUpdateView
                    ? steps[currentStepIndex].component
                    : !isFormSubmitted && (
                          <SswOperations
                              setSswUpdateView={setSswUpdateView}
                              programType={programType}
                              programs={programs}
                              onProgramUpdate={onSswUpdate}
                          />
                      )}
                {isFormSubmitted && (
                    <div className="flex justify-center items-center py-20">
                        <CardInfo
                            icon={<CircleCheckIcon className="text-semantic-success" height={50} width={50} />}
                            cta={{
                                action: () => {
                                    router.push('/create-case');
                                },
                                text: t('sswUpdate.close'),
                            }}
                            subtitle={t('sswUpdate.success')}
                            title={t('sswUpdate.submitted')}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

const TabGroupContainer = ({
    steps,
    policy,
    programType,
    programs,
    onSswUpdate,
    isFormSubmitted,
    setIsLoading,
}: TabGroupContainerProps) => {
    return (
        <WorkflowProvider>
            <TabGroupContent
                steps={steps}
                policy={policy}
                programType={programType}
                programs={programs}
                onSswUpdate={onSswUpdate}
                isFormSubmitted={isFormSubmitted}
                setIsLoading={setIsLoading}
            />
        </WorkflowProvider>
    );
};

export default TabGroupContainer;
