import clsx from 'clsx';
import dayjs from 'dayjs';
import { useTranslation } from 'next-i18next';
import { ReactElement } from 'react';

import ChipStatus from '@deps/components/chip-status/chip-status';
import { PiiWrapper } from '@deps/components/pii/PiiWrapper';
import { TranslationFiles } from '@deps/config/translations';
import { useSideSheetContext } from '@deps/contexts/SideSheetContext';
import { AccessibleFormattedAmount } from '@deps/helpers/numbers.helper';
import { Statuses } from '@deps/models/case/case';
import { Status } from '@deps/models/policy/sor-policy';
import { ReactComponent as ChevronRightIcon } from '@deps/styles/elements/icons/icons_outlined/chevron-right.svg';

export interface HistoryEventCardProps {
    amount?: number;
    caption: string;
    eventBody?: string;
    eventTitle: string;
    isClickable: boolean;
    isPending: boolean;
    sideSheetTitle?: string;
    sideSheetContent?: ReactElement;
    status?: Status | string;
    processDate?: Date | string;
}

enum TransactionStatus {
    Canceled = 'Canceled',
}

const HistoryEventCard = ({
    amount,
    caption,
    eventBody,
    eventTitle,
    isClickable,
    isPending,
    sideSheetContent,
    sideSheetTitle,
    status,
    processDate,
}: HistoryEventCardProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON);

    const containerClasses = clsx(
        'flex w-full flex-col rounded border-2 p-4',
        isPending ? 'border-dashed border-gray-300 bg-gray-100' : 'border-gray-100 bg-white',
        isClickable ? 'hover:border-yellow-400' : 'pointer-events-none'
    );

    // Sidesheet Support
    const sideSheet = useSideSheetContext();
    const openTransactionSidesheet = () => {
        if (!sideSheetContent || !sideSheetTitle) return;
        sideSheet.changeSideSheetContent(sideSheetTitle, sideSheetContent);
        sideSheet.handleOpen(true);
    };

    return (
        <li>
            <button aria-disabled={!isClickable} className={containerClasses} onClick={openTransactionSidesheet}>
                <div className="flex min-h-[62px] w-full items-center justify-between gap-4">
                    <div className="flex grow flex-col items-start">
                        <div className="text-content-caption font-medium text-gray-500">{caption}</div>

                        <div className="flex items-center gap-2">
                            <div className="font-primary text-label-lg font-semibold">{eventTitle}</div>
                            {status && status === TransactionStatus.Canceled && (
                                <ChipStatus
                                    status={status as unknown as Statuses}
                                    statusText={t('status.canceledOn', { date: dayjs(processDate).format('M/DD/YYYY') }) as string}
                                    classNames="border-semantic-info bg-semantic-info-light w-fit"
                                />
                            )}
                        </div>

                        {eventBody && (
                            <div className="font-secondary text-body-sm">
                                <PiiWrapper>{eventBody}</PiiWrapper>
                            </div>
                        )}
                    </div>

                    {!!amount && (
                        <div className="font-bold md:text-content-value">
                            <AccessibleFormattedAmount amount={amount} />
                        </div>
                    )}

                    {/* TODO: remove isClickable logic in favor of sidesheetContent & title once all sidesheets are created */}
                    {isClickable && <ChevronRightIcon className="text-secondary" height={24} width={24} />}
                </div>
            </button>
        </li>
    );
};

export default HistoryEventCard;
