import { FieldTemplateProps, getUiOptions } from '@rjsf/utils';
import { Label, Tooltip, TooltipPlacement } from '@zinnia/bloom/components';
import clsx from 'clsx';

import { ReactComponent as CircleInfoIcon } from '@deps/styles/elements/icons/circles/circle-info.svg';

import styles from './field-template/field-template.module.css';
import { calculateDifference } from '../../helpers/object.helpers';

type FormContextOptions = {
    keyName: string;
    details: string;
    mainObject: string;
    minuend: string;
    subtrahend: string;
};

const DifferenceTemplate = (props: FieldTemplateProps): JSX.Element => {
    const { id, schema, required, description, errors, children, readonly, formData, classNames, uiSchema, hideError = false } = props;

    const formContextOptions: FormContextOptions = uiSchema?.['ui:options']?.formContext as FormContextOptions;

    const uiOptions = getUiOptions(uiSchema);
    const helpText = uiOptions.help;
    const style = uiOptions?.style ?? '';
    let { displayLabel } = props;

    if (uiOptions.label === false) {
        displayLabel = false;
    }

    const helpInformation = helpText && (
        <Tooltip
            trigger={<CircleInfoIcon onClick={e => e.preventDefault()} height={'16px'} width={'16px'} className="text-primary" />}
            placement={TooltipPlacement.TopRight}
        >
            {helpText}
        </Tooltip>
    );
    const fieldLabel = schema?.title ? `${schema.title} ${required ? '*' : ''}` : '';

    const difference = calculateDifference(props.formContext, formContextOptions);

    if (typeof difference === 'number') {
        return (
            <>
                <div className={styles.children}>
                    {fieldLabel && (
                        <div className="mb-2">
                            <Label labelFor={props.id} interactiveElements={[helpInformation]}>
                                <span className={clsx('text-md font-medium', style as string)}>{fieldLabel}</span>
                            </Label>
                        </div>
                    )}
                    {description}
                    <div className={'text-field_textField__d9daI max-w-sm'}>{difference}</div>
                    {!hideError && errors}
                </div>
            </>
        );
    } else {
        return <></>;
    }
};

export default DifferenceTemplate;
