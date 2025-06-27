import { DEFAULT_ERROR_STRING } from '@zinnia/utils';
import { TFunction } from 'next-i18next';

import { DataDefinition, KeyObjectDef } from '@deps/types/data';

import { percentFormatify } from './numbers.helpers';
import { getObjDeepValue } from './objects.helpers';

export const fillColDefs = <T extends object>(
    obj: T,
    colDef: DataDefinition<T>[],
    t?: TFunction,
    translationPath = 'common.default'
) => {
    if (!obj) return colDef;

    for (let colIndex = 0; colIndex < colDef.length; colIndex++) {
        const { key, accessKey, defaultValue, format } = colDef[colIndex];
        let value = getObjDeepValue(obj, key);

        const emptyValue = defaultValue !== undefined ? defaultValue : '-';

        if (value === undefined || value === null || value === '') {
            value = emptyValue;
        }

        colDef[colIndex].value =
            format && value !== emptyValue ? format(value) : value;

        if (t) {
            if (translationPath) {
                colDef[colIndex].label = t(
                    `${translationPath}.${accessKey ?? key}`
                );

                colDef[colIndex].tooltip = colDef[colIndex].tooltip
                    ? t(`${translationPath}.${accessKey ?? key}Tooltip`)
                    : '';

                colDef[colIndex].tooltipBody = colDef[colIndex].tooltip
                    ? t(`${translationPath}.${accessKey ?? key}TooltipBody`)
                    : '';

                colDef[colIndex].groupLabel = colDef[colIndex].group
                    ? t(`${translationPath}.groups.${colDef[colIndex].group}`)
                    : '';
            } else {
                colDef[colIndex].label = t(translationPath);
                colDef[colIndex].tooltip = colDef[colIndex].tooltip
                    ? t(translationPath)
                    : '';
                colDef[colIndex].groupLabel = colDef[colIndex].group
                    ? t(translationPath)
                    : '';
            }
        }
    }
    return colDef;
};

export const defToObject = <T extends object>(colDef: DataDefinition<T>[]) => {
    const obj = {} as KeyObjectDef;

    for (let colIndex = 0; colIndex < colDef.length; colIndex++) {
        const { key, accessKey, value } = colDef[colIndex];
        if (accessKey) {
            obj[accessKey] = value;
        } else {
            obj[key] = value;
        }
    }

    return obj;
};

/**
 * Filters out falsy properties from the given object.
 * currently used for optional prop spreading
 * so only truthy props are passed to child component
 * (ex. tooltip either shows up or doesn't)
 *
 * @function
 * @template T
 * @param {T} obj - An object with potential falsy values.
 * @returns {Partial<T>} An object containing only the truthy properties from the input object.
 *
 * @example
 * const input = { a: 'value', b: null, c: 0, d: 'another' };
 * const output = filterTruthyProps(input);
 * console.log(output); // { a: 'value', d: 'another' }
 */

export function filterTruthyProps<T extends object>(obj: T): Partial<T> {
    return Object.keys(obj).reduce((acc, key) => {
        const k = key as keyof T;
        if (obj[k]) {
            acc[k] = obj[k];
        }
        return acc;
    }, {} as Partial<T>);
}

// Some rate values are returned as their decimal values (ex. 0.05) and some are
// returned as their whole number value (ex. 5). This function is meant to
// account for both cases.
export function rateFormatted(value?: number | null) {
    if (value == null) {
        return DEFAULT_ERROR_STRING;
    }

    return percentFormatify(value, { isInteger: value > 1 });
}
