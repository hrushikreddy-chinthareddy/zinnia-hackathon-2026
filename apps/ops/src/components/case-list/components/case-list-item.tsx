import { TFunction } from 'next-i18next';

import Accordion from '@deps/components/accordion/accordion';
import CaseSearchCard from '@deps/components/card/case-search-card/case-search-card';
import TaskListingContainer from '@deps/components/tasks-listing/tasks-listing-container';
import Section from '@deps/containers/section/section';
import { getCaseIdentifierValue } from '@deps/helpers/case-management';
import { Case, CaseIdentifier, CaseType } from '@deps/models/case/case';

type CaseListProps = {
    t: TFunction;
    index: number;
    caseData: Case;
    selectedCaseId: string | undefined;
    onCaseClick: (caseData: Case) => void;
    clientId: string;
    caseType: CaseType;
};

export const CaseListItem = ({
    t,
    caseData,
    selectedCaseId,
    onCaseClick,
    clientId,
    caseType,
    index,
}: CaseListProps) => (
    <Section key={caseData.id} testid={`case-list-item-${index}`}>
        <Accordion
            isOpen={caseData.id === selectedCaseId}
            onClick={() => onCaseClick(caseData)}
            renderHeaderComponent={
                <CaseSearchCard
                    id={caseData.id}
                    index={index}
                    caseStatus={caseData.caseStatus}
                    policyNumber={caseData.policyNumber}
                    createdAt={caseData.createdAt}
                    updatedAt={caseData.updatedAt}
                    carrier={caseData.carrier}
                    showLogo={false}
                    showCarrier={false}
                    showOwnerInfo={false}
                    isCustomStyle={false}
                    showCaseId={true}
                    documentNumber={getCaseIdentifierValue(
                        caseData.identifiers,
                        CaseIdentifier.DocumentNumber
                    )}
                />
            }
        >
            <TaskListingContainer
                t={t}
                caseData={caseData}
                clientId={clientId}
                caseType={caseType}
                documentNumber={getCaseIdentifierValue(
                    caseData.identifiers,
                    CaseIdentifier.DocumentNumber
                )}
            ></TaskListingContainer>
        </Accordion>
    </Section>
);
