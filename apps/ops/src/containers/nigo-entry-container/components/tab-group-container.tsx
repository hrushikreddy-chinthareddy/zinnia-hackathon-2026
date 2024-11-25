import { Icon, IconType } from '@zinnia/bloom/components';
import dayjs from 'dayjs';
import { useTranslation } from 'next-i18next';
import { useMemo } from 'react';

import GlobalValuesBar from '@deps/components/global-values/global-values-bar/global-values-bar';
import NavElement, { NavElementType, NavElementSize } from '@deps/components/nav-element/nav-element';
import { DiaryNotesContent } from '@deps/components/side-sheet/diary-notes/diary-notes-content';
import { ViewDetailsContent } from '@deps/components/side-sheet/view-details/view-details-content';
import Typography, { TypographyVariant } from '@deps/components/typography/typography';
import { TranslationFiles } from '@deps/config/translations';
import ProgressBarSteps from '@deps/containers/progress-bar-steps/progress-bar-steps';
import { Step } from '@deps/containers/progress-bar-steps/progress-bar-steps-item/progress-bar-steps-item';
import { DiaryNotesProvider } from '@deps/contexts/DiaryNotesContext';
import { useSideSheetContext } from '@deps/contexts/SideSheetContext';
import { WorkflowProvider, useWorkflow } from '@deps/contexts/WorkflowContainerContext';
import { policyDataToGlobalValues } from '@deps/helpers/global-values';
import { PolicyDetails } from '@deps/helpers/policy-sor/PolicyDetails';
import { useDiaryNotes } from '@deps/hooks/useDiaryNotes';
import { DocumentData } from '@deps/models/case/document';
import { PartyRole, Policy } from '@deps/models/policy/sor-policy';
import { ReactComponent as AnnotationIcon } from '@deps/styles/elements/icons/icons_outlined/annotation.svg';
import { ReactComponent as DocumentIcon } from '@deps/styles/elements/icons/icons_outlined/document-text-2.svg';
import { DEFAULT_EXTENDED_DATE_FORMAT } from '@deps/types/constants';

import DocumentPortalPanel from './side-panel/document-portal-panel';

type TabGroupContainerProps = {
    steps: Step[];
    policy: Policy;
    showJointOwner?: boolean;
    documentNumber?: string;
    docType: string;
    documentData: DocumentData;
};
const TabGroupContent = ({
    steps,
    policy,
    showJointOwner = false,
    documentNumber = '',
    docType = '',
    documentData,
}: TabGroupContainerProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON);
    const { currentStepIndex, setCurrentStepIndex } = useWorkflow();
    const sideSheet = useSideSheetContext();

    const globalValuesData = useMemo(() => policyDataToGlobalValues(new PolicyDetails(policy), t), [policy, t]);

    const { marketingName, planCode, policyNumber, productType, status, tooltip, variant } = globalValuesData;
    const handleClick = (step: Step) => {
        if (step.isDisabled || currentStepIndex === step.index) return;

        setCurrentStepIndex(step.index);
    };
    const openSideSheet = () => {
        const content = <DocumentPortalPanel policy={policy} documentNumber={documentNumber} docType={docType} />;
        sideSheet.changeSideSheetContent(t('nigoEntry.documentPanel.documents'), content);
        sideSheet.handleOpen(true);
    };

    const policyOwnerId = policy?.partyRoles?.find(pr => pr.partyRole === PartyRole.OWNER)?.partyId;
    const policyOwner = policy?.parties?.find(party => party.partyId === policyOwnerId);
    const jointOwnerId = policy?.partyRoles?.find(pr => pr.partyRole === PartyRole.JOINTOWNER)?.partyId;
    const jointOwner = policy?.parties?.find(party => party.partyId === jointOwnerId);

    const showDocumentPanel = () => {
        openSideSheet();
    };

    const { diaryNotes } = useDiaryNotes(policy.policyNumber as string, policy.carrierId as string, 0, 10);
    const opeDiaryNotes = () => {
        const content = <DiaryNotesContent notesData={{ diaryNotes: diaryNotes } as any} />;
        sideSheet.changeSideSheetContent(t('site.navLinks.diaryNotes.text'), content);
        sideSheet.handleOpen(true);
    };

    const formattedIssueDate = dayjs(policy.policyDates?.issueDate).format(DEFAULT_EXTENDED_DATE_FORMAT);
    const openViewDetails = () => {
        const content = (
            <ViewDetailsContent
                qualificationType={policy.qualificationType ?? ''}
                contractValue={documentData.contractValue ?? ''}
                policyDate={formattedIssueDate}
                issueState={policy.issueState ?? ''}
            />
        );
        sideSheet.changeSideSheetContent(t('site.navLinks.viewDetails.text'), content);
        sideSheet.handleOpen(true);
    };

    return (
        <div className="workflow-height-adjusted flex w-full max-w-[1130px] grow flex-col self-center">
            <GlobalValuesBar
                carrierId={policy.carrierId}
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
                showDocument={true}
                documentNumber={documentNumber}
                showLink={false}
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
                    onClick={() => opeDiaryNotes()}
                    onKeyDown={e => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            openSideSheet();
                        }
                    }}
                >
                    {t('site.navLinks.diaryNotes.text')}
                </NavElement>
                <NavElement
                    type={NavElementType.Button}
                    size={NavElementSize.Small}
                    className="flex items-center"
                    startIcon={<Icon type={IconType.CIRCLE_INFO} width={16} height={16} />}
                    onClick={() => openViewDetails()}
                    onKeyDown={e => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            openSideSheet();
                        }
                    }}
                >
                    {t('site.navLinks.viewDetails.text')}
                </NavElement>
                <NavElement
                    type={NavElementType.Button}
                    size={NavElementSize.Small}
                    className="flex items-center"
                    startIcon={<DocumentIcon height={16} width={16} />}
                    onClick={showDocumentPanel}
                    onKeyDown={e => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            openSideSheet();
                        }
                    }}
                >
                    {t('site.navLinks.caseDetails.text')}
                </NavElement>
                <NavElement
                    type={NavElementType.Button}
                    size={NavElementSize.Small}
                    className="flex items-center capitalize"
                    startIcon={<Icon type={IconType.MENU_VERTICAL} width={16} height={16} />}
                    onClick={() => openViewDetails()}
                    onKeyDown={e => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            openSideSheet();
                        }
                    }}
                >
                    {t('nigoEntry.documentPanel.documentTitle')}
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

const TabGroupContainer = ({ steps, policy, documentNumber, docType, documentData }: TabGroupContainerProps) => {
    return (
        <DiaryNotesProvider caseDetails={policy as any}>
            <WorkflowProvider>
                <TabGroupContent
                    steps={steps}
                    policy={policy}
                    showJointOwner={true}
                    documentNumber={documentNumber}
                    docType={docType}
                    documentData={documentData}
                />
            </WorkflowProvider>
        </DiaryNotesProvider>
    );
};

export default TabGroupContainer;
