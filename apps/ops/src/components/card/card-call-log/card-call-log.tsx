import { Tag } from '@zinnia/bloom/components';
import clsx from 'clsx';
import { useTranslation } from 'next-i18next';

import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import { toSentenceCase } from '@deps/helpers/string.helpers';
import { useTimestampText } from '@deps/hooks/useStatusInfo';
import { ReactComponent as ChevronRightIcon } from '@deps/styles/elements/icons/icons_outlined/chevron-right.svg';
import { ReactComponent as PhoneIcon } from '@deps/styles/elements/icons/icons_outlined/phone.svg';

export interface CallLogCardProps {
    callerName?: string;
    callerRole?: string;
    tag?: string;
    createdAt?: string;
    summary?: string;
    isSecondaryPage?: boolean;
    handleNavigate?: () => void;
    className?: string;
}

export const NoSummaryCard = ({ content }: { content: string }) => (
    <div className="flex items-center gap-1 rounded-sm border border-dashed border-gray-100 bg-gray-50 p-4">
        <PhoneIcon height={16} width={16} />
        <Typography variant={TypographyVariant.Label}>{content}</Typography>
    </div>
);

export default function CallLogCard({
    callerName,
    callerRole,
    tag,
    createdAt,
    summary,
    isSecondaryPage,
    handleNavigate,
    className,
}: CallLogCardProps) {
    tag = toSentenceCase(tag);
    const displayName = (
        <Typography variant={TypographyVariant.LabelLg} className="mb-2">
            {callerRole ? `${callerName}, ` : callerName}
            {callerRole && (
                <span className="font-normal italic">{callerRole}</span>
            )}
        </Typography>
    );

    const { t } = useTranslation();
    const timestampText = toSentenceCase(useTimestampText(t, createdAt || ''));
    const missingSummaryText = t('sideSheet.noCallLogSummary');

    return (
        <div
            className={clsx(
                'w-full border-b-2 border-gray-100 p-8 pr-6',
                className
            )}
        >
            <div className="header flex flex-row items-center justify-between">
                <div className="flex flex-col">
                    {createdAt && (
                        <Typography
                            variant={TypographyVariant.Caption}
                            className="mb-1"
                        >
                            {timestampText}
                        </Typography>
                    )}
                    {!!callerName && displayName}
                </div>
                {!isSecondaryPage && (
                    <ChevronRightIcon
                        data-testid="chevron"
                        height={24}
                        width={24}
                        className="text-secondary hover:cursor-pointer hover:text-secondary-dark"
                        onClick={handleNavigate}
                    />
                )}
            </div>
            {tag && (
                <span className="block mb-4 mt-2">
                    <Tag text={tag} />
                </span>
            )}
            {summary ? (
                <Typography
                    variant={TypographyVariant.Body}
                    className={clsx({
                        'line-clamp-5 break-normal': !isSecondaryPage,
                    })}
                >
                    {summary}
                </Typography>
            ) : (
                <NoSummaryCard content={missingSummaryText} />
            )}
        </div>
    );
}
