import { useTranslation } from 'react-i18next';

import SelectComponent from '@deps/components/select/select';
import { TranslationFiles } from '@deps/config/translations';
import { AnswerMode } from '@deps/types/knowledge-base';

type AnswerModeProps = {
    isStreaming: boolean;
    modeSelected: AnswerMode;
    onModeSelectedChange: (mode: AnswerMode) => void;
};
const AnswerModeSelect = ({
    isStreaming,
    modeSelected,
    onModeSelectedChange,
}: AnswerModeProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: 'zinniaAiAssistant',
    });

    const answerModeOptions = [
        {
            value: AnswerMode.Short,
            textValue: AnswerMode.Short,
            label: t('chat.answerModeOptions.short'),
        },
        {
            value: AnswerMode.Long,
            textValue: AnswerMode.Long,
            label: t('chat.answerModeOptions.long'),
        },
    ];

    return (
        <SelectComponent
            className="block! !w-[200px]"
            value={modeSelected}
            options={answerModeOptions}
            onChange={(mode) => onModeSelectedChange(mode as AnswerMode)}
            label={t('chat.answerMode') || ''}
            disabled={isStreaming}
        />
    );
};

export default AnswerModeSelect;
