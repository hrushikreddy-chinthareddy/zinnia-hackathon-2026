import { FieldErrorProps, FormContextType, RJSFSchema, StrictRJSFSchema, errorId } from '@rjsf/utils';
import { AssistiveText, AssistiveTextVariant } from '@zinnia/bloom/components';

export default function FieldErrorTemplate<T = any, S extends StrictRJSFSchema = RJSFSchema, F extends FormContextType = any>(
    props: FieldErrorProps<T, S, F>
) {
    const { errors = [], idSchema } = props;
    if (errors.length === 0) {
        return null;
    }
    const id = errorId<T>(idSchema);

    return (
        <ul id={id}>
            {errors.map((error, i) => {
                return <AssistiveText key={i} text={props.schema.title + ' ' + error.toString()} variant={AssistiveTextVariant.Error} />;
            })}
        </ul>
    );
}
