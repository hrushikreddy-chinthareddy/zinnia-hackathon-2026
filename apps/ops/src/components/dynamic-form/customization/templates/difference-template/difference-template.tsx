import { FieldTemplateProps, getUiOptions } from '@rjsf/utils';
import { Label, Tooltip, TooltipPlacement } from '@zinnia/bloom/components';
import clsx from 'clsx';

import { ReactComponent as CircleInfoIcon } from '@deps/styles/elements/icons/circles/circle-info.svg';

import classes from './difference-template.module.css';
import { calculateDifference } from '../../../helpers/object.helpers';
import styles from '../field-template/field-template.module.css';

type FormContextOptions = {
    keyName: string;
    details: string;
    mainObject: string;
    minuend: string;
    subtrahend: string;
};

const DifferenceTemplate = (props: FieldTemplateProps): JSX.Element => {
    const {
        schema,
        required,
        description,
        errors,
        readonly,
        uiSchema,
        hideError = false,
    } = props;

    const formContextOptions: FormContextOptions = uiSchema?.['ui:options']
        ?.formContext as FormContextOptions;

    const uiOptions = getUiOptions(uiSchema);
    const helpText = uiOptions.help;
    const style = uiOptions?.style ?? '';

    const helpInformation = helpText && (
        <Tooltip
            trigger={
                <span tabIndex={0}>
                    <CircleInfoIcon
                        onClick={(e) => e.preventDefault()}
                        height={'16px'}
                        width={'16px'}
                        className="tooltip-primary"
                    />
                </span>
            }
            placement={TooltipPlacement.TopRight}
            triggerClassName="w-fit"
            replaceElement
        >
            {helpText}
        </Tooltip>
    );
    const fieldLabel = schema?.title
        ? `${schema.title} ${required ? '*' : ''}`
        : '';

    const difference = calculateDifference(
        props.formContext,
        formContextOptions
    );

    if (typeof difference === 'number') {
        return (
            <>
                <div className={styles.children}>
                    {fieldLabel && (
                        <div className="mb-2">
                            <Label
                                labelFor={props.id}
                                interactiveElements={[helpInformation]}
                            >
                                <span
                                    className={clsx(
                                        'text-[14px] font-bold',
                                        style as string
                                    )}
                                >
                                    {fieldLabel}
                                </span>
                            </Label>
                        </div>
                    )}
                    {description}
                    <div
                        className={
                            readonly ? 'max-w-sm' : `${classes.field} max-w-sm`
                        }
                    >
                        {difference}
                    </div>
                    {!hideError && errors}
                </div>
            </>
        );
    } else {
        return <></>;
    }
};

export default DifferenceTemplate;
