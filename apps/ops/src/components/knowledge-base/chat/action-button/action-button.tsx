import { useTranslation } from 'react-i18next';

import Button from '@deps/components/button/button';
import { TranslationFiles } from '@deps/config/translations';

import styles from './action-button.module.css';
import SendIcon from './icons/send-icon';
import StopIcon from './icons/stop-icon';

const ActionButton = ({
    ariaLabel,
    message,
    disabled,
    handleMessageSend,
    isStreaming = false,
    handleStopResponse,
}: {
    ariaLabel?: string;
    message: string;
    disabled?: boolean;
    isStreaming?: boolean;
    handleMessageSend: (message: string) => void;
    handleStopResponse: () => void;
}) => {
    const { t } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: 'zinniaAiAssistant',
    });

    const handleOnClick = () => {
        if (isStreaming) handleStopResponse();
        else handleMessageSend(message);
    };

    return (
        <Button
            aria-label={ariaLabel || `${isStreaming ? 'stop' : 'send'}-button`}
            className={`${styles.actionButton}`}
            disabled={disabled}
            onClick={handleOnClick}
        >
            <div className={styles.dotsBorder}></div>
            {isStreaming ? (
                <>
                    <div className={styles.stopIconWrap}>
                        <StopIcon />
                    </div>
                    <span className={styles.textButton}>{t('chat.stop')}</span>
                </>
            ) : (
                <>
                    <SendIcon />
                    <span className={styles.textButton}>{t('chat.send')}</span>
                </>
            )}
        </Button>
    );
};

export default ActionButton;
