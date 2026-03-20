import { WidgetProps } from '@rjsf/utils';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import SelectComponent from '@deps/components/select/select';
import { TranslationFiles } from '@deps/config/translations';
import { Action } from '@deps/constants/policy';

import styles from './party-role-widget.module.css';

const PartyRoleWidget = ({
    id,
    value,
    disabled,
    readonly,
    required,
    onChange,
    placeholder,
    formContext,
    options,
    schema,
}: WidgetProps) => {
    const [validationError, setValidationError] = useState<string | null>(null);
    const { t } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: 'selfServeTransaction.annuitantChange',
    });

    const maxPerRole = useMemo(
        () => formContext?.customData?.maxPerRole || {},
        [formContext?.customData?.maxPerRole]
    );
    const validationMessage = useMemo(
        () => formContext?.customData?.validationMessage || '',
        [formContext?.customData?.validationMessage]
    );

    // Extract current index from widget id
    const currentIndex = useMemo(() => {
        const patterns = [
            /_partyUpdates_(\d+)_partyRole/,
            /_actionData_(\d+)_partyRole/,
            /_(\d+)_partyRole/,
        ];

        for (const pattern of patterns) {
            const match = id.match(pattern);
            if (match) {
                return parseInt(match[1], 10);
            }
        }
        return -1;
    }, [id]);

    const allActions = useMemo(() => {
        const parentActionData = formContext?.parentActionData || [];
        return parentActionData.map((item: any) => item?.action).join(',');
    }, [formContext?.parentActionData]);

    const validateRoleSelection = useCallback(
        (selectedRole: string): string | null => {
            if (!selectedRole) return null;

            const parentActionData = formContext?.parentActionData || [];
            const currentItem = parentActionData[currentIndex];
            if (currentItem?.action === Action.DELETE) {
                return null;
            }
            const maxAllowed = maxPerRole[selectedRole];
            if (maxAllowed === undefined) return null;

            const activeWithRole = parentActionData.filter(
                (item: any, index: number) =>
                    index !== currentIndex &&
                    item?.partyRole === selectedRole &&
                    item.action !== Action.DELETE
            );
            if (activeWithRole.length >= maxAllowed) {
                return (
                    validationMessage ||
                    t('validationMessage', {
                        selectedRole: selectedRole.toLowerCase(),
                        maxAllowed,
                    })
                );
            }
            return null;
        },
        [
            maxPerRole,
            formContext?.parentActionData,
            currentIndex,
            validationMessage,
            t,
        ]
    );

    const selectOptions = useMemo(() => {
        const enumValues = schema.enum || [];
        const enumNames = options.enumNames || [];

        return enumValues.map((val, index) => ({
            label: String(enumNames[index] || val),
            value: String(val),
        }));
    }, [schema.enum, options.enumNames]);

    const handleChange = useCallback(
        (selectedValue: string) => {
            const error = validateRoleSelection(selectedValue);
            setValidationError(error);
            onChange(selectedValue);
        },
        [onChange, validateRoleSelection]
    );

    useEffect(() => {
        if (value) {
            const error = validateRoleSelection(value);
            setValidationError(error);
        }
    }, [allActions, value, validateRoleSelection]);

    return readonly ? (
        value
    ) : (
        <div className={styles.partyRoleContainer}>
            <SelectComponent
                id={id}
                value={value}
                onChange={handleChange}
                options={selectOptions}
                disabled={disabled || readonly}
                required={required}
                message={validationError || ''}
                placeholder={placeholder || t('placeholder') || ''}
            />
        </div>
    );
};

export default PartyRoleWidget;
