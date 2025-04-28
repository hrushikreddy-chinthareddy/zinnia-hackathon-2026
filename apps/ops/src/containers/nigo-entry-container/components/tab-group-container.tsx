import { useTranslation } from 'next-i18next';
import { useEffect, useMemo, useState, useCallback } from 'react';

import { Error, ErrorMessagePart } from '@deps/components/error/Error';
import GlobalValuesBar from '@deps/components/global-values/global-values-bar/global-values-bar';
import NavElement, { NavElementType, NavElementSize } from '@deps/components/nav-element/nav-element';
import CaseDetailsContent from '@deps/components/side-sheet/case-details/case-details-content';
import { DiaryNotesContent } from '@deps/components/side-sheet/diary-notes/diary-notes-content';
import Typography, { TypographyVariant } from '@deps/components/typography/typography';
import { TranslationFiles } from '@deps/config/translations';
import ProgressBarSteps from '@deps/containers/progress-bar-steps/progress-bar-steps';
import { Step } from '@deps/containers/progress-bar-steps/progress-bar-steps-item/progress-bar-steps-item';
import { CaseTableData } from '@deps/contexts/CaseManagementFilters';
import { DiaryNotesProvider } from '@deps/contexts/DiaryNotesContext';
import { useOptimizely } from '@deps/contexts/OptimizelyContext';
import { useSideSheetContext } from '@deps/contexts/SideSheetContext';
import { WorkflowProvider, useWorkflow } from '@deps/contexts/WorkflowContainerContext';
import { policyDataToGlobalValues } from '@deps/helpers/global-values';
import { PolicyDetails } from '@deps/helpers/policy-sor/PolicyDetails';
import { useDiaryNotes } from '@deps/hooks/useDiaryNotes';
import { DocumentData } from '@deps/models/case/document';
import { PartyRole, Policy } from '@deps/models/policy/sor-policy';
import { getCases } from '@deps/queries/api/cases';
import { CaseSearchQuery } from '@deps/queries/cases';
import { ReactComponent as AnnotationIcon } from '@deps/styles/elements/icons/icons_outlined/annotation.svg';
import { ReactComponent as DocumentIcon } from '@deps/styles/elements/icons/icons_outlined/document-text-2.svg';
import { ReactComponent as MenuIcon } from '@deps/styles/elements/icons/navigation/menu.svg';

import DocumentPortalPanel from './side-panel/document-portal-panel';

type TabGroupContainerProps = {
    steps: Step[];
    policy?: Policy;
    showJointOwner?: boolean;
    documentNumber?: string;
    docType: string;
    documentData: DocumentData;
    policyNumber: string;
    clientCode: string;
};

const TabGroupContent = ({
    steps,
    policy,
    showJointOwner = false,
    documentNumber = '',
    docType = '',
    documentData,
    policyNumber,
    clientCode
}: TabGroupContainerProps) => {
    const { featureFlags } = useOptimizely();
    const [caseTableData, setCaseTableData] = useState<CaseTableData>({ cases: [], total: 0, loading: true, error: false });
    const [offset, setOffset] = useState(0);
    const [error, setError] = useState<ErrorMessagePart[] | null>(null);
    const { t } = useTranslation(TranslationFiles.COMMON);
    const limit = 25;

    const fetchCases = useCallback(async () => {
        try {
            const searchValueObject = { policyNumber: policyNumber };

            const updatedRequest: CaseSearchQuery = {
                ...searchValueObject,
                limit: limit,
                offset: offset,
                sortDirection: 'desc',
                sortBy: 'createdAt',
            };

            const response = await getCases(updatedRequest, featureFlags);

            if (!response) {
                console.log('Error fetching cases: No data in response');
            }

            if ('total' in response) {
                setCaseTableData({
                    cases: response.data,
                    total: response.total,
                    loading: false,
                    error: false,
                });

                const currentDate = new Date();
                const ninetyDaysAgo = new Date();
                ninetyDaysAgo.setDate(currentDate.getDate() - 90);
                const caseNumber = response.data.filter(item => new Date(item.updatedAt) >= ninetyDaysAgo).length;

                setError([
                    { text: t('sideSheet.caseDetailsContent.thereAre') + ' ' },
                    { text: `${caseNumber} ${t('sideSheet.caseDetailsContent.otherOpenCases')} `, color: 'rgb(var(--color-secondary))' },
                    { text: t('sideSheet.caseDetailsContent.relatedToThisPolicy') },
                ]);
            } else {
                console.log('Error fetching cases: No data in response');
            }
        } catch (error) {
            console.error(`Error fetching cases: No data in response: ${error}`);
            setCaseTableData({
                cases: [],
                total: 0,
                loading: false,
                error: true,
            });
        }
    }, [policyNumber, limit, offset, t]);

    useEffect(() => {
        fetchCases();
    }, [fetchCases]);

    const { currentStepIndex, setCurrentStepIndex } = useWorkflow();
    const sideSheet = useSideSheetContext();
    const globalValuesData = useMemo(() => policyDataToGlobalValues(new PolicyDetails(policy), t), [policy, t]);
    const { marketingName, planCode, productType, status, tooltip, variant } = globalValuesData;
    const handleClick = (step: Step) => {
        if (step.isDisabled || currentStepIndex === step.index) return;

        setCurrentStepIndex(step.index);
    };

    const openSideSheet = () => {
        const content = <DocumentPortalPanel policyNumber={policyNumber} clientCode={clientCode} documentNumber={documentNumber} docType={docType} />;
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

    const { diaryNotes } = useDiaryNotes(policyNumber, clientCode, 0, 10);
    const opeDiaryNotes = () => {
        const content = <DiaryNotesContent notesData={{ diaryNotes: diaryNotes } as any} />;
        sideSheet.changeSideSheetContent(t('site.navLinks.diaryNotes.text'), content);
        sideSheet.handleOpen(true);
    };

    const openCaseDetails = () => {
        const content = (
            <CaseDetailsContent
                policy={policy}
                documentData={documentData}
                offset={offset}
                setOffset={setOffset}
                limit={limit}
                caseTableData={caseTableData}
                setError={setError}
                policyNumber={policyNumber}
                clientCode={clientCode}
            />
        );
        sideSheet.changeSideSheetContent(t('site.navLinks.caseDetails.text'), content);
        sideSheet.handleOpen(true);
    };

    return (
        <div className="workflow-height-adjusted flex w-full max-w-[1130px] grow flex-col self-center">

            <GlobalValuesBar
                carrierId={clientCode}
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
            {error && <Error errorMessage={error} className="mb-4" />}
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
                    startIcon={<DocumentIcon height={16} width={16} />}
                    onClick={showDocumentPanel}
                    onKeyDown={e => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            openSideSheet();
                        }
                    }}
                >
                    {t('nigoEntry.documentPanel.documentTitle')}
                </NavElement>
                <NavElement
                    type={NavElementType.Button}
                    size={NavElementSize.Small}
                    className="flex items-center capitalize"
                    startIcon={<MenuIcon height={10} width={10} className="text-secondary" />}
                    onClick={() => openCaseDetails()}
                    onKeyDown={e => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            openSideSheet();
                        }
                    }}
                >
                    {t('site.navLinks.caseDetails.text')}
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

const TabGroupContainer = ({ steps, policy, documentNumber, docType, documentData, policyNumber, clientCode }: TabGroupContainerProps) => {
    const caseDetails = {policyNumber, carrierId: clientCode }

    return (
        <DiaryNotesProvider caseDetails={caseDetails as any}>
            <WorkflowProvider>
                <TabGroupContent
                    steps={steps}
                    policy={policy}
                    showJointOwner={true}
                    documentNumber={documentNumber}
                    docType={docType}
                    documentData={documentData}
                    policyNumber={policyNumber}
                    clientCode={clientCode}
                />
            </WorkflowProvider>
        </DiaryNotesProvider>
    );
};

export default TabGroupContainer;
