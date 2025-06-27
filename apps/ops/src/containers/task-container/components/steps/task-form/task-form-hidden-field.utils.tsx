type HiddenFieldMapping = {
    sourcePath: string;
    targetPath: string;
};
export const applyHiddenFieldPopulation = (
    formData: any,
    uiSchema: any
): any => {
    const mappings = extractHiddenFieldMappings(uiSchema);
    const updatedFormData = structuredClone(formData);

    for (const { sourcePath, targetPath } of mappings) {
        const value = getValueByPath(formData, sourcePath);
        if (value !== undefined) {
            setValueByPath(updatedFormData, targetPath, value);
        }
    }

    return updatedFormData;
};

const extractHiddenFieldMappings = (
    uiNode: any,
    path: string[] = []
): HiddenFieldMapping[] => {
    let mappings: HiddenFieldMapping[] = [];
    for (const key in uiNode) {
        const currentPath = [...path, key];
        const value = uiNode[key];
        if (value?.['ui:options']?.hiddenFieldToPopulate) {
            const sourcePath = currentPath.join('.');

            const parentPath = currentPath.slice(0, -1).join('.');
            const targetFieldName = value['ui:options'].hiddenFieldToPopulate;
            const targetPath = parentPath
                ? parentPath + '.' + targetFieldName
                : targetFieldName;
            mappings.push({ sourcePath, targetPath });
        }
        // Recurse if nested object
        if (typeof value === 'object' && value !== null) {
            mappings = mappings.concat(
                extractHiddenFieldMappings(value, currentPath)
            );
        }
    }
    return mappings;
};

const setValueByPath = (obj: any, path: string, value: any) => {
    const keys = path.split('.');
    let current = obj;
    keys.forEach((key, index) => {
        if (index === keys.length - 1) {
            current[key] = typeof value === 'boolean' ? !value : value;
        } else {
            if (!(key in current)) current[key] = {};
            current = current[key];
        }
    });
};

function getValueByPath(obj: any, path: string) {
    return path
        .split('.')
        .reduce((acc, key) => (acc ? acc[key] : undefined), obj);
}
