import { AxiosResponse } from 'axios';

import { baseAppUrl } from '@deps/queries/api-config';
import { client } from '@deps/queries/api-utils/client';
import { CaseInsightsQuery } from '@deps/queries/cases';
import { OpenAiResponse } from '@deps/types/openai';

export const getCaseInsights = async (
    query: CaseInsightsQuery
): Promise<string> => {
    try {
        const { data } = await client.post<
            CaseInsightsQuery,
            AxiosResponse<OpenAiResponse>
        >(`${baseAppUrl}/api/openai`, query);

        return data?.summary ?? '';
    } catch (error) {
        console.error(
            'getCaseInsights::An error occurred while getting case insights results',
            error
        );
        return '';
    }
};
