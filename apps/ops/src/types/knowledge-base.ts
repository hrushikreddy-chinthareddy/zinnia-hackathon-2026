import {
    ClientDetailsDto,
    SourceDocument,
    UserResponse,
} from '@xd/api-types/dist/generated-types/knowledgebase';

export enum KnowledgeBasePages {
    CHAT = 'chat',
    DOCUMENTS = 'documents',
    ADMIN = 'admin',
}

export enum MessageRole {
    User = 'user',
    Bot = 'bot',
}

export type UserMessage = {
    id: string;
    role: MessageRole.User;
    content: string;
};

export type ChatbotMessage = {
    id: string;
    questionId?: string;
    role: MessageRole.Bot;
    content: string;
    sourceDocuments?: SourceDocument[];
    feedbackType?: FeedbackType | null;
    feedbackComment?: string | null;
    definitiveAnswerFound?: boolean | null;
};

export const BOT_ERROR_MESSAGE_ID = 'bot_error';
export const COMMON_CLIENT_NAME = 'common';

export enum KeyboardEvents {
    Enter = 'Enter',
    Space = ' ',
}

export enum FeedbackType {
    Like = 'LIKE',
    Dislike = 'DISLIKE',
}

export enum DocumentsDisplayType {
    Updated = 'updated',
    Recent = 'recent',
    All = 'all',
}

export enum SortBy {
    CreatedAt = 'createdAt',
    UpdatedAt = 'updatedAt',
}

export enum SortDirection {
    Asc = 'asc',
    Desc = 'desc',
}

export enum SortFields {
    Name = 'name',
    Created = 'created',
    Updated = 'updated',
}

export type ClientDetailsResponse = ClientDetailsDto[];

export interface PaginatedResponse<T> {
    content: T[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    first: boolean;
    last: boolean;
    empty: boolean;
}

export type GetAllUserDetailsResponse = PaginatedResponse<UserResponse>;

export enum SSEEventType {
    STATUS = 'status',
    TOKEN = 'token',
    SOURCES = 'sources',
    COMPLETE = 'complete',
    ERROR = 'error',
}

export type DislikeReasonsPayload = {
    reason: string;
    links: string[] | null;
    metadata: OpsIntakeFormPayload | null;
};

export type OpsIntakeFormPayload = {
    processName: string;
    blockOfBusiness: string;
    processDescription: string;
    outcomeExpected: string;
    smeEmail: string;
    priority: string;
    requestFrequency: string;
    benefitMetrics: string;
};
