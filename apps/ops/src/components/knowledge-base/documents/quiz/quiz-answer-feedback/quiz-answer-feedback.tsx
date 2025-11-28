import { useTranslation } from 'react-i18next';

import AssistiveText, {
    AssistiveTextVariant,
} from '@deps/components/assistive-text/assistive-text';
import NavElement, {
    NavElementType,
} from '@deps/components/nav-element/nav-element';
import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import { TranslationFiles } from '@deps/config/translations';

type QuizAnswerFeedbackProps = {
    isCorrect: boolean;
    documentInfo: {
        documentName: string;
        documentWebUrl: string;
    } | null;
    correctAnswerIndex: number;
    correctAnswer: string;
};

const QuizAnswerFeedback = ({
    isCorrect,
    documentInfo = null,
    correctAnswerIndex,
    correctAnswer,
}: QuizAnswerFeedbackProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: 'zinniaAiAssistant',
    });
    return (
        <div className="flex flex-col gap-2">
            <AssistiveText
                variant={
                    isCorrect
                        ? AssistiveTextVariant.Success
                        : AssistiveTextVariant.Error
                }
                text={
                    isCorrect
                        ? t('sidenav.quiz.correctAnswer')
                        : t('sidenav.quiz.wrongAnswer')
                }
            />
            {!isCorrect && (
                <>
                    <Typography
                        variant={TypographyVariant.BodySmBold}
                        className="text-semantic-success"
                    >
                        <span className="text-gray-400">
                            {t('sidenav.quiz.correctAnswer')}:&nbsp;
                        </span>
                        <strong>
                            {String.fromCharCode(65 + correctAnswerIndex)}
                            .&nbsp;
                        </strong>
                        {correctAnswer}
                    </Typography>

                    {documentInfo && (
                        <Typography
                            variant={TypographyVariant.BodySmBold}
                            className="mb-2 bg-red-200 p-2"
                        >
                            {t('sidenav.quiz.readMore')}:&nbsp;
                            <NavElement
                                type={NavElementType.Link}
                                className="underline"
                                target="_blank"
                                href={documentInfo.documentWebUrl}
                                rel="noreferrer"
                            >
                                {documentInfo.documentName}
                            </NavElement>
                        </Typography>
                    )}
                </>
            )}
        </div>
    );
};

export default QuizAnswerFeedback;
