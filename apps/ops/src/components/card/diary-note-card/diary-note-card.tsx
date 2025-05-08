import { Tag } from '@zinnia/bloom/components';
import { useTranslation } from 'next-i18next';

import Typography, { TypographyVariant } from '@deps/components/typography/typography';
import { toSentenceCase } from '@deps/helpers/string.helpers';
import { useTimestampText } from '@deps/hooks/useStatusInfo';
import { ReactComponent as AnnotationIcon } from '@deps/styles/elements/icons/icons_outlined/annotation.svg';

export interface DiaryNoteCardProps {
    alert?: string;
    category?: string;
    noteDate?: string;
    noteText?: string;
}

export const NoNoteTextCard = ({ content }: { content: string }) => (
    <div className="flex items-center gap-1 rounded-sm border border-dashed border-gray-100 bg-gray-50 p-4">
        <AnnotationIcon height={16} width={16} />
        <Typography variant={TypographyVariant.Label}>{content}</Typography>
    </div>
);

export default function DiaryNoteCard({ alert, category, noteDate, noteText }: DiaryNoteCardProps) {
    const { t } = useTranslation();
    const timestampText = toSentenceCase(useTimestampText(t, noteDate || ''));
    const missingNoteText = 'Missing note text test BPB translate me';

    return (
        <div className={`w-full border-b-2 border-gray-100 ${alert === 'Y' ? 'bg-semantic-warning-light' : ''} p-8`}>
            <div className="header flex flex-row items-center justify-between">
                <div className="flex flex-col">
                    {noteDate && (
                        <Typography variant={TypographyVariant.Caption} className="mb-1">
                            {timestampText}
                        </Typography>
                    )}
                </div>
            </div>
            {category && (
                <span className="block my-2">
                    <Tag text={category} />
                </span>
            )}
            {noteText ? (
                <Typography variant={TypographyVariant.Body} className="line-clamp-5 break-normal">
                    {noteText}
                </Typography>
            ) : (
                <NoNoteTextCard content={missingNoteText} />
            )}
        </div>
    );
}
