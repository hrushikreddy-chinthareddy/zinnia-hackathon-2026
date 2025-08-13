import { getAccessToken } from '@auth0/nextjs-auth0';
import { IncomingForm } from 'formidable';
import { promises as fs } from 'fs';
import { NextApiRequest, NextApiResponse } from 'next';

import { serverApi } from '@deps/queries/api-utils/serverApiClient';
import { isProd } from '@deps/utils/environment.helpers';
import {
    logCompliance,
    logError,
    parseErrorInformation,
    withAuthAndLogging,
} from '@deps/utils/server-logging';
interface DocumentUploadRequest extends NextApiRequest {
    body: FormData;
}

export const config = {
    api: {
        bodyParser: false, // Disabling Next.js body parsing
    },
};

const parseForm = (
    req: NextApiRequest
): Promise<{ fields: any; files: any }> => {
    return new Promise((resolve, reject) => {
        const form = new IncomingForm();
        form.parse(req, (err, fields, files) => {
            if (err) {
                reject(err);
            } else {
                resolve({ fields, files });
            }
        });
    });
};

//**
// This is used to upload documents. From the frontend, we send a multipart/form-data request to this endpoint,
//  but we need to re-write it to a FormData object again to send to the backend. Thats what all the blob/buffer stuff is doing.
//  */
export default withAuthAndLogging(
    async (
        req: DocumentUploadRequest,
        res: NextApiResponse,
        loggingContext
    ) => {
        if (req.method !== 'POST' || isProd()) {
            return res
                .status(405)
                .json({ error: { message: 'Method Not Allowed' } });
        }

        try {
            const url = `${process.env.NEXT_PUBLIC_SE2_BACKEND_URL}/document/v3/documents`;

            const token = (await getAccessToken(req, res)).accessToken;
            // Parse the form data from the request
            const { fields, files } = await parseForm(req);

            // Extract metadata from the fields
            const { metadata } = fields;

            // Access the uploaded file (assuming there's only one file)
            const file = files.file[0];

            // Read the file into a buffer
            const fileBuffer = await fs.readFile(file.filepath);

            // Create a Blob from the file buffer with the appropriate MIME type
            const blob = new Blob([fileBuffer], { type: file.mimetype });

            // Initialize a new FormData object
            const formData = new FormData();

            // Append the file blob to the FormData object with the original filename
            formData.append('file', blob, file.originalFilename);

            // Append the metadata to the FormData object
            formData.append('metadata', metadata);

            const headers = {
                'x-correlation-id': metadata.correlationId,
                'Content-Type': 'multipart/form-data',
            };

            const { data } = await serverApi.post<any, any>(
                url,
                formData,
                { headers: headers, authorization: `Bearer ${token}` },
                loggingContext
            );

            logCompliance('Document upload successful.', loggingContext);
            res.status(200).json({ data, error: null });
        } catch (error) {
            logError('test-harness/upload-document:: error', {
                ...parseErrorInformation(error),
                ...loggingContext,
            });
            res.status(500).json({
                data: null,
                error: { message: 'Error uploading document' },
            });
        }
    },
    { file: 'test-harness/upload-document', function: 'routeHandler' }
);
