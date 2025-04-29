import { AddressFormFields } from '@deps/models/case/task';

export const replacePlaceholders = (template: any, data: Record<string, any>, returnEmptyOnNoMatch: boolean = false): any => {
    if (typeof template === 'string') {
        return template.replace(/{{(.*?)}}/g, (match, p1) => {
            let keys = p1.split(/\.|\[|\]/).filter(Boolean);

            if (keys[0] === 'data') {
                keys = keys.slice(1);
            }

            const result = keys.reduce((obj: any, key: string, index: number) => {
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
            return result;
        });
    } else if (Array.isArray(template)) {
        return template.map(item => replacePlaceholders(item, data));
    } else if (typeof template === 'object' && template !== null) {
        const result: Record<string, any> = {};
        for (const key in template) {
            if (template.hasOwnProperty(key)) {
                result[key] = replacePlaceholders(template[key], data);
            }
        }
        return result;
    } else {
        return template;
    }
};

export const formatAddressLines = (addressLines?: any[]): Record<string, string> => {
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

export const formatDirtyAddress = (dirtyFields: AddressFormFields): string => {
    const order = ['addressLines', 'country', 'state', 'city', 'zip'];
    return order
        .map((field: string) => {
            if (field === 'addressLines' && Array.isArray(dirtyFields.addresses)) {
                const formattedAddressLines = formatAddressLines(dirtyFields.addresses);
                return Object.values(formattedAddressLines).join(', ');
            } else {
                return dirtyFields[field as keyof AddressFormFields]?.toString() || '';
            }
        })
        .filter(Boolean)
        .join(', ');
};
