import { AddressFormFields } from '@deps/models/case/task';

export const replacePlaceholders = (
    template: any,
    data: Record<string, any>,
    returnEmptyOnNoMatch: boolean = false,
    replaceUnderscores: boolean = false
): any => {
    if (typeof template === 'string') {
        return template.replace(/{{(.*?)}}/g, (match, p1) => {
            let keys = p1.split(/\.|\[|\]/).filter(Boolean);

            if (keys[0] === 'data') {
                keys = keys.slice(1);
            }

            const result = keys.reduce((obj: any, key: string) => {
                if (obj === undefined || obj === null) return undefined;
                const numericKey = Number(key);

                // Check if the key is an array index

                if (!isNaN(numericKey)) {
                    return obj[numericKey];
                }
                return obj[key];
            }, data);

            if (result === undefined) {
                return returnEmptyOnNoMatch ? '' : match;
            }
            if (typeof result === 'object' && result !== null) {
                return JSON.stringify(result);
            }
            if (replaceUnderscores) {
                return result.replace(/_/g, ' ');
            }
            return result;
        });
    } else if (Array.isArray(template)) {
        return template.map((item) => replacePlaceholders(item, data));
    } else if (typeof template === 'object' && template !== null) {
        const result: Record<string, any> = {};
        for (const key in template) {
            if (Object.prototype.hasOwnProperty.call(template, key)) {
                result[key] = replacePlaceholders(template[key], data);
            }
        }
        return result;
    } else {
        return template;
    }
};

export const formatAddressLines = (
    addressLines?: any[]
): Record<string, string> => {
    if (!addressLines) {
        return {};
    }
    const formattedAddressLines: Record<string, string> = {};
    addressLines.forEach((line, index) => {
        if (!line?.addressVal) {
            return;
        }
        formattedAddressLines[`addressLine${index + 1}`] = line.addressVal;
    });
    return formattedAddressLines;
};

export const formatDirtyAddress = (
    dirtyFields: AddressFormFields
): Record<string, string> => {
    const addressParts: Record<string, string> = {};
    if (dirtyFields) {
        if (
            Object.hasOwn(dirtyFields, 'addressLines') &&
            Array.isArray(dirtyFields.addressLines)
        ) {
            dirtyFields.addressLines.forEach((addr, index) => {
                addressParts[`addressLine${index + 1}`] = addr;
            });
        }

        for (const [key, value] of Object.entries(dirtyFields || {})) {
            if (value !== undefined && value !== null && value !== '') {
                addressParts[key] = value as string;
            }
        }
    }
    return addressParts;
};
