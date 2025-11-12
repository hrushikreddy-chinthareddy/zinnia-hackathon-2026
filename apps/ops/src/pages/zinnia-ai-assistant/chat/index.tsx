import { getAccessToken } from '@auth0/nextjs-auth0';
import { MeResponse } from '@xd/api-types/dist/generated-types/knowledgebase';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'react-i18next';

import ChatInput from '@deps/components/knowledge-base/chat/chat-input/chat-input';
import ChatQuestion from '@deps/components/knowledge-base/chat/chat-question/chat-question';
import ChatResponse from '@deps/components/knowledge-base/chat/chat-response/chat-response';
import CommonHeader from '@deps/components/knowledge-base/common-header/common-header';
import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import { TranslationFiles } from '@deps/config/translations';
import KnowledgeBaseContainer from '@deps/containers/knowledge-base/knowledge-base-container';
import { useKnowledgeBaseContext } from '@deps/contexts/KnowledgeBaseContext';
import { serverSidePropsLogout } from '@deps/helpers/logout.helpers';
import { getUserData } from '@deps/helpers/query-data.helpers';
import { DEFAULT_LOCALE, ALL_LOCALES } from '@deps/helpers/routing.helpers';
import { useChatStream } from '@deps/hooks/knowledge-base/useChatStream';
import { useScroll } from '@deps/hooks/useScroll';
import { UserProfile } from '@deps/models/user-profile';
import { getOpsUserDetailsSSR } from '@deps/queries/api/knowledge-base';
import { BOT_ERROR_MESSAGE_ID, MessageRole } from '@deps/types/knowledge-base';
import { FEATURE_FLAGS } from '@deps/utils/optimizely/flags';
import {
    FeatureFlags,
    optimizelyService,
} from '@deps/utils/optimizely/optimizely';
import { logWarn, withPageAuthAndLogging } from '@deps/utils/server-logging';
import nextI18nextConfig from 'next-i18next.config';

type additionalDataProps = {
    user: UserProfile;
};

type AiAssistantPageProps = {
    featureFlagDecisions: FeatureFlags;
    additionalData: additionalDataProps;
    opsUserData: MeResponse;
    sessionId?: string;
};

export default function AiAssistant({
    opsUserData,
    sessionId = '',
}: AiAssistantPageProps) {
    return (
        <KnowledgeBaseContainer opsUserData={opsUserData} sessionId={sessionId}>
            <ChatPage opsUserData={opsUserData} />
        </KnowledgeBaseContainer>
    );
}

export const getServerSideProps = withPageAuthAndLogging(
    {
        getServerSideProps: async (context, loggingContext) => {
            const user = await getUserData(context);
            const featureFlagDecisions: FeatureFlags =
                await optimizelyService.getFeatureFlagDecisions(
                    user.sub,
                    loggingContext
                );

            if (!featureFlagDecisions?.[FEATURE_FLAGS.AI_ASSISTANT]) {
                logWarn(
                    'zinnia-ai-assistant::Feature flag disabled',
                    loggingContext
                );
                return {
                    redirect: {
                        destination: '/cases',
                        permanent: false,
                    },
                };
            }
            const { locale = DEFAULT_LOCALE, req, res, query } = context;
            const logCtx = {
                ...loggingContext,
                file: 'pages/zinnia-ai-assistant',
                function: 'getServerSideProps',
            };
            let accessToken;
            try {
                accessToken = (await getAccessToken(req, res)).accessToken;
            } catch (e) {
                logWarn('zinnia-ai-assistant::Access token expired', {
                    ...logCtx,
                });
                return serverSidePropsLogout();
            }
            const additionalData: additionalDataProps = { user: user };
            const translations = await serverSideTranslations(
                locale,
                [TranslationFiles.COMMON],
                nextI18nextConfig,
                ALL_LOCALES
            );

            try {
                if (!user?.email) {
                    logWarn(
                        'zinnia-ai-assistant::User email is missing',
                        logCtx
                    );
                    return serverSidePropsLogout();
                }
                const opsUserData = await getOpsUserDetailsSSR(
                    user.email.toLowerCase(),
                    accessToken,
                    logCtx
                );
                if (!opsUserData?.client?.length) {
                    logWarn(
                        'zinnia-ai-assistant::no client assigned to the user',
                        logCtx
                    );
                    return {
                        redirect: {
                            destination: '/403',
                            permanent: false,
                        },
                    };
                }
                return {
                    props: {
                        locale,
                        ...translations,
                        featureFlagDecisions,
                        additionalData,
                        opsUserData: opsUserData as MeResponse,
                        sessionId: query.sessionId || '',
                    },
                };
            } catch (error) {
                return {
                    props: {
                        locale,
                        ...translations,
                        featureFlagDecisions,
                        additionalData,
                    },
                };
            }
        },
    },
    {
        file: 'zinnia-ai-assistant/chat',
        function: 'getServerSideProps',
        page: 'ai-assistant/chat',
    }
);

type ChatPageProps = {
    opsUserData: MeResponse;
};
const ChatPage = ({ opsUserData }: ChatPageProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: 'zinniaAiAssistant',
    });
    const { currentMessages, selectedClientId } = useKnowledgeBaseContext();
    const { isStreaming, sendMessage, stopStreaming, getCommonClientResponse } =
        useChatStream(selectedClientId);
    const { handleContainerScroll, scrollContainerRef, endref } =
        useScroll(currentMessages);

    return (
        <div className="px-6 h-full flex flex-col justify-between">
            <CommonHeader />
            <div className=" flex flex-col gap-2 justify-end">
                <div className=" flex-1 flex flex-col gap-2">
                    {currentMessages.length > 0 ? (
                        <div
                            ref={scrollContainerRef}
                            onScroll={handleContainerScroll}
                            className="flex flex-col gap-4 my-4 max-h-[65vh] overflow-y-auto "
                        >
                            {currentMessages.map((message, index) => {
                                return message.role === MessageRole.User ? (
                                    <ChatQuestion
                                        key={message.id}
                                        question={message.content}
                                    />
                                ) : (
                                    <ChatResponse
                                        key={message.id}
                                        email={opsUserData?.email || ''}
                                        questionId={message.questionId ?? ''}
                                        responseId={message.id}
                                        response={message.content}
                                        sourceDocuments={
                                            message.sourceDocuments
                                        }
                                        submittedFeedbackType={
                                            message.feedbackType
                                        }
                                        submittedFeedbackComment={
                                            message.feedbackComment
                                        }
                                        showFeedbackControls={
                                            message.id !== BOT_ERROR_MESSAGE_ID
                                        }
                                        definitiveAnswerFound={
                                            message.definitiveAnswerFound ??
                                            null
                                        }
                                        isStreaming={
                                            index !== currentMessages.length - 1
                                                ? false
                                                : isStreaming
                                        }
                                        getCommonClientResponse={
                                            getCommonClientResponse
                                        }
                                    />
                                );
                            })}
                            <div ref={endref} />
                        </div>
                    ) : (
                        <Typography
                            variant={TypographyVariant.H3}
                            className="whitespace-pre-line text-center my-8"
                        >
                            {t('chat.startingMessage')}
                        </Typography>
                    )}
                </div>
                <ChatInput
                    opsUserData={opsUserData}
                    sendMessage={sendMessage}
                    stopStreaming={stopStreaming}
                    isStreaming={isStreaming}
                />
            </div>
        </div>
    );
};
