import {
    Icon,
    IconType,
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableHeaderCell,
    TableRow,
    Tooltip,
    TooltipPlacement,
} from '@zinnia/bloom/components';
import dayjs from 'dayjs';
import advanced from 'dayjs/plugin/advancedFormat';
import timezone from 'dayjs/plugin/timezone';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';

import ChipStatus from '@deps/components/chip-status/chip-status';
import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import { usePermissionsContext } from '@deps/contexts/PermissionsContext';
import { segmentAnalyticsTrackEvent } from '@deps/helpers/analytics/segment-analytics';
import { getValidFullName } from '@deps/helpers/case-management';
import { getAgents, getPolicyOwners } from '@deps/helpers/parties';
import { formatSSN, toTitleCase } from '@deps/helpers/string.helpers';
import { getTimeAgoUnitValue } from '@deps/hooks/useStatusInfo';
import {
    Case,
    Processes,
    shouldShowEscalationBadge,
} from '@deps/models/case/case';
import { CaseDetailsTabValues } from '@deps/types/constants';
import { SearchViewQuery } from '@deps/types/search';
import {
    CaseClickedEvent,
    SegmentTrackedEventName,
} from '@deps/types/segment-analytics';
import {
    getCarrierLogoByClientId,
    getCarrierNameByClientId,
} from '@deps/utils/carriers';
import { formatTimestamp } from '@deps/utils/dates';
import { DEFAULT_ERROR_STRING } from '@deps/utils/strings';

import styles from './case-result-table.module.css';
import CaseDetailField from '../card/case-search-card/case-detail-field';
import { CaseStatusTooltip } from '../case-list/components/case-status-tooltip';
import Highlighter from '../highlighter/highlighter';
import { PiiProps } from '../pii/pii';
import { PiiWrapper } from '../pii/PiiWrapper';
import PlusOthers from '../plus-others/plus-others';
import PopoverOnTruncate from '../popover-on-truncate/popover-on-truncate';

dayjs.extend(timezone);
dayjs.extend(advanced);

interface PartyWithOthersProps extends PiiProps {
    text?: string | null;
    highlights?: string[] | null;
    entities: { name: string; ssn: string }[];
    isOwner?: boolean;
}

const PartyWithOthers = ({
    text,
    entities,
    highlights,
    isOwner,
}: PartyWithOthersProps) => {
    const { t } = useTranslation();
    const textWithHighlights =
        !!text && highlights && highlights.length ? (
            <Highlighter text={text} highlights={highlights} />
        ) : (
            text
        );

    const textToRender = text ? (
        <PopoverOnTruncate title={text} triggerClassName="!z-10">
            <span className="line-clamp-1 break-all font-secondary text-md relative">
                {textWithHighlights}
            </span>
        </PopoverOnTruncate>
    ) : (
        textWithHighlights
    );

    return (
        <div className="flex">
            <Typography variant={TypographyVariant.BodySm}>
                <PiiWrapper>{textToRender || DEFAULT_ERROR_STRING}</PiiWrapper>
            </Typography>
            <PlusOthers
                entities={entities}
                tooltipTitle={
                    isOwner ? t('tooltip.jointOwner') : t('tooltip.agent')
                }
            />
        </div>
    );
};

interface CaseTableRowProps {
    singleCase: Case;
    searchValues: SearchViewQuery | undefined;
}

const CaseTableRow = ({ singleCase, searchValues }: CaseTableRowProps) => {
    const { t } = useTranslation();
    const router = useRouter();
    const { sessionId, partyId } = usePermissionsContext();

    const policyOwners = singleCase.parties
        ? getPolicyOwners(singleCase.parties)
        : [];
    const entities = policyOwners.slice(1).map((owner) => ({
        name: toTitleCase(getValidFullName(owner)),
        ssn: formatSSN(owner.ssn),
    }));
    const ownerName = policyOwners.length
        ? getValidFullName(policyOwners?.[0])
        : null;
    const ssn = policyOwners.length ? policyOwners[0].ssn : undefined;

    const ownerComponentProps = {
        text: toTitleCase(ownerName?.trim()),
        highlights: [
            searchValues?.ownerFirstName,
            searchValues?.ownerLastName,
        ].filter(Boolean) as string[],
        entities,
        truncate: true,
    };

    const agents = getAgents(singleCase?.parties || []);
    const agentSsn = agents.length ? agents[0].ssn : undefined;
    const otherAgents = agents.slice(1).map((owner) => ({
        name: toTitleCase(getValidFullName(owner)),
        ssn: formatSSN(owner.ssn),
    }));
    const highlights = [
        searchValues?.agentFirstName,
        searchValues?.agentLastName,
    ].filter(Boolean) as string[];
    const agentComponentProps = {
        text: toTitleCase(getValidFullName(agents?.[0])),
        highlights,
        entities: otherAgents,
        truncate: true,
    };

    const imageSrc = getCarrierLogoByClientId(singleCase.carrier);
    const carrierName = getCarrierNameByClientId(singleCase.carrier);

    const viewCaseText = t('caseManagementDashboard.case.viewCaseNumber', {
        caseNumber: String(singleCase.id).split('').join(' '),
    });

    const getTimeText = () => {
        let text;
        const { unit, count } = getTimeAgoUnitValue(singleCase.createdAt) || {};
        if (unit === 'hour' || unit === 'minute') {
            const timeText = t('temporal.timeago', {
                formattedDate: '',
                count: count,
                unit: unit,
            }).trim();
            text = timeText;
        } else {
            text = dayjs(singleCase.createdAt).format('M/D/YYYY');
        }
        return text;
    };

    const loadCaseDetails = (href: string) => {
        segmentAnalyticsTrackEvent<CaseClickedEvent>(
            SegmentTrackedEventName.CaseClicked,
            {
                caseId: singleCase.id,
                authSessionId: sessionId,
                userId: partyId,
            }
        );

        router.push(href);
    };

    const renderAgentDetails = () => {
        if (singleCase.process === Processes.AgentOnboarding) {
            const {
                agentFirstName: onboardingAgentFirstName,
                agentLastName: onboardingAgentLastName,
                agentSSN: onboardingAgentSSN,
            } = singleCase?.additionalData || {};
            return (
                <>
                    <CaseDetailField
                        pii={true}
                        text={toTitleCase(
                            getValidFullName({
                                firstName: onboardingAgentFirstName,
                                lastName: onboardingAgentLastName,
                            }) || DEFAULT_ERROR_STRING
                        )}
                        highlights={highlights}
                        truncate={true}
                        triggerClassName="!z-10"
                        popoverClassName="!w-auto"
                    />
                    <CaseDetailField
                        pii={true}
                        text={formatSSN(onboardingAgentSSN)}
                        className={styles.detail}
                    />
                </>
            );
        }
        return (
            <>
                {agents.length > 1 ? (
                    <PartyWithOthers {...agentComponentProps} />
                ) : (
                    <CaseDetailField
                        pii={true}
                        {...agentComponentProps}
                        triggerClassName="!z-10"
                        popoverClassName="!w-auto"
                    />
                )}
                <CaseDetailField
                    pii={true}
                    text={formatSSN(agentSsn)}
                    className={styles.detail}
                />
            </>
        );
    };
    const showBadge = shouldShowEscalationBadge(
        singleCase.escalated ?? false,
        singleCase.caseStatus
    );

    return (
        <TableRow className={styles.row}>
            <TableCell className={styles.caseLinkContainer}>
                {/* This lives as a visibly hidden link instead of as a click handler on the table row for acccessibility concerns. Nested interactive elements are not allowed */}
                <Link
                    aria-label={`View case details for case number ${singleCase.id}`}
                    onClick={() =>
                        loadCaseDetails(
                            `/cases/${singleCase.id}/${CaseDetailsTabValues.progress}`
                        )
                    }
                    href={`/cases/${singleCase.id}/${CaseDetailsTabValues.progress}`}
                    className={styles.caseLink}
                >
                    {viewCaseText}
                </Link>
            </TableCell>
            <TableCell>
                <div className="flex flex-col">
                    <Typography
                        variant={TypographyVariant.BodySm}
                        className="block"
                    >
                        {singleCase.processSubType
                            ? toTitleCase(singleCase.processSubType)
                            : singleCase.process}
                    </Typography>
                    <CaseDetailField
                        text={singleCase.id}
                        className={styles.detail}
                        escalated={showBadge}
                        highlights={
                            searchValues?.caseId ? [searchValues.caseId] : null
                        }
                    />
                </div>
            </TableCell>
            <TableCell>
                <CaseStatusTooltip
                    singleCase={singleCase}
                    trigger={
                        <ChipStatus
                            status={singleCase.caseStatus}
                            data-testid="chip-status"
                            classNames="whitespace-nowrap"
                        />
                    }
                />
            </TableCell>
            <TableCell>
                <div className="flex flex-col">
                    {policyOwners.length > 1 ? (
                        <PartyWithOthers {...ownerComponentProps} isOwner />
                    ) : (
                        <CaseDetailField
                            pii={true}
                            {...ownerComponentProps}
                            triggerClassName="!z-10"
                            popoverClassName="!w-auto"
                        />
                    )}
                    <CaseDetailField
                        pii={true}
                        text={formatSSN(ssn)}
                        className={styles.detail}
                        highlights={
                            searchValues?.ssn ? [searchValues?.ssn] : null
                        }
                    />
                </div>
            </TableCell>
            <TableCell>
                <div className="flex items-center gap-2">
                    <Tooltip
                        placement={TooltipPlacement.TopRight}
                        tooltipClassName="!w-auto"
                        triggerClassName="!z-10"
                        trigger={
                            <div className="flex items-center justify-center rounded border-2 border-gray-100 bg-white h-6 w-6">
                                <Image
                                    src={imageSrc}
                                    alt={`${singleCase.carrier} icon`}
                                    role="presentation"
                                    height={14}
                                    width={14}
                                />
                                <span className="sr-only">
                                    {singleCase.carrier} icon
                                </span>
                            </div>
                        }
                    >
                        <div className="flex flex-col">
                            <span>{carrierName}</span>
                            {singleCase.productName && (
                                <span className="capitalize">
                                    {singleCase.productName.toLowerCase()}
                                </span>
                            )}
                        </div>
                    </Tooltip>
                    <CaseDetailField
                        pii={true}
                        text={singleCase.policyNumber}
                        highlights={
                            searchValues?.policyNumber
                                ? [searchValues?.policyNumber]
                                : null
                        }
                        aria-label={`Policy number ${String(
                            singleCase.policyNumber
                        )
                            .split('')
                            .join(' ')}`}
                    />
                </div>
            </TableCell>
            <TableCell>
                <div className="flex flex-col">{renderAgentDetails()}</div>
            </TableCell>
            <TableCell className="text-right whitespace-nowrap">
                <div className="flex justify-end">
                    <Tooltip
                        placement={TooltipPlacement.TopRight}
                        trigger={
                            <Typography
                                variant={TypographyVariant.BodySm}
                                className={styles.detail}
                                aria-label={`${getTimeText()}, Date`}
                            >
                                {getTimeText()}
                            </Typography>
                        }
                        tooltipClassName="!w-auto"
                        triggerClassName="!z-10"
                    >
                        {formatTimestamp(
                            singleCase.createdAt,
                            'dateTimeWithTZ'
                        )}
                    </Tooltip>
                </div>
            </TableCell>
        </TableRow>
    );
};

interface CaseResultTableProps {
    cases: Case[];
    searchValues?: SearchViewQuery;
    handleSort: (key: 'createdAt') => void;
    sortDirection: 'asc' | 'desc';
    sortBy: string | null;
    caseSearchLoading: boolean;
    loadingMessage: string;
    isFiltered?: boolean;
}

const NoResultsRow = ({
    loadingMessage,
    caseSearchLoading,
    isFiltered,
}: {
    searchValues: SearchViewQuery | undefined;
    loadingMessage: string;
    caseSearchLoading: boolean;
    isFiltered?: boolean;
}) => {
    const { t } = useTranslation();
    const noResultsMessage = isFiltered ? (
        <>
            <b>
                {t(
                    'caseManagementDashboard.search.empty.noResultsFilteredTitle'
                )}
            </b>
            <br />
            {t(
                'caseManagementDashboard.search.empty.noResultsFilteredParagraph'
            )}
        </>
    ) : (
        <>
            <b>
                {t(
                    'caseManagementDashboard.search.empty.noResultsUnfilteredTitle'
                )}
            </b>
            <br />
            {t(
                'caseManagementDashboard.search.empty.noResultsUnfilteredParagraph'
            )}
        </>
    );

    return (
        <TableRow>
            <TableCell colSpan={7} className="text-center">
                <Typography variant={TypographyVariant.BodySm} className="my-4">
                    {caseSearchLoading ? loadingMessage : noResultsMessage}
                </Typography>
            </TableCell>
        </TableRow>
    );
};
export const CaseResultTable = ({
    cases,
    searchValues,
    handleSort,
    sortDirection,
    sortBy,
    caseSearchLoading,
    loadingMessage,
    isFiltered,
}: CaseResultTableProps) => {
    const { t } = useTranslation();

    return (
        <Table
            className={styles.tableContainer}
            aria-describedby="cases-table-description"
            role="table"
        >
            <caption id="cases-table-description" className="sr-only">
                {t('allFields.tableCaptionsCasesTable') ?? ''}
            </caption>
            <TableHeader>
                <TableRow>
                    {/* This header cell is needed so the link can come first in the Table Row, without it the table body will shift right one column too far */}
                    <TableHeaderCell scope="col" className="sr-only">
                        {t('caseManagementDashboard.case.viewCaseDetails')}
                    </TableHeaderCell>
                    <TableHeaderCell scope="col">
                        <Typography variant={TypographyVariant.BodySmBold}>
                            {t('caseManagementDashboard.case.case/ID')}
                        </Typography>
                    </TableHeaderCell>
                    <TableHeaderCell scope="col">
                        <Typography variant={TypographyVariant.BodySmBold}>
                            {t('caseManagementDashboard.case.caseStatus')}
                        </Typography>
                    </TableHeaderCell>
                    <TableHeaderCell scope="col">
                        <Typography variant={TypographyVariant.BodySmBold}>
                            {t('caseManagementDashboard.case.ownerSsn')}
                        </Typography>
                    </TableHeaderCell>
                    <TableHeaderCell scope="col">
                        <Typography variant={TypographyVariant.BodySmBold}>
                            {t('caseManagementDashboard.case.policy')}
                        </Typography>
                    </TableHeaderCell>
                    <TableHeaderCell scope="col">
                        <Typography variant={TypographyVariant.BodySmBold}>
                            {t('caseManagementDashboard.case.agentSsn')}
                        </Typography>
                    </TableHeaderCell>

                    <TableHeaderCell
                        scope="col"
                        aria-sort={
                            sortBy === 'createdAt'
                                ? sortDirection === 'asc'
                                    ? 'ascending'
                                    : 'descending'
                                : 'none'
                        }
                        sortable
                        className={styles.tableHeader}
                        onClick={() => handleSort('createdAt')}
                    >
                        <Typography
                            variant={TypographyVariant.BodySmBold}
                            className="flex align-center gap-1 justify-end"
                        >
                            <span className="sr-only">
                                Sort by Created At{' '}
                                {sortDirection === 'asc'
                                    ? 'ascending'
                                    : 'descending'}
                            </span>

                            <span aria-hidden="true">
                                {t('caseManagementDashboard.case.createdAt')}
                            </span>

                            <Icon
                                type={
                                    sortDirection === 'asc'
                                        ? IconType.ARROW_UP
                                        : IconType.ARROW_DOWN
                                }
                                color="var(--color-toast-toast-text)"
                                width={16}
                            />
                        </Typography>
                    </TableHeaderCell>
                </TableRow>
            </TableHeader>
            <TableBody>
                {cases && cases.length ? (
                    cases.map((singleCase) => (
                        <CaseTableRow
                            key={`case-search-card-${singleCase.id}`}
                            singleCase={singleCase}
                            searchValues={searchValues}
                        />
                    ))
                ) : (
                    <NoResultsRow
                        searchValues={searchValues}
                        caseSearchLoading={caseSearchLoading}
                        loadingMessage={loadingMessage}
                        isFiltered={isFiltered}
                    />
                )}
            </TableBody>
        </Table>
    );
};
