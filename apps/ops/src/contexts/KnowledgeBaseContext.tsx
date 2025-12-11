import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
} from 'react';

import {
    getChatHistoryBySessionId,
    getCommonClientId,
} from '@deps/queries/api/knowledge-base';
import {
    AnswerMode,
    ChatbotMessage,
    COMMON_CLIENT_NAME,
    MessageRole,
    UserMessage,
} from '@deps/types/knowledge-base';
import { browserLogError } from '@deps/utils/browser-logging';
import { MeResponse } from '@zinnia/api-types/types/knowledgebase';

type KnowledgeBaseContextState = {
    selectedClientId: string;
    sessionId: string;
    currentMessages: (UserMessage | ChatbotMessage)[];
    chatHistoryReloadTrigger: number;
    commonClientId?: string | null;
    answerMode: AnswerMode;
    setSelectedClient: (clientId: string) => void;
    setSessionId: React.Dispatch<React.SetStateAction<string>>;
    setCurrentMessages: React.Dispatch<
        React.SetStateAction<(UserMessage | ChatbotMessage)[]>
    >;
    setChatHistoryReloadTrigger: React.Dispatch<React.SetStateAction<number>>;
    startNewChatSession: () => void;
    viewChatHistory: (sessionId: string) => void;
    setAnswerMode: React.Dispatch<React.SetStateAction<AnswerMode>>;
};

const noop = (() => {}) as React.Dispatch<React.SetStateAction<any>>;

const KnowledgeBaseContextDefaultValues = {
    selectedClientId: '',
    sessionId: '',
    currentMessages: [],
    chatHistoryReloadTrigger: 0,
    commonClientId: null,
    answerMode: AnswerMode.Short,
    setSelectedClient: () => {},
    setSessionId: noop,
    setCurrentMessages: noop,
    setChatHistoryReloadTrigger: noop,
    startNewChatSession: () => {},
    viewChatHistory: () => {},
    setAnswerMode: noop,
};

const KnowledgeBaseContext = createContext<KnowledgeBaseContextState>(
    KnowledgeBaseContextDefaultValues
);

type KnowledgeBaseContextProps = {
    children: React.ReactNode;
    opsUserData: MeResponse;
    sessionId?: string;
};

const KnowledgeBaseProvider = ({
    children,
    opsUserData,
    sessionId: sessionIdProp = '',
}: KnowledgeBaseContextProps) => {
    const defaultClientId =
        opsUserData?.client?.find((client) => client.default === true)?.id ??
        '';
    const [commonClientId, setCommonClientId] = useState<string | null>(null);
    const [selectedClientId, setSelectedClientId] =
        useState<string>(defaultClientId);
    const [sessionId, setSessionId] = useState<string>('');
    const [currentMessages, setCurrentMessages] = useState<
        (UserMessage | ChatbotMessage)[]
    >([]);
    const [chatHistoryReloadTrigger, setChatHistoryReloadTrigger] = useState(0);
    const [answerMode, setAnswerMode] = useState<AnswerMode>(AnswerMode.Short);

    const setSelectedClient = useCallback((clientId: string) => {
        setSelectedClientId(clientId);
        sessionStorage.setItem('ZinniaLive_kb_selectedClientId', clientId);
    }, []);

    const initializeCommonClientId = useCallback(async () => {
        const localCommonId = opsUserData?.client?.find((client) =>
            client.name?.toLowerCase().startsWith(COMMON_CLIENT_NAME)
        )?.id;

        if (localCommonId) {
            setCommonClientId(localCommonId);
        } else {
            const fetchedCommonId = await getCommonClientId();
            setCommonClientId(fetchedCommonId);
        }
    }, [opsUserData]);

    const startNewChatSession = () => {
        if (sessionId) {
            setChatHistoryReloadTrigger((prev: any) => prev + 1);
        }
        setSessionId('');
        setCurrentMessages([]);
    };

    const viewChatHistory = async (sessionId: string) => {
        if (!sessionId) return;
        try {
            setSessionId(sessionId);
            setCurrentMessages([]);
            const historyMessagesResponse = await getChatHistoryBySessionId(
                sessionId
            );
            if (historyMessagesResponse) {
                const historyMessages =
                    historyMessagesResponse?.messages.content;
                const newHistoryMessages: (UserMessage | ChatbotMessage)[] = [];
                historyMessages.forEach((message: any) => {
                    const {
                        questionId,
                        responseId,
                        question,
                        response,
                        sourceDocuments,
                        feedbackType,
                        feedbackComment,
                        definitiveAnswerFound,
                    } = message;
                    if (responseId && response) {
                        const userMessage: UserMessage = {
                            id: questionId,
                            role: MessageRole.User,
                            content: question,
                        };
                        const chatbotMessage: ChatbotMessage = {
                            id: responseId,
                            questionId,
                            role: MessageRole.Bot,
                            content: response,
                            sourceDocuments:
                                definitiveAnswerFound === false
                                    ? []
                                    : sourceDocuments,
                            feedbackType,
                            feedbackComment,
                        };
                        newHistoryMessages.push(userMessage);
                        newHistoryMessages.push(chatbotMessage);
                    }
                });
                setCurrentMessages(newHistoryMessages);
            } else setCurrentMessages([]);
        } catch (error) {
            browserLogError('Error fetching chat history::', { error });
            setCurrentMessages([]);
            return;
        }
    };

    useEffect(() => {
        if (sessionIdProp) {
            viewChatHistory(sessionIdProp);
        }
    }, [sessionIdProp]);

    useEffect(() => {
        if (opsUserData?.client?.length) {
            initializeCommonClientId();
        }
        const savedClientId = sessionStorage.getItem(
            'ZinniaLive_kb_selectedClientId'
        );
        try {
            if (savedClientId) {
                const validClient = opsUserData?.client?.find(
                    (client) => client.id === savedClientId
                );
                if (validClient?.id) {
                    setSelectedClient(validClient.id);
                    return;
                }
            }
        } catch (error) {
            console.warn('Invalid savedClient JSON:', error);
        }
        const defaultClientId =
            opsUserData?.client?.find((client) => client.default === true)
                ?.id ?? '';
        if (defaultClientId.length > 0) {
            setSelectedClient(defaultClientId);
        }
    }, [opsUserData, setSelectedClient, initializeCommonClientId]);

    return (
        <KnowledgeBaseContext.Provider
            value={{
                selectedClientId,
                setSelectedClient,
                sessionId,
                setSessionId,
                currentMessages,
                setCurrentMessages,
                chatHistoryReloadTrigger,
                setChatHistoryReloadTrigger,
                startNewChatSession,
                viewChatHistory,
                commonClientId,
                answerMode,
                setAnswerMode,
            }}
        >
            {children}
        </KnowledgeBaseContext.Provider>
    );
};
export default KnowledgeBaseProvider;

export const useKnowledgeBaseContext = () => {
    const context = useContext(KnowledgeBaseContext);
    if (!context) {
        throw new Error(
            'useKnowledgeBaseContext must be used within a KnowledgeBaseProvider'
        );
    }
    return context;
};
