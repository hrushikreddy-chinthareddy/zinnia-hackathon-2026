export const replacePlaceholders = (template: any, data: Record<string, any>): any => {
    if (typeof template === 'string') {
        return template.replace(/{{(.*?)}}/g, (match, p1) => {
            // Split by dot (.) and handle array indices (numbers inside [])
            let keys = p1.split(/\.|\[|\]/).filter(Boolean);
            if (keys[0] === "data") {
                keys = keys.slice(1);
            }
            return (
                keys.reduce((obj: any, key: string, index: number) => {
                    if (obj === undefined || obj === null) return undefined;
                    const numericKey = Number(key);

                    // Check if the key is an array index
                    if (!isNaN(numericKey)) {
                        return obj[numericKey];
                    }
                    return obj[key];
                }, data) || match

            );
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
