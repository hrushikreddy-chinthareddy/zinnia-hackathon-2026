import formidable from 'formidable';
import { promises as fs } from 'fs';

import { extractPdfTextAndLayout } from '@deps/server/paper2flow/extract-pdf-text-layout';
import type { PdfExtractItemsMode } from '@deps/server/paper2flow/types';
import { isProd } from '@deps/utils/environment.helpers';
import {
    logError,
    parseErrorInformation,
    withAuthAndLogging,
} from '@deps/utils/server-logging';

import type { NextApiRequest, NextApiResponse } from 'next';

export const config = {
    api: {
        bodyParser: false,
    },
};

const MAX_BYTES = 15 * 1024 * 1024;

function getFirstUploadedFile(
    files: formidable.Files,
    fieldNames: string[]
): formidable.File | undefined {
    for (const name of fieldNames) {
        const v = files[name];
        if (!v) continue;
        const file = Array.isArray(v) ? v[0] : v;
        if (file) return file;
    }
    return undefined;
}

export default withAuthAndLogging(
    async (req: NextApiRequest, res: NextApiResponse, loggingContext) => {
        if (req.method !== 'POST') {
            res.setHeader('Allow', ['POST']);
            return res.status(405).json({ error: 'Method not allowed' });
        }

        if (isProd()) {
            return res.status(404).json({ error: 'Not found' });
        }

        try {
            const form = formidable({
                maxFileSize: MAX_BYTES,
                allowEmptyFiles: false,
            });

            const [, files] = await form.parse(req);
            const file = getFirstUploadedFile(files, ['file', 'pdf']);

            if (!file) {
                return res.status(400).json({
                    error: 'Missing file field. Use multipart field name `file` or `pdf`.',
                });
            }

            const mime = file.mimetype ?? '';
            if (!mime.includes('pdf')) {
                return res.status(400).json({
                    error: `Expected application/pdf, got: ${
                        mime || 'unknown'
                    }`,
                });
            }

            const buffer = await fs.readFile(file.filepath);

            const maxPagesRaw = req.query.maxPages;
            const maxPages =
                typeof maxPagesRaw === 'string'
                    ? parseInt(maxPagesRaw, 10)
                    : undefined;

            const itemsRaw = req.query.items;
            let itemsMode: PdfExtractItemsMode | undefined;
            if (typeof itemsRaw === 'string') {
                if (
                    itemsRaw === 'full' ||
                    itemsRaw === 'text' ||
                    itemsRaw === 'none'
                ) {
                    itemsMode = itemsRaw;
                }
            }

            const result = await extractPdfTextAndLayout(buffer, {
                maxPages:
                    maxPages != null && !Number.isNaN(maxPages)
                        ? maxPages
                        : undefined,
                itemsMode,
            });

            await fs.unlink(file.filepath).catch(() => undefined);

            return res.status(200).json(result);
        } catch (e) {
            logError('paper2flow/extract-pdf', {
                ...parseErrorInformation(e),
                ...loggingContext,
            });
            return res.status(500).json({
                error:
                    e instanceof Error
                        ? e.message
                        : 'Failed to extract PDF text',
            });
        }
    },
    {
        file: 'pages/api/paper2flow/extract-pdf',
        function: 'default',
    }
);
