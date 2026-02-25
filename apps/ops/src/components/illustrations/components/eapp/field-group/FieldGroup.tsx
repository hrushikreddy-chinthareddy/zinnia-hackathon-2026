import {
    RenderingFieldGroup,
    isRenderingRepeatedFieldGroup,
    RenderingField,
    Language,
} from '@zinnia/form-engine-sdk';
import ReactHtmlParser from 'html-react-parser';
import { Fragment, memo, ReactElement, useMemo } from 'react';

import style from './fieldGroup.module.css';
import { useQuestionnaireEngine } from '../../../providers/QuestionnaireEngineProvider';
import { ReadOnlyField } from '../field/common';
import { Field } from '../field/Field';

type FieldGroupProps = {
    fieldGroup: RenderingFieldGroup;
};

const noop = () => undefined;

export const FieldGroup = memo(InnerFieldGroup);

export function InnerFieldGroup(props: FieldGroupProps): ReactElement | null {
    const { fieldGroup } = props;
    // TODO: have this pass from whatever context to retrieve the user platform language
    const language = Language.en;

    const { questionnaireEngine } = useQuestionnaireEngine();

    const onAnswerChange = useMemo(() => {
        return questionnaireEngine.updateAnswers.bind(questionnaireEngine);
    }, [questionnaireEngine]);

    if (!fieldGroup.visible) return <Fragment />;

    if (isRenderingRepeatedFieldGroup(fieldGroup)) {
        return (
            <div>
                <div className={style.fieldGroupHeader}>
                    {fieldGroup.title && (
                        <p className="typography-desktop-headline-3-d">
                            {ReactHtmlParser(fieldGroup.title)}
                        </p>
                    )}
                    {fieldGroup.text && (
                        <p className="typography-labels-label-sm-alt">
                            {ReactHtmlParser(fieldGroup.text)}
                        </p>
                    )}
                </div>
                <div>
                    {fieldGroup.fields.map((field: RenderingField, index) => {
                        const key = `${field.id}${
                            field.appendToKeyValue
                                ? field.appendToKeyValue
                                : index
                        }`;
                        if (field.readOnly) {
                            return <div key={key}> TODO: ReadOnly field</div>;
                            // TODO: readonly field
                        }
                    })}
                </div>
            </div>
        );
    }

    if (!fieldGroup?.fields?.length || fieldGroup.fields.length === 0) {
        return null;
    }

    return (
        <div className={style.questionContainer}>
            <div className={style.questionHeaderWrapper}>
                {fieldGroup.title && <p>{ReactHtmlParser(fieldGroup.title)}</p>}
                {fieldGroup.text && (
                    <p className="typography-content-body">
                        {ReactHtmlParser(fieldGroup.text)}
                    </p>
                )}
            </div>
            <div className={style.fieldGroup}>
                {fieldGroup.fields.map(
                    (field: RenderingField, index: number) => {
                        const key = `${field.id}${
                            field.appendToKeyValue
                                ? field.appendToKeyValue
                                : index
                        }`;

                        if (field.readOnly) {
                            return <ReadOnlyField key={key} field={field} />;
                            // TODO: readonly field
                        }

                        return (
                            <Field
                                key={key}
                                field={field}
                                onAnswerChange={onAnswerChange}
                                onAnswerComplete={noop}
                                locale={language}
                                disabled={field.disabled}
                            />
                        );
                    }
                )}
            </div>
        </div>
    );
}
