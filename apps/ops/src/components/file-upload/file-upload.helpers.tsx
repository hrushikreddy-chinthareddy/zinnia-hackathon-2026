export const AllowedExtensions = [
    '.jpg',
    '.png',
    '.jpeg',
    '.tiff',
    '.pdf',
    '.eml',
    '.pst',
];

export const GetFileExtension = (filename: string) =>
    filename.includes('.')
        ? `.${filename.split('.').pop()!.toLowerCase()}`
        : '';
