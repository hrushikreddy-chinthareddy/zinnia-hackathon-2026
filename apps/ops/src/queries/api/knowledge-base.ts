import {
    FollowUpChainResponse,
    FollowUpResponse,
    UserResponse,
    ClientDetailsDto,
} from '@xd/api-types/dist/generated-types/knowledgebase';
import axios, { AxiosResponse } from 'axios';

import {
    ClientDetailsResponse,
    COMMON_CLIENT_NAME,
    DislikeReasonsPayload,
    DocumentsDisplayType,
    FeedbackType,
    GetAllUserDetailsResponse,
    SortBy,
    SortDirection,
} from '@deps/types/knowledge-base';
import { browserLogError, browserLogTrace } from '@deps/utils/browser-logging';
import {
    logError,
    LoggingContext,
    logWarn,
    parseErrorInformation,
} from '@deps/utils/server-logging';

import { apiServerBaseUrl, baseAppUrl } from '../api-config';
import { client } from '../api-utils/client';
import { serverApi } from '../api-utils/serverApiClient';

export const getCommonClientId = async () => {
    const url = `${apiServerBaseUrl}/api/v1/clients`;
    try {
        const { data } = await axios.get<any, AxiosResponse>(url);
        if (data.length > 1) {
            const commonClient = data.find((clientDetail: ClientDetailsDto) => {
                const name =
                    clientDetail.client?.clientName?.toLowerCase().trim() ||
                    clientDetail.client?.title?.toLowerCase().trim() ||
                    clientDetail.client?.acronym?.toLowerCase().trim() ||
                    clientDetail.client?.name?.toLowerCase().trim();
                return name?.startsWith(COMMON_CLIENT_NAME);
            });
            return commonClient?.client?.pageId ?? null;
        }
        return null;
    } catch (error) {
        browserLogError('knowledge-base::Failed to fetch common client id', {
            ...parseErrorInformation(error),
            url,
            function: 'knowledgeBase.getCommonClientId',
        });
        return null;
    }
};

export const getOpsUserDetailsSSR = async (
    email: string,
    accessToken: string | undefined,
    logCtx: LoggingContext
): Promise<any> => {
    const loggingContext = {
        ...logCtx,
        file: 'queries/api/zinnia-ai-assistant',
        function: 'getOpsUserDetailsSSR',
    };
    if (!email) {
        logWarn(
            'getOpsUserDetailsSSR:no email to fetch user details',
            loggingContext
        );

        return null;
    }
    if (!accessToken) {
        logWarn(
            'getOpsUserDetailsSSR::No accessToken to fetch user details',
            loggingContext
        );

        return null;
    }
    try {
        const url = `${apiServerBaseUrl}/api/v1/users/details`;
        const opsUserRes = await serverApi.post<any>(
            url,
            JSON.stringify({
                email: email.toLowerCase(),
            }),
            {
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    Authorization: `Bearer ${accessToken}`,
                },
            },
            logCtx
        );
        if (opsUserRes?.data) {
            return opsUserRes.data;
        }
        return null;
    } catch (error) {
        logError(`getOpsUserDetailsSSR:: ${error} `, {
            ...parseErrorInformation(error),
            ...loggingContext,
        });
        return null;
    }
};

export const createNewChatSession = async (
    email: string,
    clientId: string,
    sessionTitle?: string
) => {
    if (!email || !clientId) {
        browserLogError(
            'Cannot create chat session::Missing email or clientId'
        );
        return null;
    }

    const url = `${baseAppUrl}/api/knowledge-base/new-chat-session`;

    try {
        const { data } = await client.post<any, AxiosResponse>(url, {
            email,
            clientId,
            ...(sessionTitle ? { sessionTitle } : {}),
        });
        return data.success ? data.body : null;
    } catch (error) {
        browserLogError('knowledge-base::Failed to create new chat session', {
            ...parseErrorInformation(error),
            url,
            function: 'knowledgeBase.createNewChatSession',
        });
        return null;
    }
};

export const getChatbotResponse = async (
    sessionId: string,
    question: string,
    clientId: string,
    signal?: AbortSignal
) => {
    if (!sessionId || !question || !clientId) {
        browserLogError(
            'Error getting chatbot response:: missing sessionId, question, or clientId'
        );
        return null;
    }

    const url = `${baseAppUrl}/api/knowledge-base/chat-response`;

    try {
        const { data } = await client.post<any, AxiosResponse>(
            url,
            {
                sessionId,
                question,
                clientId,
            },
            { signal }
        );
        return data.success ? data.body : null;
    } catch (error: any) {
        if (error?.name === 'CanceledError' || error?.code === 'ERR_CANCELED') {
            browserLogTrace('Chatbot response request cancelled');
            return null;
        }
        browserLogError('knowledge-base::Failed to fetch chatbot response', {
            ...parseErrorInformation(error),
            url,
            function: 'knowledgeBase.getChatbotResponse',
        });
        return null;
    }
};

export const sendResponseFeedback = async (
    messageId: string,
    email: string,
    feedbackType: FeedbackType,
    comment?: string,
    dislikeReason?: DislikeReasonsPayload | null
) => {
    if (!messageId || !email || !feedbackType) {
        browserLogError(
            'Error sending feedback:: Missing messageId, email, or feedbackType'
        );
        return null;
    }
    const url = `${baseAppUrl}/api/knowledge-base/feedback`;
    try {
        const { data } = await client.post<any, AxiosResponse>(url, {
            email,
            messageId,
            feedbackType,
            ...(comment ? { comment } : {}),
            ...(feedbackType === FeedbackType.Dislike
                ? { dislikeReason }
                : { dislikeReason: null }),
        });
        return data.success ? data.body : null;
    } catch (error) {
        browserLogError('knowledge-base::Failed to send feedback', {
            ...parseErrorInformation(error),
            url,
            function: 'knowledgeBase.sendResponseFeedback',
        });
    }
};

export const listChatSessionsByClientId = async (
    email: string,
    clientId: string,
    page?: number,
    size?: number
) => {
    if (!email || !clientId) {
        browserLogError(
            'Error getting chat sessions:: Missing email or clientId'
        );
        return null;
    }

    const url = `${baseAppUrl}/api/knowledge-base/chat-sessions`;

    try {
        const { data } = await client.post<any, AxiosResponse>(url, {
            email,
            clientId,
            page,
            size,
        });
        return data.success ? data.body : null;
    } catch (error) {
        browserLogError('knowledge-base::Failed to fetch chat sessions list', {
            ...parseErrorInformation(error),
            url,
            function: 'knowledgeBase.listChatSessionsByClientId',
        });
        return null;
    }
};

export const getChatHistoryBySessionId = async (sessionId: string) => {
    if (!sessionId) {
        browserLogError('Cannot get chat history: sessionId not provided');
        return null;
    }

    const url = `${baseAppUrl}/api/knowledge-base/chat-history?sessionId=${sessionId}`;

    try {
        const { data } = await client.get<any, AxiosResponse>(url);
        return data.success ? data.body : null;
    } catch (error) {
        browserLogError('knowledge-base::Failed to fetch chat history', {
            ...parseErrorInformation(error),
            url,
            function: 'knowledgeBase.getChatHistoryBySessionId',
        });
        return null;
    }
};

export const searchChatHistory = async (
    email: string,
    clientId: string,
    searchTerms: string,
    page?: number,
    size?: number
) => {
    if (!email || !clientId || !searchTerms) {
        browserLogError(
            'Error searching chat history:: Missing email, clientId, or searchTerms'
        );
        return null;
    }
    const url = `${baseAppUrl}/api/knowledge-base/search-chat-sessions`;
    try {
        const { data } = await client.post<any, AxiosResponse>(url, {
            email,
            clientId,
            searchTerms,
            page,
            size,
        });
        return data.success ? data.body : null;
    } catch (error) {
        browserLogError('knowledge-base::Failed to send feedback', {
            ...parseErrorInformation(error),
            url,
            function: 'knowledgeBase.sendResponseFeedback',
        });
        return null;
    }
};

export const getFollowupMessages = async (
    messageId: string
): Promise<FollowUpChainResponse | null> => {
    if (!messageId) {
        browserLogError('Error getting follow up messages:: missing messageId');
        return null;
    }

    const url = `${baseAppUrl}/api/knowledge-base/follow-up/getFollowUp?messageId=${messageId}`;
    try {
        const { data } = await client.get(url, {
            headers: {
                Accept: '*/*',
                'Content-Type': 'application/json',
            },
        });
        return data?.success ? data.body : null;
    } catch (error) {
        browserLogError('knowledge-base::Failed to get followup messages', {
            ...parseErrorInformation(error),
            url,
            function: 'knowledgeBase.getFollowupMessages',
        });
        return null;
    }
};

export const sendFollowupMessage = async (
    messageId: string,
    followUpQuestion: string,
    clientId: string,
    parentFollowUpId?: string | null
): Promise<FollowUpResponse | null> => {
    if (!messageId || !followUpQuestion || !clientId) {
        browserLogError(
            'Error fetching document preview:: Missing messageId, followUpQuestion or cliendId'
        );
        return null;
    }
    const url = `${baseAppUrl}/api/knowledge-base/follow-up/sendFollowUp`;

    try {
        const { data } = await client.post(url, {
            messageId,
            followUpQuestion,
            clientId,
            parentFollowUpId:
                parentFollowUpId === null ? undefined : parentFollowUpId,
        });
        return data ?? null;
    } catch (error) {
        browserLogError('knowledge-base::Failed to send followup message', {
            ...parseErrorInformation(error),
            url,
            function: 'knowledgeBase.sendFollowUpQuestion',
        });
        return null;
    }
};

export const getDocumentsByClientId = async (
    clientId: string,
    docDisplayType: DocumentsDisplayType,
    page?: number,
    pageSize?: number
) => {
    const baseUrl = `${baseAppUrl}/api/knowledge-base/documents`;

    const queryParams = new URLSearchParams({
        clientId,
        docDisplayType,
    });

    if (docDisplayType === DocumentsDisplayType.All) {
        if (page !== undefined) queryParams.append('page', page.toString());
        if (pageSize !== undefined)
            queryParams.append('size', pageSize.toString());
    }

    const url = `${baseUrl}?${queryParams.toString()}`;
    try {
        const { data } = await client.get<any, AxiosResponse>(url);
        return data;
    } catch (error) {
        browserLogError('knowledge-base::Failed to fetch documents', {
            ...parseErrorInformation(error),
            url,
            function: 'knowledgeBase.getDocumentsClient',
        });
        return null;
    }
};

export const searchDocuments = async (
    clientId: string,
    searchTerm: string,
    page = 0,
    size = 10
) => {
    if (!clientId || !searchTerm) {
        browserLogError(
            'Error searching documents:: Missing clientId or searchTerm'
        );
        return null;
    }
    const baseUrl = `${baseAppUrl}/api/knowledge-base/document-search`;
    const queryParams = new URLSearchParams({
        clientId,
        searchTerm,
        page: page?.toString(),
        size: size?.toString(),
    });
    const url = `${baseUrl}?${queryParams.toString()}`;
    try {
        const { data } = await client.get<any, AxiosResponse>(url);
        return data ?? null;
    } catch (error) {
        browserLogError('knowledge-base::Failed to fetch documents', {
            ...parseErrorInformation(error),
            url,
            function: 'knowledgeBase.searchDocuments',
        });
        return null;
    }
};

export const getDocumentPreview = async (
    driveId: string,
    itemId: string,
    documentType: string
) => {
    if (!driveId || !itemId || !documentType) {
        browserLogError(
            'Error fetching document preview:: Missing driveId, itemId or documentType'
        );
        return null;
    }
    const queryParams = new URLSearchParams({
        driveId,
        itemId,
        documentType,
    });
    const url = `${apiServerBaseUrl}/api/v1/clients/documents/download?${queryParams.toString()} `;
    try {
        const response = await axios.get<any, AxiosResponse>(url, {
            responseType: 'blob',
            headers: {
                Accept: 'application/octet-stream',
            },
        });
        return response ?? null;
    } catch (error) {
        browserLogError('knowledge-base::Failed to fetch document preview', {
            ...parseErrorInformation(error),
            url,
            function: 'knowledgeBase.getDocumentPreview',
        });
        return null;
    }
};

export const getAllClientDetails =
    async (): Promise<ClientDetailsResponse | null> => {
        const url = `${baseAppUrl}/api/knowledge-base/clients`;
        try {
            const { data } = await client.post<
                ClientDetailsResponse,
                AxiosResponse<ClientDetailsResponse>
            >(url);
            return data ?? null;
        } catch (error) {
            browserLogError('knowledge-base::Failed to fetch client details', {
                ...parseErrorInformation(error),
                url,
                function: 'knowledgeBase.getAllClientDetails',
            });
            return null;
        }
    };

export const getAllUserDetails = async (
    page: number = 0,
    pageSize: number = 10,
    sortBy: SortBy = SortBy.CreatedAt,
    sortDirection: SortDirection = SortDirection.Desc
): Promise<GetAllUserDetailsResponse | null> => {
    const url = `${baseAppUrl}/api/knowledge-base/users`;
    try {
        const { data } = await client.get<
            GetAllUserDetailsResponse,
            AxiosResponse<GetAllUserDetailsResponse>
        >(url, {
            params: {
                page,
                pageSize,
                sortBy,
                sortDirection,
            },
        });
        return data ?? null;
    } catch (error) {
        browserLogError('knowledge-base::Failed to fetch user details', {
            ...parseErrorInformation(error),
            url,
            function: 'knowledgeBase.getAllUserDetails',
        });
        return null;
    }
};

export const searchUser = async (
    searchTerm: string
): Promise<UserResponse[] | null> => {
    const url = `${baseAppUrl}/api/knowledge-base/users/search`;
    try {
        const { data } = await client.post<any, AxiosResponse<UserResponse[]>>(
            url,
            {
                searchTerm,
            }
        );
        return data ?? null;
    } catch (error) {
        browserLogError('knowledge-base::Failed to search users', {
            ...parseErrorInformation(error),
            url,
            function: 'knowledgeBase.searchUser',
        });
        return null;
    }
};
