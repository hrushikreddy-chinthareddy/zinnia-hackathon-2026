import { Icon, IconType, Tag } from '@zinnia/bloom/components';
import dayjs from 'dayjs';
import { useTranslation } from 'next-i18next';

import CardInfo from '@deps/components/card/card-info/card-info';
import PageLoader, { PageLoaderVariant } from '@deps/components/page-loader/page-loader';
import { PiiWrapper } from '@deps/components/pii/PiiWrapper';
import Typography, { TypographyVariant } from '@deps/components/typography/typography';
import CardContainer from '@deps/containers/card-container/card-container';
import { useCaseActivityContext } from '@deps/contexts/CaseActivityContext';
import { toSentenceCase, toTitleCase } from '@deps/helpers/string.helper';
import UnauthorizedCard from '@deps/components/card/card-unauthorized';
import { StatusCode } from '@deps/queries/api-utils/baseAPIClient';
export const NoSummaryCard = ({ content }: { content: string }) => (
    <div className="flex items-center gap-1 rounded-sm border border-dashed border-gray-100 bg-gray-50 p-4">
        <Icon type={IconType.PHONE} height={16} width={16} />
        <Typography variant={TypographyVariant.Label}>{content}</Typography>
    </div>
);

const CallLogCard = ({
    callEntryId,
    callerName,
    callerRole,
    tag,
    createdAt,
    summary,
}: {
    callEntryId?: number;
    callerName?: string;
    callerRole?: string;
    tag?: string;
    createdAt?: string;
    summary?: string;
    className?: string;
}) => {
    tag = toSentenceCase(tag);
    const displayName = (
        <Typography variant={TypographyVariant.LabelLg}>
            <PiiWrapper>{callerRole ? `${callerName}, ` : callerName}</PiiWrapper>
            {callerRole && <span className="font-normal italic">{callerRole}</span>}
        </Typography>
    );

    const { t } = useTranslation();
    const timestampText = dayjs(createdAt).format('M/D/YY h:mm a');
    const missingSummaryText = t('sideSheet.noCallLogSummary');

    return (
        <div className="flex w-full flex-col gap-2 border-b-2 border-gray-100 py-6 last:border-b-0">
            <div className="header flex w-full flex-row items-center justify-between">
                <div className="flex w-full flex-col">
                    <div className="flex w-full justify-between">
                        {createdAt && (
                            <div className="justify-self-start">
                                <Typography variant={TypographyVariant.Caption} className="mb-1">
                                    {timestampText}
                                </Typography>
                            </div>
                        )}
                        {callEntryId && (
                            <div className="justify-self-end">
                                <Typography variant={TypographyVariant.Caption}>{`ID: ${callEntryId}`}</Typography>
                            </div>
                        )}
                    </div>
                    {!!callerName && displayName}
                </div>
            </div>
            {tag && (
                <div>
                    <Tag text={tag} />
                </div>
            )}
            {summary ? (
                <Typography variant={TypographyVariant.BodySm} className="break-normal">
                    <PiiWrapper>{summary}</PiiWrapper>
                </Typography>
            ) : (
                <NoSummaryCard content={missingSummaryText} />
            )}
        </div>
    );
};

export default function CallLogsTab() {
    const { t } = useTranslation();
    const { loadingCallLogs, callLogs, callLogsStatusCode } = useCaseActivityContext();
    return (
        <CardContainer>
            <div>
                <Typography variant={TypographyVariant.H2}>{toTitleCase(`${t('caseOverview.tabs.call-logs')}`)}</Typography>
            </div>
            {loadingCallLogs && (
                <div className="p-8">
                    <PageLoader variant={PageLoaderVariant.Center} />
                </div>
            )}
            {!loadingCallLogs && !callLogs.length && callLogsStatusCode !== StatusCode.Forbidden && (
                <div className="flex justify-center">
                    <CardInfo
                        icon={<Icon type={IconType.PHONE} width={50} height={50} className="text-gray-300" />}
                        title={t('sideSheet.callLogsEmptyTitle')}
                        subtitle={t('sideSheet.callLogsEmptyText')}
                        className="mt-8"
                    />
                </div>
            )}
            {!loadingCallLogs && !!callLogs.length && (
                <>
                    {callLogs.map(({ callEntryID, callerName, callerType, createdDate, callType, callSummary }) => (
                        <CallLogCard
                            key={`call-log-${callEntryID}`}
                            callEntryId={callEntryID}
                            callerName={callerName}
                            callerRole={callerType}
                            createdAt={createdDate}
                            tag={callType}
                            summary={callSummary}
                        />
                    ))}
                </>
            )}
            {callLogsStatusCode === StatusCode.Forbidden && <UnauthorizedCard />}
        </CardContainer>
    );
}
