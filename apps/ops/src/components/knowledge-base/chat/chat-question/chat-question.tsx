import { Icon, IconType } from '@zinnia/bloom/components';

import Typography, {
  TypographyVariant,
} from '@deps/components/typography/typography';

import styles from './chat-question.module.css';

type ChatQuestionProps = {
  question: string;
};

const ChatQuestion = ({ question }: ChatQuestionProps) => {
  return (
    <div className="flex gap-2 items-start">
      <div className={`${styles.avatar}`} data-testid="question-avatar">
        <Icon type={IconType.USER} />
      </div>
      <div className={`${styles.messageContainer}`}>
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