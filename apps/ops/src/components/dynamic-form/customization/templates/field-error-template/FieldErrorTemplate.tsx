import { FieldErrorProps, FormContextType, RJSFSchema, StrictRJSFSchema, errorId } from '@rjsf/utils';

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
                return (
                    <li key={i} className="border-0 m-0 p-0">
                        <small className="m-0 text-red-600">*{error}</small>
                    </li>
                );
            })}
        </ul>
    );
}
