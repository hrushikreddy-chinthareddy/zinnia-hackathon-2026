import { uploadDocument } from '@deps/queries/api/documents';

export const processDocuments = (formData: any) => {
    const attachments: [] = formData?.attachment;
    attachments.forEach((attachment: any) => {
        const document = uploadDocument(attachment);
    });
};
