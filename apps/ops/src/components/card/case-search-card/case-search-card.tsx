import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';

import ExceptionRow from '@deps/components/card/case-search-card/exception-row/exception-row';
import ChipStatus from '@deps/components/chip-status/chip-status';
import Tooltip, { PopoverPlacement } from '@deps/components/tooltip/tooltip';
import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import { usePermissionsContext } from '@deps/contexts/PermissionsContext';
import { segmentAnalyticsTrackEvent } from '@deps/helpers/analytics/segment-analytics';
import { getPolicyOwners } from '@deps/helpers/parties';
import {
    formatDateDescriptionList,
    formatSSN,
    toTitleCase,
} from '@deps/helpers/string.helpers';
import { Statuses } from '@deps/models/case/case';
import {
    ExceptionInstance,
    ExceptionStatuses,
} from '@deps/models/case/exception-instance';
import { PartyInstance } from '@deps/models/case/party-instance';
import { ReactComponent as ChevronRightIcon } from '@deps/styles/elements/icons/icons_outlined/chevron-right.svg';
import { CaseDetailsTabValues } from '@deps/types/constants';
import { SearchViewQuery } from '@deps/types/search';
import {
    CaseClickedEvent,
    SegmentTrackedEventName,
} from '@deps/types/segment-analytics';
import { getCarrierLogoByClientId } from '@deps/utils/carriers';

import CaseDetailField from './case-detail-field';
import OwnerWithOthers from './owner-with-others';

export interface CaseSearchCardProps {
    id: string;
    index?: number;
    carrier: string;
    caseStatus: Statuses;
    process?: string;
    processSubType?: string;
    policyNumber?: string | null;
    createdAt?: string;
    updatedAt?: string;
    searchValues?: SearchViewQuery;
    exceptions?: ExceptionInstance[];
    parties?: PartyInstance[];
    documentNumber?: string;
    showLogo?: boolean;
    showCarrier?: boolean;
    showOwnerInfo?: boolean;
    isCustomStyle?: boolean;
    showCaseId?: boolean;
}

export default function CaseSearchCard({
    id,
    index,
    caseStatus,
    process,
    processSubType,
    policyNumber,
    createdAt,
    updatedAt,
    carrier,
    searchValues,
    parties,
    exceptions,
    documentNumber,
    showLogo = true,
    showCarrier = true,
    showOwnerInfo = true,
    isCustomStyle = true,
    showCaseId = false,
}: CaseSearchCardProps) {
    const { t } = useTranslation();
    const router = useRouter();
    const { sessionId, partyId } = usePermissionsContext();

    const imageSrc = getCarrierLogoByClientId(carrier);

    const viewCaseText = t('caseManagementDashboard.case.viewCase', {
        caseNumber: String(policyNumber).split('').join(' '),
    });

    const policyOwners = parties ? getPolicyOwners(parties) : [];
    const entities = policyOwners.slice(1).map((owner) => ({
        name: toTitleCase(owner.fullName),
        ssn: formatSSN(owner.ssn),
    }));

    const ownerName = policyOwners.length
        ? (policyOwners?.[0]?.firstName || '') +
          ' ' +
          (policyOwners?.[0]?.lastName || '')
        : null;
    const ssn = policyOwners.length ? policyOwners[0].ssn : null;
    const ownerComponentProps = {
        label: t('caseManagementDashboard.case.owner'),
        text: toTitleCase(ownerName?.trim()),
        highlights: [
            searchValues?.ownerFirstName,
            searchValues?.ownerLastName,
        ].filter(Boolean) as string[],
        entities,
        truncate: true,
    };

    const ownerComponent =
        policyOwners.length > 1 ? (
            <OwnerWithOthers {...ownerComponentProps} />
        ) : (
            <CaseDetailField pii={true} {...ownerComponentProps} />
        );

    const openExceptions = exceptions?.filter(
        (exception) => exception.status !== ExceptionStatuses.Resolved
    );
    const isExceptionRow =
        caseStatus === Statuses.Exception && !!openExceptions?.length;

    const loadCaseDetails = (href: string) => {
        segmentAnalyticsTrackEvent<CaseClickedEvent>(
            SegmentTrackedEventName.CaseClicked,
            {
                caseId: id,
                authSessionId: sessionId,
                userId: partyId,
            }
        );

        router.push(href);
    };

    return (
        <div
            className={isCustomStyle ? 'case-search-card' : ' '}
            data-testid="case-search-card"
        >
            <div
                className={
                    isCustomStyle ? 'case-search-card-grid' : 'flex gap-10 '
                }
                data-testid={`case-search-card-inner-${index}`}
            >
                {showLogo && (
                    <Tooltip
                        placement={PopoverPlacement.TopRight}
                        body={carrier}
                        isTabbable={false}
                    >
                        <div className="flex h-12 w-12 items-center justify-center rounded border-2 border-gray-100">
                            <Image
                                src={imageSrc}
                                alt={`${carrier} icon`}
                                width={48}
                                height={48}
                                role="presentation"
                                aria-hidden="true"
                            />
                        </div>
                    </Tooltip>
                )}
                <div className="flex items-center">
                    <ChipStatus status={caseStatus} data-testid="chip-status" />
                </div>
                {showCarrier && (
                    <div>
                        <Typography
                            variant={TypographyVariant.LabelLg}
                            className="block"
                        >
                            {process}
                        </Typography>
                        {!!processSubType && (
                            <Typography
                                variant={TypographyVariant.Caption}
                                className="block"
                            >
                                {toTitleCase(processSubType)}
                            </Typography>
                        )}
                    </div>
                )}

                {documentNumber && (
                    <CaseDetailField
                        label={t('caseManagementDashboard.case.documentNumber')}
                        pii={true}
                        text={documentNumber}
                    />
                )}

                {showCaseId && (
                    <CaseDetailField
                        label={t('caseManagementDashboard.case.caseId')}
                        pii={true}
                        text={id}
                    />
                )}
                <CaseDetailField
                    label={t('caseManagementDashboard.case.policyNumber')}
                    pii={true}
                    text={policyNumber}
                    highlights={
                        searchValues?.policyNumber
                            ? [searchValues?.policyNumber]
                            : null
                    }
                />
                <CaseDetailField
                    label={t('caseManagementDashboard.case.createdAt')}
                    text={formatDateDescriptionList(new Date(createdAt || ''))}
                />
                <CaseDetailField
                    label={t('caseManagementDashboard.case.updatedAt')}
                    text={formatDateDescriptionList(new Date(updatedAt || ''))}
                />
                {showOwnerInfo && ownerComponent}
                {showOwnerInfo && (
                    <CaseDetailField
                        label={t('caseManagementDashboard.case.ssn')}
                        pii={true}
                        sentenceCase={false}
                        text={formatSSN(ssn || undefined)}
                        highlights={
                            searchValues?.ssn ? [searchValues?.ssn] : null
                        }
                    />
                )}
                {showLogo && (
                    <Link
                        className="default-focus rounded text-secondary hover:text-secondary-dark focus:text-secondary-dark"
                        aria-label={viewCaseText}
                        href={`/cases/${id}/${CaseDetailsTabValues.progress}`}
                        onClick={() =>
                            loadCaseDetails(
                                `/cases/${id}/${CaseDetailsTabValues.progress}`
                            )
                        }
                    >
                        <ChevronRightIcon height={24} width={24} />
                    </Link>
                )}
            </div>
            {isExceptionRow && (
                <div className="w-[1130px]">
                    <ExceptionRow exceptions={openExceptions} />
                </div>
            )}
        </div>
    );
}
