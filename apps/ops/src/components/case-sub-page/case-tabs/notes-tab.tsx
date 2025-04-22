import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { useTranslation } from 'next-i18next';

import CardInfo from '@deps/components/card/card-info/card-info';
import UnauthorizedCard from '@deps/components/card/card-unauthorized';
import Content, { ContentVariant } from '@deps/components/content/content';
import PageLoader, { PageLoaderVariant } from '@deps/components/page-loader/page-loader';
import Typography, { TypographyVariant } from '@deps/components/typography/typography';
import CardContainer from '@deps/containers/card-container/card-container';
import { Case } from '@deps/models/case/case';
import { NoteInstance } from '@deps/models/case/note-instance';
import { StatusCode } from '@deps/queries/api-utils/baseAPIClient';
import { getCaseNotesQuery } from '@deps/queries/tanstack/caseQueries/caseQueries';
import { ReactComponent as AnnotationsIcon } from '@deps/styles/elements/icons/communications/annotations.svg';
import { DEFAULT_DATE_FORMAT, ZAHARA_API_DATE_FORMAT } from '@deps/types/constants';

const NoteItem = ({ note }: { note: NoteInstance }) => {
    const { t } = useTranslation();
    const { desc, note: text, author, updatedAt } = note;

    const updatedAtFormatted = dayjs(updatedAt, ZAHARA_API_DATE_FORMAT).format(DEFAULT_DATE_FORMAT);
    return (
        <div className="flex flex-col items-start gap-6 border-b-2 border-gray-100 py-6 last:border-b-0">
            <div>
                {desc && <Content variant={ContentVariant.BodySm} details={desc} pii={true} />}
                {text && <Content variant={ContentVariant.BodySm} details={text} pii={true} />}
            </div>
            <div className="flex flex-col items-start gap-2">
                <Content
                    className="text-gray-600"
                    variant={ContentVariant.Caption}
                    details={t('caseOverview.tabs.postedOnBy', { date: updatedAtFormatted }) as string}
                />
                <Typography variant={TypographyVariant.LabelLg}>{author}</Typography>
            </div>
        </div>
    );
};

interface NotesTabContentProps {
    isLoading: boolean;
    caseNotes: NoteInstance[] | undefined;
    isError: boolean;
    statusCode: number | undefined;
}
const NotesTabContent = ({ isLoading, caseNotes, isError, statusCode }: NotesTabContentProps) => {
    const { t } = useTranslation();

    if (isLoading) {
        return (
            <div className="p-8">
                <PageLoader variant={PageLoaderVariant.Center} />
            </div>
        );
    }

    if (statusCode === StatusCode.Forbidden) {
        return <UnauthorizedCard />;
    }

    if (isError || !caseNotes?.length) {
        return (
            <div className="flex justify-center">
                <CardInfo
                    icon={<AnnotationsIcon width={50} height={50} className="text-gray-300" />}
                    title={t('sideSheet.notesEmptyTitle')}
                    subtitle={t('sideSheet.notesEmptyText')}
                    className="mt-8"
                />
            </div>
        );
    }

    return (
        <div className="flex flex-col">
            {caseNotes?.map(note => (
                <NoteItem key={note.id} note={note} />
            ))}
        </div>
    );
};

interface NotesTabProps {
    caseDetails: Case;
    includeInternal?: boolean;
}

export default function NotesTab({ caseDetails, includeInternal = false }: NotesTabProps) {
    const { t } = useTranslation();
    const { data, isLoading } = useQuery({
        queryKey: ['caseNotes', caseDetails?.id, includeInternal],
        queryFn: () => getCaseNotesQuery(caseDetails?.id, includeInternal),
    });

    return (
        <CardContainer>
            <div>
                <Typography variant={TypographyVariant.H2}>{t(`caseOverview.tabs.notes`)}</Typography>
            </div>
            <NotesTabContent isLoading={isLoading} caseNotes={data?.caseNotes} isError={false} statusCode={data?.statusCode} />
        </CardContainer>
    );
}
