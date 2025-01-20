export const replacePlaceholders = (template: any, data: Record<string, any>): any => {
    if (typeof template === 'string') {
        return template.replace(/{{(.*?)}}/g, (match, p1) => {
            const keys = p1.split('.');
            return keys.reduce((obj: any, key: string) => (obj ? obj[key] : undefined), data) || match;
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
