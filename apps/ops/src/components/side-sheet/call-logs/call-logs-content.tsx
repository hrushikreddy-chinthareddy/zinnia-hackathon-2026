import { TFunction } from 'next-i18next';
import { useCallback, useEffect, useState } from 'react';

import CallLogCard from '@deps/components/card/card-call-log/card-call-log';
import PageLoader, { PageLoaderVariant } from '@deps/components/page-loader/page-loader';
import PaginationControls from '@deps/components/pagination/pagination';
import SecondaryCallLog from '@deps/components/side-sheet/call-logs/secondary-call-log';
import SideSheetEmpty from '@deps/components/side-sheet/side-sheet-empty/side-sheet-empty';
import { CallLog } from '@deps/models/case/call-log';
import { getCaseCallLogs } from '@deps/queries/api/contracts';
import { ReactComponent as PhoneIcon } from '@deps/styles/elements/icons/icons_outlined/phone.svg';
import { Icon, IconType } from '@zinnia/bloom/components';
import { StatusCode } from '@deps/queries/api-utils/baseAPIClient';

interface CallLogsContentProps {
    contractNumber?: string;
    t: TFunction;
}

// DEPU-1125 TEST CASE AS OF 1/3/24 POLICY NUM 5830000002 CASE CA0000034550
export function CallLogsContent({ contractNumber, t }: CallLogsContentProps) {
    const [isLoading, setIsLoading] = useState(true);
    const [callLogs, setCallLogs] = useState<CallLog[]>([]);
    const [callLogsStatusCode, setCallLogsStatusCode] = useState<number | null>(null);
    const [offset, setOffset] = useState(0);
    const [totalLogs, setTotalLogs] = useState(0);
    const [focusedCall, setFocusedCall] = useState<null | number>(null);
    const limit = 10;

    useEffect(() => {
        const getCallLogs = async () => {
            if (contractNumber) {
                const results = await getCaseCallLogs({ contract: contractNumber, offset, limit });

                setCallLogs(results?.data?.items || []);
                setTotalLogs(results?.data?.totalCount || 0);
                setCallLogsStatusCode(results?.status);
            } else {
                console.error('No contract number associated');
            }
            setIsLoading(false);
        };

        getCallLogs();
    }, [contractNumber, offset]);

    const goToPage = useCallback(
        (pageNumber: number) => {
            setOffset((pageNumber - 1) * limit);
            setIsLoading(true); // DEPU-1125 may not be necessary
        },
        [setOffset]
    );

    if (isLoading)
        return (
            <div className="p-8">
                <PageLoader variant={PageLoaderVariant.Center} />
            </div>
        );

    if (callLogsStatusCode === StatusCode.Forbidden)
        return (
            <SideSheetEmpty
                icon={
                    <Icon
                        type={IconType.ALERT_EXCLAMATION}
                        width={50}
                        height={50}
                        className="text-semantic-warning"
                        data-testid="call-logs-empty-icon"
                    />
                }
                header={t('unauthorized.title')}
                text={t('unauthorized.message')}
            />
        );

    if (focusedCall !== null) return <SecondaryCallLog call={callLogs[focusedCall]} setFocusedCall={setFocusedCall} />;

    if (!callLogs || callLogs.length === 0)
        return (
            <SideSheetEmpty
                icon={<PhoneIcon width={50} height={50} className="text-gray-300" data-testid="call-logs-empty-icon" />}
                header={t('sideSheet.callLogsEmptyTitle')}
                text={t('sideSheet.callLogsEmptyText')}
            />
        );

    return (
        <div className="flex h-full flex-col">
            <div className="overflow-y-scroll">
                {callLogs.map(({ callEntryID, callerName, callerType, createdDate, callType, callSummary }: CallLog, index: number) => (
                    <CallLogCard
                        key={`call-log-${callEntryID}`}
                        callerName={callerName}
                        callerRole={callerType}
                        createdAt={createdDate}
                        tag={callType}
                        summary={callSummary}
                        handleNavigate={() => setFocusedCall(index)}
                    />
                ))}
            </div>
            <div className="grow" />
            <div className="mx-auto my-6">
                <PaginationControls total={totalLogs} limit={limit} offset={offset} goToPage={goToPage} />
            </div>
        </div>
    );
}
