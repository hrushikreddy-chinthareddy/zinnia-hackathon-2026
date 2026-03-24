import { dataURItoBlob } from '@rjsf/utils';

import { browserLogError } from '@deps/utils/browser-logging';

export function addNameToDataURL(dataURL: string, name: string) {
    if (!dataURL) return dataURL;
    return dataURL.replace(
        ';base64',
        `;name=${encodeURIComponent(name)};base64`
    );
}

export async function processFile(file: File) {
    const { name, size, type } = file;

    return new Promise<{
        dataURL: string | null;
        name: string;
        size: number;
        type: string;
    }>((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = reject;
        reader.onload = (event) => {
            if (typeof event.target?.result === 'string') {
                resolve({
                    dataURL: addNameToDataURL(event.target.result, name),
                    name,
                    size,
                    type,
                });
            } else {
                resolve({
                    dataURL: null,
                    name,
                    size,
                    type,
                });
            }
        };
        reader.readAsDataURL(file);
    });
}

export function processFiles(files: FileList) {
    return Promise.all(Array.from(files).map(processFile));
}

export function extractFileInfo(dataURLs: string[]) {
    return dataURLs.reduce<
        { dataURL: string; name: string; size: number; type: string }[]
    >((acc, dataURL) => {
        if (!dataURL) return acc;
        try {
            const { blob, name } = dataURItoBlob(dataURL);
            acc.push({
                dataURL,
                name,
                size: blob.size,
                type: blob.type,
            });
        } catch (error) {
            browserLogError('Error in parsing column selection', {
                error,
            });
        }
        return acc;
    }, []);
}
