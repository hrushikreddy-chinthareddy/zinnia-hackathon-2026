import {
    FormContextType,
    RJSFSchema,
    StrictRJSFSchema,
    WidgetProps,
} from '@rjsf/utils';
import { useCallback } from 'react';

import { RadioVariant } from '@deps/components/radio/radio';
import { radioClasses } from '@deps/components/radio/radio.helpers';

import styles from './issue-resolved-widget.module.css';

const ISSUE_RESOLVED_LABELS: Record<string, string> = {
    yes: 'Yes',
    true: 'Yes',
    false: 'No',
    no_missing: 'No, it has missing information',
    no_mismatched: 'No, it has mismatched information',
};

export type IssueResolvedRadioWidgetProps<
    T,
    S extends StrictRJSFSchema,
    F extends FormContextType
> = WidgetProps<T, S, F>;
function IssueResolvedRadioWidget<
    T = any,
    S extends StrictRJSFSchema = RJSFSchema,
    F extends FormContextType = any
>(widgetProps: IssueResolvedRadioWidgetProps<T, S, F>) {
    const { options, value, disabled, onChange, id, readonly } = widgetProps;
    const { enumOptions } = options;

    const valueArray = Array.isArray(value) ? value : value ? [value] : [];
    const hasYes = valueArray.includes('yes');
    const hasMissing = valueArray.includes('no_missing');
    const hasMismatched = valueArray.includes('no_mismatched');

    const classes = radioClasses(RadioVariant.Default);
    const disabledClass = disabled
        ? 'cursor-not-allowed opacity-50'
        : 'cursor-pointer';

    const handleYesChange = useCallback(
        (checked: boolean) => {
            if (checked) {
                onChange(['yes']);
            } else {
                onChange([]);
            }
        },
        [onChange]
    );

    const handleMissingChange = useCallback(
        (checked: boolean) => {
            if (checked) {
                const newValue = hasMismatched
                    ? ['no_missing', 'no_mismatched']
                    : ['no_missing'];
                onChange(newValue);
            } else {
                const newValue = hasMismatched ? ['no_mismatched'] : [];
                onChange(newValue);
            }
        },
        [hasMismatched, onChange]
    );

    const handleMismatchedChange = useCallback(
        (checked: boolean) => {
            if (checked) {
                const newValue = hasMissing
                    ? ['no_missing', 'no_mismatched']
                    : ['no_mismatched'];
                onChange(newValue);
            } else {
                const newValue = hasMissing ? ['no_missing'] : [];
                onChange(newValue);
            }
        },
        [hasMissing, onChange]
    );

    if (readonly) {
        const values = Array.isArray(value)
            ? value
            : value !== undefined && value !== null
            ? [String(value)]
            : [];
        const displayValue = values
            .map(
                (v: string) =>
                    ISSUE_RESOLVED_LABELS[v] ||
                    enumOptions?.find(
                        (option) => String(option.value) === String(v)
                    )?.label ||
                    v
            )
            .join(', ');
        return (
            <div className="text-base text-gray-900 font-semibold mb-4">
                {displayValue || '-'}
            </div>
        );
    }

    return (
        <div
            className={`flex flex-col items-start gap-4 ${styles.checkboxWrapper}`}
        >
            <div className="flex flex-row gap-3 items-center rounded-sm">
                <input
                    type="checkbox"
                    id={`${id}-yes`}
                    checked={hasYes}
                    onChange={(e) => handleYesChange(e.target.checked)}
                    disabled={disabled}
                    className={`${classes} ${disabledClass}`}
                />
                <label
                    htmlFor={`${id}-yes`}
                    className="body-sm cursor-pointer"
                    aria-label="Select Yes"
                >
                    {ISSUE_RESOLVED_LABELS.yes}
                </label>
            </div>

            <div className="flex flex-row gap-3 items-center">
                <input
                    type="checkbox"
                    id={`${id}-missing`}
                    checked={hasMissing}
                    onChange={(e) => handleMissingChange(e.target.checked)}
                    disabled={disabled}
                    className={`${classes} ${disabledClass}`}
                />
                <label
                    htmlFor={`${id}-missing`}
                    className="body-sm cursor-pointer"
                    aria-label="Select No, it has missing information"
                >
                    {ISSUE_RESOLVED_LABELS.no_missing}
                </label>
            </div>

            <div className="flex flex-row gap-3 items-center">
                <input
                    type="checkbox"
                    id={`${id}-mismatched`}
                    checked={hasMismatched}
                    onChange={(e) => handleMismatchedChange(e.target.checked)}
                    disabled={disabled}
                    className={`${classes} ${disabledClass}`}
                />
                <label
                    htmlFor={`${id}-mismatched`}
                    className="body-sm cursor-pointer"
                    aria-label="Select No, it has mismatched information"
                >
                    {ISSUE_RESOLVED_LABELS.no_mismatched}
                </label>
            </div>
        </div>
    );
}

export default IssueResolvedRadioWidget;
export { IssueResolvedRadioWidget as IssueResolvedDisplayWidget };
