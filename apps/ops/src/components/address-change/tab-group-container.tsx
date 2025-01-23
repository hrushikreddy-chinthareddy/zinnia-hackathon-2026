import { useTranslation } from 'next-i18next';
import { useMemo } from 'react';

import ProgressBarSteps from '@deps/containers/progress-bar-steps/progress-bar-steps';
import { Step } from '@deps/containers/progress-bar-steps/progress-bar-steps-item/progress-bar-steps-item';
import { DiaryNotesProvider } from '@deps/contexts/DiaryNotesContext';
import { useSideSheetContext } from '@deps/contexts/SideSheetContext';
import { WorkflowProvider, useWorkflow } from '@deps/contexts/WorkflowContainerContext';
import { policyDataToGlobalValues } from '@deps/helpers/global-values';
import { PolicyDetails } from '@deps/helpers/policy-sor/PolicyDetails';
import { useDiaryNotes } from '@deps/hooks/useDiaryNotes';
import { PartyRole, Policy } from '@deps/models/policy/sor-policy';
import { ReactComponent as AnnotationIcon } from '@deps/styles/elements/icons/icons_outlined/annotation.svg';

import GlobalValuesBar from '../global-values/global-values-bar/global-values-bar';
import NavElement, { NavElementSize, NavElementType } from '../nav-element/nav-element';
import { DiaryNotesContent } from '../side-sheet/diary-notes/diary-notes-content';
import Typography, { TypographyVariant } from '../typography/typography';

type TabGroupContainerProps = {
    steps: Step[];
    policy: Policy;
    showJointOwner?: boolean;
};
const TabGroupContent = ({ steps, policy, showJointOwner = false }: TabGroupContainerProps) => {
    const { t } = useTranslation();
    const { currentStepIndex, setCurrentStepIndex } = useWorkflow();
    // BPB - TODO: move this up
    const globalValuesData = useMemo(() => policyDataToGlobalValues(new PolicyDetails(policy), t), [policy, t]);

    const { marketingName, planCode, policyNumber, productType, status, tooltip, variant } = globalValuesData;
    const handleClick = (step: Step) => {
        if (step.isDisabled || currentStepIndex === step.index) return;

        setCurrentStepIndex(step.index);
    };

    const policyOwnerId = policy?.partyRoles?.find(pr => pr.partyRole === PartyRole.OWNER)?.partyId;
    const policyOwner = policy?.parties?.find(party => party.partyId === policyOwnerId);
    const jointOwnerId = policy?.partyRoles?.find(pr => pr.partyRole === PartyRole.JOINTOWNER)?.partyId;
    const jointOwner = policy?.parties?.find(party => party.partyId === jointOwnerId);

    const sideSheet = useSideSheetContext();
    const { diaryNotes } = useDiaryNotes(policy.policyNumber as string, policy.carrierId as string, 0, 10);
    const openSideSheet = () => {
        const content = <DiaryNotesContent notesData={{ diaryNotes: diaryNotes } as any} />;
        sideSheet.changeSideSheetContent(t('site.navLinks.diaryNotes.text'), content);
        sideSheet.handleOpen(true);
    };

    return (
        <div className="workflow-height-adjusted flex w-full max-w-[1130px] grow flex-col self-center">
            <GlobalValuesBar
                carrierId={policy?.carrierId}
                marketingName={marketingName}
                owner={policyOwner}
                jointOwner={jointOwner}
                planCode={planCode}
                policyNumber={policyNumber}
                productType={productType}
                status={status}
                tooltip={tooltip}
                variant={variant}
                showJointOwner={showJointOwner}
            />

            <div className="my-2 flex flex-row items-center justify-end space-x-3">
                <Typography variant={TypographyVariant.FieldLabel} className="hidden md:block">
                    {t('site.navLinks.relatedActivity.text')}
                </Typography>
                <NavElement
                    type={NavElementType.Button}
                    size={NavElementSize.Small}
                    className="flex items-center"
                    startIcon={<AnnotationIcon width={16} height={16} />}
                    onClick={() => openSideSheet()}
                    onKeyDown={e => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            openSideSheet();
                        }
                    }}
                >
                    {t('site.navLinks.diaryNotes.text')}
                </NavElement>
            </div>

            <ProgressBarSteps
                classNames={`grid-cols-${steps.length}`}
                currentStepIndex={Number(currentStepIndex)}
                onClick={handleClick}
                steps={steps}
            />
            <div className="my-2 flex w-full grow flex-col rounded bg-white shadow-elevation-light-04">
                {steps[currentStepIndex].component}
            </div>
        </div>
    );
};

const TabGroupContainer = ({ steps, policy }: TabGroupContainerProps) => {
    return (
        <DiaryNotesProvider caseDetails={policy as any}>
            <WorkflowProvider>
                <TabGroupContent steps={steps} policy={policy} showJointOwner={true} />
            </WorkflowProvider>
        </DiaryNotesProvider>
    );
};

export default TabGroupContainer;
