import {
    Icon,
    IconType,
    Link,
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
import Image from 'next/image';
import { useTranslation } from 'react-i18next';

import ChipStatus from '@deps/components/chip-status/chip-status';
import Typography, { TypographyVariant } from '@deps/components/typography/typography';
import { TranslationFiles } from '@deps/config/translations';
import { getStatusDetails } from '@deps/containers/case-redesign-sub-page';
import { calculateDaysAgo } from '@deps/helpers/case-management';
import { getAgents, getPolicyOwners } from '@deps/helpers/parties';
import { formatSSN, toTitleCase } from '@deps/helpers/string.helper';
import { getTimeAgoUnitValue } from '@deps/hooks/useStatusInfo';
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
            <PlusOthers entities={entities} />
        </div>
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
                    <TableHeaderCell sortable onClick={handleSort}>
                        <Typography variant={TypographyVariant.BodySmBold} className="flex align-center gap-1">
                            {t('caseManagementDashboard.case.createdAt')}
                            <Icon type={sortDirection === 'asc' ? IconType.ARROW_UP : IconType.ARROW_DOWN} color="#00628B" />
                        </Typography>
                    </TableHeaderCell>
                </TableRow>
            </TableHeader>
            <TableBody>
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
                                <div className="flex justify-end">
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
            </TableBody>
        </Table>
    );
};
