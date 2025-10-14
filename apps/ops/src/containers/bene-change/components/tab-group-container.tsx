import { PartyRole, Policy } from '@zinnia/api-types/types/sor';
import { useTranslation } from 'next-i18next';
import { useMemo } from 'react';

import GlobalValuesBar from '@deps/components/global-values/global-values-bar/global-values-bar';
import NavElement, {
    NavElementSize,
    NavElementType,
} from '@deps/components/nav-element/nav-element';
import { DiaryNotesContent } from '@deps/components/side-sheet/diary-notes/diary-notes-content';
import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import ProgressBarSteps from '@deps/containers/progress-bar-steps/progress-bar-steps';
import { Step } from '@deps/containers/progress-bar-steps/progress-bar-steps-item/progress-bar-steps-item';
import { DiaryNotesProvider } from '@deps/contexts/DiaryNotesContext';
import { useSideSheetContext } from '@deps/contexts/SideSheetContext';
import {
    WorkflowProvider,
    useWorkflow,
} from '@deps/contexts/WorkflowContainerContext';
import { policyDataToGlobalValues } from '@deps/helpers/global-values';
import { PolicyDetails } from '@deps/helpers/policy-sor/PolicyDetails';
import { useDiaryNotes } from '@deps/hooks/useDiaryNotes';
import { ReactComponent as AnnotationIcon } from '@deps/styles/elements/icons/icons_outlined/annotation.svg';

type TabGroupContainerProps = {
    steps: Step[];
    policy: Policy;
    showJointOwner?: boolean;
    hideGlobalValueBar?: boolean;
    showDiaryNotes?: boolean;
    showLink?: boolean;
};

type ConditionalDiaryNotesProviderProps = {
    condition: boolean;
    caseDetails: {
        policyNum?: string;
        clientId?: string;
        policyNumber?: string;
        carrierId?: string;
    };
    children: React.ReactNode;
};

const TabGroupContent = ({
    steps,
    policy,
    hideGlobalValueBar,
    showJointOwner = false,
    showDiaryNotes = false,
    showLink = false,
}: TabGroupContainerProps) => {
    const { t } = useTranslation();
    const { currentStepIndex, setCurrentStepIndex } = useWorkflow();
    const globalValuesData = useMemo(
        () => policyDataToGlobalValues(new PolicyDetails(policy), t),
        [policy, t]
    );
    const {
        marketingName,
        planCode,
        policyNumber,
        productType,
        status,
        tooltip,
        variant,
    } = globalValuesData;
    const handleClick = (step: Step) => {
        if (step.isDisabled || currentStepIndex === step.index) return;

        setCurrentStepIndex(step.index);
    };

    const policyOwnerId = policy?.partyRoles?.find(
        (pr) => pr.partyRole === PartyRole.OWNER
    )?.partyId;
    const policyOwner = policy?.parties?.find(
        (party) => party.partyId === policyOwnerId
    );
    const jointOwnerId = policy?.partyRoles?.find(
        (pr) => pr.partyRole === PartyRole.JOINTOWNER
    )?.partyId;
    const jointOwner = policy?.parties?.find(
        (party) => party.partyId === jointOwnerId
    );

    const sideSheet = useSideSheetContext();
    const { diaryNotes } = useDiaryNotes(
        policy.policyNumber as string,
        policy.carrierId as string,
        0,
        10,
        showDiaryNotes
    );
    const openSideSheet = () => {
        const content = (
            <DiaryNotesContent notesData={{ diaryNotes: diaryNotes } as any} />
        );
        sideSheet.changeSideSheetContent(
            t('site.navLinks.diaryNotes.text'),
            content
        );
        sideSheet.handleOpen(true);
    };

    return (
        <>
            {showDiaryNotes && (
                <div className="my-2 flex flex-row items-center justify-end space-x-3">
                    <Typography
                        variant={TypographyVariant.FieldLabel}
                        className="hidden md:block"
                    >
                        {t('site.navLinks.relatedActivity.text')}
                    </Typography>
                    <NavElement
                        type={NavElementType.Button}
                        size={NavElementSize.Small}
                        className="flex items-center"
                        startIcon={<AnnotationIcon width={16} height={16} />}
                        onClick={() => openSideSheet()}
                        onKeyDown={(e: {
                            key: string;
                            preventDefault: () => void;
                        }) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                openSideSheet();
                            }
                        }}
                    >
                        {t('site.navLinks.diaryNotes.text')}
                    </NavElement>
                </div>
            )}
            <div>
                {hideGlobalValueBar ? null : (
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
                        showLink={showLink}
                    />
                )}

                <ProgressBarSteps
                    currentStepIndex={Number(currentStepIndex)}
                    onClick={handleClick}
                    steps={steps}
                />
                <div className="my-2 flex w-full grow flex-col rounded bg-white shadow-elevation-light-04">
                    {steps[currentStepIndex].component}
                </div>
            </div>
        </>
    );
};

const ConditionalDiaryNotesProvider = ({
    condition,
    caseDetails,
    children,
}: ConditionalDiaryNotesProviderProps) => {
    return condition ? (
        <DiaryNotesProvider caseDetails={caseDetails} isLC={true}>
            {children}
        </DiaryNotesProvider>
    ) : (
        <>{children}</>
    );
};

const TabGroupContainer = ({
    steps,
    policy,
    hideGlobalValueBar,
    showDiaryNotes = false,
}: TabGroupContainerProps) => {
    return (
        <ConditionalDiaryNotesProvider
            condition={showDiaryNotes}
            caseDetails={policy as any}
        >
            <WorkflowProvider>
                <TabGroupContent
                    hideGlobalValueBar={hideGlobalValueBar}
                    steps={steps}
                    policy={policy}
                    showJointOwner={true}
                    showDiaryNotes={showDiaryNotes}
                    showLink={false}
                />
            </WorkflowProvider>
        </ConditionalDiaryNotesProvider>
    );
};

export default TabGroupContainer;
