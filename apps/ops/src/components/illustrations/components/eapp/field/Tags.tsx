import { Tag, TagVariant } from '@zinnia/bloom/components';
import { RenderingCustomField } from 'node_modules/@zinnia/form-engine-sdk/dist/esm/questionnaire-engine/renderingTransforms/RenderingQuestionnaire';

import { useQuestionnaireEngine } from '@deps/components/illustrations/providers/QuestionnaireEngineProvider';
import { PiiWrapper } from '@deps/components/pii/PiiWrapper';

import style from './field.module.css';

interface Props {
    field: RenderingCustomField;
}

export function Tags(props: Props) {
    const { field } = props;
    const { questionnaireEngine } = useQuestionnaireEngine();

    const tagNodeIds = field.customProperties?.['tagNodeIds'] ?? [];
    const tags = (tagNodeIds as string[]).map((tagNodeId) => {
        const tag = questionnaireEngine.getAnswer(tagNodeId);
        return tag;
    });

    if (field.text) {
        tags.unshift(field.text);
    }

    if (tags.length > 0) {
        return (
            <PiiWrapper>
                <Tag
                    text={tags.join(' ')}
                    variant={TagVariant.White}
                    className={style.fieldTag}
                />
            </PiiWrapper>
        );
    }
    return <></>;
}
