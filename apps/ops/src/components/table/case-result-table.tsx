import {
    Icon,
    IconType,
<<<<<<< HEAD
=======
    Link,
>>>>>>> 556f0572c (adding the sort method for the table)
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
import Typography, { TypographyVariant } from '@deps/components/typography/typography';
import { TranslationFiles } from '@deps/config/translations';
import { usePermissionsContext } from '@deps/contexts/PermissionsContext';
import { segmentAnalyticsTrackEvent } from '@deps/helpers/analytics/segment-analytics';
import { isEmptyObject } from '@deps/helpers/objects.helper';
import { getAgents, getPolicyOwners } from '@deps/helpers/parties';
import { formatSSN, toTitleCase } from '@deps/helpers/string.helper';
import { getTimeAgoUnitValue } from '@deps/hooks/useStatusInfo';
import { Case } from '@deps/models/case/case';
import { CaseDetailsTabValues, DEFAULT_ERROR_STRING } from '@deps/types/constants';
import { SearchViewQuery } from '@deps/types/search';
import { SegmentTrackedEventName } from '@deps/types/segment-analytics';
import { getCarrierLogoByClientId, getCarrierNameByClientId } from '@deps/utils/carriers';

import styles from './case-result-table.module.css';
import CaseDetailField from '../card/case-search-card/case-detail-field';
import { CaseStatusTooltip } from '../case-list/components/case-status-tooltip';
import Highlighter from '../highlighter/highlighter';
import { PiiProps } from '../pii/pii';
import { PiiWrapper } from '../pii/PiiWrapper';
import PlusOthers from '../plus-others/plus-others';
import PopoverOnTruncate from '../popover-on-truncate/popover-on-truncate';

interface PartyWithOthersProps extends PiiProps {
    text?: string | null;
    highlights?: string[] | null;
    entities: { name: string; ssn: string }[];
    isOwner?: boolean;
}

const PartyWithOthers = ({ text, entities, highlights, isOwner }: PartyWithOthersProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON);
    const textWithHighlights = !!text && highlights && highlights.length ? <Highlighter text={text} highlights={highlights} /> : text;

    const textToRender = text ? (
        <PopoverOnTruncate title={text} triggerClassName="!z-10">
            <span className="line-clamp-1 break-all font-secondary text-md relative">{textWithHighlights}</span>
        </PopoverOnTruncate>
    ) : (
        textWithHighlights
    );

    return (
        <div className="flex">
            <Typography variant={TypographyVariant.BodySm}>
                <PiiWrapper>{textToRender || DEFAULT_ERROR_STRING}</PiiWrapper>
            </Typography>
            <PlusOthers entities={entities} tooltipTitle={isOwner ? t('tooltip.jointOwner') : t('tooltip.agent')} />
        </div>
    );
};

interface CaseTableRowProps {
    singleCase: Case;
    searchValues: SearchViewQuery | undefined;
}

const CaseTableRow = ({ singleCase, searchValues }: CaseTableRowProps) => {
    dayjs.extend(timezone);
    dayjs.extend(advanced);
    const { t } = useTranslation(TranslationFiles.COMMON);
    const router = useRouter();
    const perms = usePermissionsContext();

    const policyOwners = singleCase.parties ? getPolicyOwners(singleCase.parties) : [];
    const entities = policyOwners.slice(1).map(owner => ({ name: toTitleCase(owner.fullName), ssn: formatSSN(owner.ssn) }));
    const ownerName = policyOwners.length ? policyOwners?.[0]?.fullName : null;
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
        highlights: [searchValues?.ownerFirstName, searchValues?.ownerLastName].filter(Boolean) as string[],
        entities: otherAgents,
        truncate: true,
    };

    const imageSrc = getCarrierLogoByClientId(singleCase.carrier);
    const carrierName = getCarrierNameByClientId(singleCase.carrier);

    const viewCaseText = t('caseManagementDashboard.case.viewCase', {
        caseNumber: String(singleCase.policyNumber).split('').join(' '),
    });

    const getTimeText = () => {
        let text;
        const { unit, count } = getTimeAgoUnitValue(singleCase.createdAt) || {};
        if (unit === 'hour' || unit === 'minute') {
            const timeText = t('temporal.timeago', { formattedDate: '', count: count, unit: unit }).trim();
            text = timeText;
        } else {
            text = dayjs(singleCase.createdAt).format('M/D/YYYY');
        }
        return text;
    };

    const loadCaseDetails = (href: string) => {
        segmentAnalyticsTrackEvent(SegmentTrackedEventName.PolicyKeyValuesItemClick, {
            caseId: singleCase.id,
            userId: perms.getUserPartyId(),
        });

        router.push(href);
    };

    return (
        <TableRow className={styles.row}>
            {/* This lives as a visibly hidden link instead of as a click handler on the table row for acccessibility concerns. Nested interactive elements are not allowed */}
            <Link
                onClick={() => loadCaseDetails(`/cases/${singleCase.id}/${CaseDetailsTabValues.progress}`)}
                href={`/cases/${singleCase.id}/${CaseDetailsTabValues.progress}`}
                className={styles.caseLink}
                aria-label={viewCaseText}
            >
                <Typography variant={TypographyVariant.BodySm} className={styles.caseLinkText}>
                    View Case
                </Typography>
            </Link>
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
                <CaseStatusTooltip
                    singleCase={singleCase}
                    trigger={<ChipStatus status={singleCase.caseStatus} data-testid="chip-status" classNames="whitespace-nowrap" />}
                />
            </TableCell>
            <TableCell>
                <div className="flex flex-col">
                    {policyOwners.length > 1 ? (
                        <PartyWithOthers {...ownerComponentProps} isOwner />
                    ) : (
                        <CaseDetailField pii={true} {...ownerComponentProps} triggerClassName="!z-10" popoverClassName="!w-auto" />
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
                    <Tooltip
                        placement={TooltipPlacement.TopRight}
                        tooltipClassName="!w-auto"
                        triggerClassName="!z-10"
                        trigger={
                            <div className="flex items-center justify-center rounded border-2 border-gray-100 bg-white h-6 w-6">
                                <Image src={imageSrc} alt={`${singleCase.carrier} icon`} role="presentation" height={24} width={24} />
                                <span className="sr-only">{singleCase.carrier} icon</span>
                            </div>
                        }
                    >
                        <div className="flex flex-col">
                            <span>{carrierName}</span>
                            {singleCase.productName && <span className="capitalize">{singleCase.productName.toLowerCase()}</span>}
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
                        <CaseDetailField pii={true} {...agentComponentProps} triggerClassName="!z-10" popoverClassName="!w-auto" />
                    )}
                    <CaseDetailField pii={true} text={formatSSN(agentSsn)} className={styles.detail} />
                </div>
            </TableCell>
            <TableCell className="text-right whitespace-nowrap">
                <div className="flex justify-end">
                    <Tooltip
                        placement={TooltipPlacement.TopRight}
                        trigger={
                            <Typography variant={TypographyVariant.BodySm} className={styles.detail}>
                                {getTimeText()}
                            </Typography>
                        }
                        tooltipClassName="!w-auto"
                        triggerClassName="!z-10"
                    >
                        {dayjs(singleCase.createdAt).format('M/D/YYYY [at] h:mm a z')}
                    </Tooltip>
                </div>
            </TableCell>
        </TableRow>
    );
};

const NoResultsRow = ({ searchValues }: { searchValues: SearchViewQuery | undefined }) => {
    const { t } = useTranslation(TranslationFiles.COMMON);
    const hasSearchValue = !isEmptyObject(searchValues);

    return (
        <TableRow>
            <TableCell colSpan={7} className="text-center">
                {hasSearchValue ? t('caseManagementDashboard.search.empty.title') : t('caseManagementDashboard.search.empty.titleFilters')}
            </TableCell>
        </TableRow>
    );
};

interface CaseResultTableProps {
    cases: Case[];
    searchValues?: SearchViewQuery;
    handleSort: () => void;
    sortDirection: 'asc' | 'desc';
}

export const CaseResultTable = ({ cases, searchValues, handleSort, sortDirection }: CaseResultTableProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON);
    return (
        <Table className={styles.tableContainer}>
            <TableHeader>
                <TableRow>
                    {/* This header cell is needed so the link can come first in the Table Row, without it the table body will shift right one column too far */}
<<<<<<< HEAD
                    <TableHeaderCell className="sr-only">{t('caseManagementDashboard.case.viewCaseDetails')}</TableHeaderCell>
                    <TableHeaderCell>
                        <Typography variant={TypographyVariant.BodySmBold}>{t('caseManagementDashboard.case.case/ID')}</Typography>
                    </TableHeaderCell>
                    <TableHeaderCell>
                        <Typography variant={TypographyVariant.BodySmBold}>{t('caseManagementDashboard.case.caseStatus')}</Typography>
                    </TableHeaderCell>
                    <TableHeaderCell>
                        <Typography variant={TypographyVariant.BodySmBold}>{t('caseManagementDashboard.case.ownerSsn')}</Typography>
                    </TableHeaderCell>
                    <TableHeaderCell>
                        <Typography variant={TypographyVariant.BodySmBold}>{t('caseManagementDashboard.case.policy')}</Typography>
                    </TableHeaderCell>
                    <TableHeaderCell>
                        <Typography variant={TypographyVariant.BodySmBold}>{t('caseManagementDashboard.case.agentSsn')}</Typography>
                    </TableHeaderCell>
                    <TableHeaderCell sortable onClick={handleSort} className={styles.tableHeader}>
                        <Typography variant={TypographyVariant.BodySmBold} className="flex align-center gap-1">
                            {t('caseManagementDashboard.case.createdAt')}
                            <Icon type={sortDirection === 'asc' ? IconType.ARROW_UP : IconType.ARROW_DOWN} color="#00628B" />
                        </Typography>
=======
                    <TableHeaderCell className="sr-only">View Case Details</TableHeaderCell>
                    <TableHeaderCell>Case/ID</TableHeaderCell>
                    <TableHeaderCell>Case Status</TableHeaderCell>
                    <TableHeaderCell>Owner/SSN</TableHeaderCell>
                    <TableHeaderCell>Policy</TableHeaderCell>
                    <TableHeaderCell>Agent/SSN</TableHeaderCell>
                    <TableHeaderCell sortable onClick={handleSort}>
                        <div className="flex align-center gap-1">
                            Created
                            <Icon type={sortDirection === 'asc' ? IconType.ARROW_UP : IconType.ARROW_DOWN} color="#00628B" />
                        </div>
>>>>>>> 556f0572c (adding the sort method for the table)
                    </TableHeaderCell>
                </TableRow>
            </TableHeader>
            <TableBody>
<<<<<<< HEAD
                {cases && cases.length ? (
                    cases.map(singleCase => (
                        <CaseTableRow key={`case-search-card-${singleCase.id}`} singleCase={singleCase} searchValues={searchValues} />
                    ))
                ) : (
                    <NoResultsRow searchValues={searchValues} />
                )}
=======
                {cases.map(singleCase => {
                    // to do - so much is being defined in this map - should it be its own component or a useCallback/useMemo?
                    const policyOwners = singleCase.parties ? getPolicyOwners(singleCase.parties) : [];
                    const entities = policyOwners.slice(1).map(owner => ({ name: toTitleCase(owner.fullName), ssn: formatSSN(owner.ssn) }));
                    const ownerName = policyOwners.length ? policyOwners?.[0]?.fullName : null;
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

                    const getTimeText = () => {
                        let text;
                        const { unit, count } = getTimeAgoUnitValue(singleCase.createdAt) || {};
                        const currentYear = dayjs().year();
                        const createdYear = dayjs(singleCase.createdAt).year();
                        // to do - i don't think i need this because dayjs will handle the translation too right?
                        // const timeText = t('temporal.timeago', { formattedDate: '', count: count, unit: unit }).trim();
                        if (unit === 'hour' || unit === 'minute') {
                            text = dayjs(singleCase.createdAt).fromNow();
                        } else if (createdYear === currentYear) {
                            // to do - i think i'd rather use all dayjs but this is an option too
                            // text = formatDateDescriptionList(new Date(singleCase.createdAt || ''));
                            text = dayjs(singleCase.createdAt).format('M/D/YYYY');
                        } else {
                            text = dayjs(singleCase.createdAt).format('MMM D, YYYY');
                        }
                        return text;
                    };

                    return (
                        <TableRow key={`case-search-card-${singleCase.id}`} className={styles.row}>
                            {/* This lives as a visibly hidden link instead of as a click handler on the table row for acccessibility concerns. Nested interactive elements are not allowed */}
                            <Link
                                className={styles.caseLink}
                                href={`/cases/${singleCase.id}/${CaseDetailsTabValues.progress}`}
                                text={viewCaseText}
                            />
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
                                {/* to do - remove after fixing in bloom */}
                                <div className="relative">
                                    <Tooltip
                                        placement={TooltipPlacement.TopRight}
                                        triggerClassName="w-auto"
                                        trigger={
                                            <ChipStatus
                                                status={singleCase.caseStatus}
                                                data-testid="chip-status"
                                                classNames="whitespace-nowrap"
                                            />
                                        }
                                    >
                                        {statusTooltip}
                                    </Tooltip>
                                </div>
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
                                    <Tooltip
                                        placement={TooltipPlacement.TopRight}
                                        triggerClassName="w-auto"
                                        trigger={
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
                                        }
                                    >
                                        {singleCase.carrier}
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
                            <TableCell className="text-right">
                                <div className="relative flex justify-end">
                                    <Tooltip
                                        placement={TooltipPlacement.TopRight}
                                        trigger={
                                            <Typography variant={TypographyVariant.BodySm} className={styles.detail}>
                                                {getTimeText()}
                                            </Typography>
                                        }
                                        triggerClassName="w-auto"
                                    >
                                        {dayjs(singleCase.createdAt).format('M/D/YYYY at h:mm a z')}
                                    </Tooltip>
                                </div>
                            </TableCell>
                        </TableRow>
                    );
                })}
>>>>>>> 556f0572c (adding the sort method for the table)
            </TableBody>
        </Table>
    );
};
