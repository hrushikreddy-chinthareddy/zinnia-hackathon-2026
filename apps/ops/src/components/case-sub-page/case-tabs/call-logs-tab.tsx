import { useQuery } from '@tanstack/react-query';
import { Icon, IconType, Tag } from '@zinnia/bloom/components';
import dayjs from 'dayjs';
import { useTranslation } from 'next-i18next';

import CardInfo from '@deps/components/card/card-info/card-info';
import UnauthorizedCard from '@deps/components/card/card-unauthorized';
import PageLoader, {
    PageLoaderVariant,
} from '@deps/components/page-loader/page-loader';
import { PiiWrapper } from '@deps/components/pii/PiiWrapper';
import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import CardContainer from '@deps/containers/card-container/card-container';
import { useOptimizely } from '@deps/contexts/OptimizelyContext';
import { usePermissionsContext } from '@deps/contexts/PermissionsContext';
import { useSideSheetContext } from '@deps/contexts/SideSheetContext';
import { toSentenceCase } from '@deps/helpers/string.helpers';
import { StatusCode } from '@deps/queries/api-utils/baseAPIClient';
import { getCallLogsQuery } from '@deps/queries/tanstack/caseQueries/caseQueries';
import { ReactComponent as VolumeUp } from '@deps/styles/elements/icons/icons_outlined/volume-up.svg';
import { FEATURE_FLAGS } from '@deps/utils/optimizely/flags';

import { AudioDetailsContent } from './audio-details-content';
import styles from './call-logs.module.css';

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
    notes,
    sessionID,
}: {
    callEntryId?: number;
    callerName?: string;
    callerRole?: string;
    tag?: string;
    createdAt?: string;
    summary?: string;
    className?: string;
    notes?: string;
    sessionID?: string;
}) => {
    tag = toSentenceCase(tag);
    const displayName = (
        <Typography variant={TypographyVariant.LabelLg}>
            <PiiWrapper>
                {callerRole ? `${callerName}, ` : callerName}
            </PiiWrapper>
            {callerRole && (
                <span className="font-normal italic">{callerRole}</span>
            )}
        </Typography>
    );

    const { t } = useTranslation();
    const timestampText = dayjs(createdAt).format('M/D/YY h:mm a');
    const missingSummaryText = t('sideSheet.noCallLogSummary');
    // Sidesheet Support
    const sideSheet = useSideSheetContext();
    const { featureFlags } = useOptimizely();
    const audioFeatureEnabled = featureFlags[FEATURE_FLAGS.CALL_AUDIO_FEATURE];
    const { isCallLogAudioPermitted } = usePermissionsContext();
    const permittedToListen = audioFeatureEnabled && isCallLogAudioPermitted;
    const openSideBar = () => {
        sideSheet.changeSideSheetContent(
            t('sideSheet.audioDetailsContent.audioDetailsTitle') as string,
            <AudioDetailsContent
                callEntryId={callEntryId}
                callerName={callerName}
                createdAt={createdAt}
                sessionID={sessionID}
            />
        );
        sideSheet.handleOpen(true);
    };

    return (
        <div className="flex w-full flex-col gap-2 border-b-2 border-gray-100 py-6 last:border-b-0">
            <div className="header flex w-full flex-row items-center justify-between">
                <div className="flex w-full flex-col">
                    <div className="flex w-full justify-between">
                        {createdAt && (
                            <div className="justify-self-start">
                                <Typography
                                    variant={TypographyVariant.Caption}
                                    className="mb-1"
                                >
                                    {timestampText}
                                </Typography>
                            </div>
                        )}
                        {callEntryId && (
                            <div className="justify-self-end flex gap-4 items-center">
                                <Typography
                                    variant={TypographyVariant.Caption}
                                >{`ID: ${callEntryId}`}</Typography>
                                {permittedToListen && (
                                    <div
                                        className={`flex items-center gap-1 ${
                                            sessionID != undefined
                                                ? 'text-[#00628B] cursor-pointer'
                                                : 'text-[#B3B3B3] cursor-not-allowed'
                                        }`}
                                        onClick={
                                            sessionID ? openSideBar : undefined
                                        }
                                    >
                                        <VolumeUp width={16} height={16} />
                                        <Typography
                                            className={
                                                sessionID != undefined
                                                    ? 'cursor-pointer'
                                                    : 'cursor-not-allowed'
                                            }
                                            variant={TypographyVariant.LabelMd}
                                        >
                                            {t(
                                                'sideSheet.audioDetailsContent.audioDetails'
                                            )}
                                        </Typography>
                                    </div>
                                )}
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
            {notes && (
                <>
                    <Typography variant={TypographyVariant.LabelLg}>
                        {t('sideSheet.callLogNotes')}
                    </Typography>
                    <Typography
                        variant={TypographyVariant.Body}
                        className="break-normal"
                    >
                        <PiiWrapper>{notes}</PiiWrapper>
                    </Typography>
                </>
            )}
            {summary && (
                <>
                    <Typography variant={TypographyVariant.LabelLg}>
                        {t('sideSheet.callLogSummary')}
                    </Typography>
                    <Typography
                        variant={TypographyVariant.Body}
                        className="break-normal"
                    >
                        <PiiWrapper>{summary}</PiiWrapper>
                    </Typography>
                </>
            )}
            {!summary && !notes && (
                <NoSummaryCard content={missingSummaryText} />
            )}
        </div>
    );
};

interface CallLogsTabProps {
    policyNumber?: string;
    carrier?: string;
    queryLimit: number;
}

export default function CallLogsTab({
    policyNumber,
    carrier,
    queryLimit = 10,
}: CallLogsTabProps) {
    const { t } = useTranslation();

    const { data: callLogsData, isLoading: callLogsLoading } = useQuery({
        queryKey: ['callLogs', policyNumber, carrier, queryLimit],
        queryFn: () => getCallLogsQuery(policyNumber, carrier, queryLimit),
        enabled: !!policyNumber,
    });

    return (
        <CardContainer classNames={styles.callLogsContainer}>
            {callLogsLoading ? (
                <div className="p-8">
                    <PageLoader variant={PageLoaderVariant.Center} />
                </div>
            ) : !callLogsData?.data.length &&
              callLogsData?.status !== StatusCode.Forbidden ? (
                <div className="flex justify-center">
                    <CardInfo
                        title={t('sideSheet.callLogsEmptyTitle')}
                        className="mt-8"
                    />
                </div>
            ) : (
                !!callLogsData?.data.length && (
                    <>
                        {callLogsData.data.map(
                            ({
                                callEntryID,
                                callerName,
                                callerType,
                                createdDate,
                                callType,
                                callSummary,
                                notes,
                                sessionID,
                            }) => (
                                <CallLogCard
                                    key={`call-log-${callEntryID}`}
                                    callEntryId={callEntryID}
                                    callerName={callerName}
                                    callerRole={callerType}
                                    createdAt={createdDate}
                                    tag={callType}
                                    summary={callSummary}
                                    notes={notes}
                                    sessionID={sessionID}
                                />
                            )
                        )}
                    </>
                )
            )}
            {callLogsData?.status === StatusCode.Forbidden && (
                <UnauthorizedCard />
            )}
        </CardContainer>
    );
}
