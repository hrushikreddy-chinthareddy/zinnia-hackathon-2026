import { toTitleCase } from '@zinnia/utils';

export const sankeyTitleFormat = (label: string, length?: number | boolean) => {
    if (!label) return '[UNKNOWN]';
    label = label.replace(/_/g, ' ');
    label = toTitleCase(label);
    label = getLabelSubString(label, length);
    return label;
};

export const getLabelSubString = (label: string, length: number | boolean = 25) => {
    if (!label) {
        return '';
    }
    if (length === false) {
        return label;
    }
    if (length === true) {
        length = 25;
    }
    return label.length > length ? `${label.substring(0, length)}...` : label;
};
