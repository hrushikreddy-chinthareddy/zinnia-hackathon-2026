import { Link, Table, TableBody, TableCell, TableHeader, TableHeaderCell, TableRow } from '@zinnia/bloom/components';
import Image from 'next/image';
import { useTranslation } from 'react-i18next';

import ChipStatus from '@deps/components/chip-status/chip-status';
import Tooltip, { PopoverPlacement } from '@deps/components/tooltip/tooltip';
import Typography, { TypographyVariant } from '@deps/components/typography/typography';
import { TranslationFiles } from '@deps/config/translations';
import { getStatusDetails } from '@deps/containers/case-redesign-sub-page';
import { calculateDaysAgo } from '@deps/helpers/case-management';
import { getAgents, getPolicyOwners } from '@deps/helpers/parties';
import { formatDateDescriptionList, formatSSN, toTitleCase } from '@deps/helpers/string.helper';
import { Case } from '@deps/models/case/case';
import { CaseDetailsTabValues, DEFAULT_ERROR_STRING } from '@deps/types/constants';
import { SearchViewQuery } from '@deps/types/search';
import { getCarrierLogoByClientId } from '@deps/utils/carriers';

import styles from './case-result-table.module.css';
import { CaseDetailField } from '../card/case-search-card/case-search-card';
import Highlighter from '../highlighter/highlighter';
import { PiiProps } from '../pii/pii';
import { PiiWrapper } from '../pii/PiiWrapper';
import PlusOthers from '../plus-others/plus-others';
import PopoverOnTruncate from '../popover-on-truncate/popover-on-truncate';

interface PartyWithOthersProps extends PiiProps {
    text?: string | null;
    highlights?: string[] | null;
    entities: { name: string; ssn: string }[];
}

const PartyWithOthers = ({ text, entities, highlights }: PartyWithOthersProps) => {
    const textWithHighlights = !!text && highlights && highlights.length ? <Highlighter text={text} highlights={highlights} /> : text;

    const textToRender = text ? (
        <PopoverOnTruncate title={text}>
            <span className="line-clamp-1 break-all font-secondary text-md">{textWithHighlights}</span>
        </PopoverOnTruncate>
    ) : (
        textWithHighlights
    );

    return (
        <div className="flex">
            <Typography variant={TypographyVariant.BodySm}>
                <PiiWrapper>{textToRender || DEFAULT_ERROR_STRING}</PiiWrapper>
            </Typography>
            <PlusOthers entities={entities} />
        </div>
    );
};

interface CaseResultTableProps {
    cases: Case[];
    searchValues?: SearchViewQuery;
}

export const CaseResultTable = ({ cases, searchValues }: CaseResultTableProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON);
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHeaderCell>Case/ID</TableHeaderCell>
                    <TableHeaderCell>Case Status</TableHeaderCell>
                    <TableHeaderCell>Owner/SSN</TableHeaderCell>
                    <TableHeaderCell>Policy</TableHeaderCell>
                    <TableHeaderCell>Agent/SSN</TableHeaderCell>
                    {/* to do - add onClick handleSort method */}
                    <TableHeaderCell sortable>Created</TableHeaderCell>
                </TableRow>
            </TableHeader>
            <TableBody>
                {cases.map(singleCase => {
                    const policyOwners = singleCase.parties ? getPolicyOwners(singleCase.parties) : [];
                    const entities = policyOwners.slice(1).map(owner => ({ name: toTitleCase(owner.fullName), ssn: formatSSN(owner.ssn) }));
                    // to do - can i use full name here instead of this maddness?
                    const ownerName = policyOwners.length
                        ? (policyOwners?.[0]?.firstName || '') + ' ' + (policyOwners?.[0]?.lastName || '')
                        : null;
                    const ssn = policyOwners.length ? policyOwners[0].ssn : undefined;

                    const ownerComponentProps = {
                        text: toTitleCase(ownerName?.trim()),
                        highlights: [searchValues?.ownerFirstName, searchValues?.ownerLastName].filter(Boolean) as string[],
                        entities,
                        truncate: true,
                    };

                    const agents = getAgents(singleCase?.parties || []);
                    const agentSsn = agents.length ? agents[0].ssn : undefined;
                    const otherAgents = agents.slice(1).map(owner => ({ name: toTitleCase(owner.fullName), ssn: formatSSN(owner.ssn) }));
                    const agentComponentProps = {
                        text: toTitleCase(agents?.[0]?.fullName),
                        // to do - are highlights needed for agents and are these the right values?
                        highlights: [searchValues?.ownerFirstName, searchValues?.ownerLastName].filter(Boolean) as string[],
                        entities: otherAgents,
                        truncate: true,
                    };

                    const imageSrc = getCarrierLogoByClientId(singleCase.carrier);

                    const daysAgo = calculateDaysAgo(new Date(singleCase.createdAt));
                    const statusTooltip = getStatusDetails({
                        status: singleCase.caseStatus,
                        processSubType: singleCase.processSubType?.toLowerCase(),
                        process: singleCase.process,
                        createdAt: singleCase.createdAt,
                        updatedAt: singleCase.updatedAt,
                        exceptions: singleCase.exceptions,
                        t,
                        daysAgo,
                    }).statusTooltip;

                    const viewCaseText = t('caseManagementDashboard.case.viewCase', {
                        caseNumber: String(singleCase.policyNumber).split('').join(' '),
                    });

                    return (
                        <TableRow key={`case-search-card-${singleCase.id}`} className={styles.row}>
                            <TableCell>
                                <div className="flex flex-col">
                                    <Typography variant={TypographyVariant.BodySm} className="block">
                                        {singleCase.processSubType ? toTitleCase(singleCase.processSubType) : singleCase.process}
                                    </Typography>
                                    <Typography variant={TypographyVariant.BodySm} className={styles.detail}>
                                        {singleCase.id}
                                    </Typography>
                                </div>
                            </TableCell>
                            <TableCell>
                                <Tooltip triggerClassName="md:mt-2" placement={PopoverPlacement.TopRight} body={statusTooltip}>
                                    <ChipStatus status={singleCase.caseStatus} data-testid="chip-status" classNames="whitespace-nowrap" />
                                </Tooltip>
                            </TableCell>
                            <TableCell>
                                <div className="flex flex-col">
                                    {policyOwners.length > 1 ? (
                                        <PartyWithOthers {...ownerComponentProps} />
                                    ) : (
                                        <CaseDetailField pii={true} {...ownerComponentProps} />
                                    )}
                                    <CaseDetailField
                                        pii={true}
                                        text={formatSSN(ssn)}
                                        className={styles.detail}
                                        highlights={searchValues?.ssn ? [searchValues?.ssn] : null}
                                    />
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center gap-2">
                                    <Tooltip placement={PopoverPlacement.TopRight} body={singleCase.carrier} isTabbable={false}>
                                        <div className="flex h-6 w-6 items-center justify-center rounded border-2 border-gray-100">
                                            <Image
                                                src={imageSrc}
                                                alt={`${singleCase.carrier} icon`}
                                                width={24}
                                                height={24}
                                                role="presentation"
                                                aria-hidden="true"
                                            />
                                        </div>
                                    </Tooltip>
                                    <CaseDetailField
                                        pii={true}
                                        text={singleCase.policyNumber}
                                        highlights={searchValues?.policyNumber ? [searchValues?.policyNumber] : null}
                                    />
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="flex flex-col">
                                    {agents.length > 1 ? (
                                        <PartyWithOthers {...agentComponentProps} />
                                    ) : (
                                        <CaseDetailField pii={true} {...agentComponentProps} />
                                    )}
                                    <CaseDetailField pii={true} text={formatSSN(agentSsn)} className={styles.detail} />
                                </div>
                            </TableCell>
                            {/* to do - change this to be the "hours ago" if it's today */}
                            <TableCell>{formatDateDescriptionList(new Date(singleCase.createdAt || ''))}</TableCell>
                            <Link
                                className={styles.caseLink}
                                href={`/cases/${singleCase.id}/${CaseDetailsTabValues.progress}`}
                                aria-label={viewCaseText}
                                text={viewCaseText}
                            />
                        </TableRow>
                    );
                })}
            </TableBody>
        </Table>
    );
};
