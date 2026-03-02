import { mimeToExt, nameToExt } from '@deps/models/case/document';

export const getFileSubtype = (blob: Blob & { name?: string }) => {
    if (!blob) return '';

    const { type, name } = blob;

    // if the file type is not available then try to get the file extension from the file name
    if (!type && name && name.includes('.')) {
        const extension = name.slice(name.lastIndexOf('.') + 1);
        if (nameToExt.includes(extension)) {
            return extension;
        }
    }

    if (type && mimeToExt[type]) {
        return mimeToExt[type];
    }

    if (type && type.includes('/')) {
        return type.split('/')[1];
    }

    return type || '';
};
