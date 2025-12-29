import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';

import styles from './chat-question.module.css';

type ChatQuestionProps = {
    question: string;
};

const ChatQuestion = ({ question }: ChatQuestionProps) => {
    return (
        <div className="flex items-start justify-end">
            <div className={`${styles.messageContainer} bg-gray-100`}>
                <div className="flex gap-2 items-start justify-between">
                    <Typography variant={TypographyVariant.BodyBold}>
                        {question}
                    </Typography>
                </div>
            </div>
        </div>
    );
};

export default ChatQuestion;
