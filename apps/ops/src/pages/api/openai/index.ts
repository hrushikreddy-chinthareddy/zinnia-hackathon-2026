import { OpenAiResponse } from '@deps/types/openai';
import { openai } from '@deps/utils/openai';
import { logError, logTrace, parseErrorInformation, withAuthAndLogging } from '@deps/utils/server-logging';

import type { NextApiRequest, NextApiResponse } from 'next';

export default withAuthAndLogging(
    async (req: NextApiRequest, res: NextApiResponse<OpenAiResponse>, loggingContext) => {
        const now = performance.now();
        logTrace('openai::start', loggingContext);

        try {
            const content = typeof req.body.content === 'string' ? req.body.content : JSON.stringify(req.body.content);
            const prompt = req.body.prompt || '';
            const completion = await openai.chat.completions.create({
                model: 'gpt-3.5-turbo',
                temperature: 0.2,
                messages: [
                    {
                        role: 'system',
                        content: prompt,
                    },
                    {
                        role: 'system',
                        content,
                    },
                    {
                        role: 'user',
                        content: 'Given the data provided, please provide a couple sentence summary. Be concise. Be specific.',
                    },
                ],
            });
            logTrace('openai::complete', { ...loggingContext, duration: performance.now() - now });

            res.json({
                summary: completion.choices[0].message?.content,
            });
        } catch (error) {
            logError('openai::error', {
                ...parseErrorInformation(error),
                requestUrl: 'openai-package',
                duration: performance.now() - now,
                ...loggingContext,
            });
            res.status((error as Response)?.status ?? 500).json({
                summary: '',
            });
        }
    },
    { file: 'documents/:documentNumber/preview', function: 'routeHandler' }
);
