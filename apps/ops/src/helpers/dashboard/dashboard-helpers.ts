import { toTitleCase } from '@zinnia/utils';

export const sortAlphabetically = (a: any, b: any, key?: string) => {
    let aa: string = '';
    let bb: string = '';

    if (typeof a === 'string') {
        aa = a.toUpperCase();
    } else if (key) {
        aa = a[key];
    }

    if (typeof b === 'string') {
        bb = b.toUpperCase();
    } else if (key) {
        bb = b[key];
    }

    if (aa < bb) {
        return -1;
    }
    if (aa > bb) {
        return 1;
    }
    return 0;
};

export const DASHBOARD_REPLACE_LABELS = ['', null, undefined, 'NULL_VALUE'];

export const DASHBOARD_DEFAULT_LABEL = '[UNKNOWN]';

export const dashboardChartTitleFormat = (label: string, length?: number | boolean) => {
    if (!label || DASHBOARD_REPLACE_LABELS.includes(label)) return DASHBOARD_DEFAULT_LABEL;
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

export const oneYearAgoISO = new Date(new Date().setFullYear(new Date().getFullYear() - 1)).toISOString();
