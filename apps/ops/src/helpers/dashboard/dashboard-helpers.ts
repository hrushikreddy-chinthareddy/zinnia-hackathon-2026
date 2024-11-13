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
