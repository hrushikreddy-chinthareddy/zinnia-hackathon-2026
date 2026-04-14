import { WidgetProps } from '@rjsf/utils';
import clsx from 'clsx';

import textFieldStyles from '@deps/components/dynamic-form/components/text-field/text-field.module.css';
import { US_ZIP_DATALIST_VALUES } from '@deps/constants/us-zip-datalist';

/**
 * ZIP field with datalist: pick from suggestions (dropdown-style) or type any ZIP.
 * Pairs with {@link injectTransactionAddressUi} so Address blocks use this by default.
 */
function ZipCodeWidget(props: WidgetProps) {
    const {
        id,
        value,
        disabled,
        rawErrors,
        onChange,
        placeholder,
        readonly,
        hideError,
    } = props;

    if (readonly) {
        return <>{value ?? ''}</>;
    }

    const listId = `${id.replace(/:/g, '_')}_zip_datalist`;
    let status: '' | 'error' | 'success' = '';
    if (hideError && rawErrors?.length) {
        status = '';
    } else if (rawErrors?.length) {
        status = 'error';
    }

    const classes = clsx(
        textFieldStyles.textField,
        textFieldStyles.small,
        status && textFieldStyles[status] ? textFieldStyles[status] : '',
        'w-full max-w-none'
    );

    return (
        <div className="flex w-full min-w-0 max-w-none flex-col">
            <input
                id={id}
                className={classes}
                disabled={disabled}
                list={listId}
                placeholder={placeholder ?? 'ZIP code'}
                value={value ?? ''}
                onChange={(e) => onChange(e.target.value)}
                autoComplete="postal-code"
                inputMode="numeric"
            />
            <datalist id={listId}>
                {US_ZIP_DATALIST_VALUES.map((z) => (
                    <option key={z} value={z} />
                ))}
            </datalist>
        </div>
    );
}

export default ZipCodeWidget;
