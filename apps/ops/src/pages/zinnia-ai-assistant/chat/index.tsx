import { getAccessToken } from '@auth0/nextjs-auth0';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'react-i18next';

import AiLogo from '@deps/components/knowledge-base/chat/ai-logo/ai-logo';
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
import { MeResponse } from '@zinnia/api-types/types/knowledgebase';
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
            <CommonHeader />
            <ChatPage opsUserData={opsUserData} />
        </KnowledgeBaseContainer>
    );
}

export const getUserDisplayName = (name: string) => {
    return name.split(',').pop()?.trim() || '';
};

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
    const { currentMessages, selectedClientId, commonClientId } =
        useKnowledgeBaseContext();
    const { isStreaming, sendMessage, stopStreaming, getCommonClientResponse } =
        useChatStream(selectedClientId, commonClientId || '');
    const { handleContainerScroll, scrollContainerRef, endref } =
        useScroll(currentMessages);

    return (
        <div className="h-full flex items-center justify-center overflow-hidden">
            <div className="w-full h-full inset-0 flex flex-col gap-2 justify-center">
                <div className="h-full flex flex-col">
                    <div className="flex-1 flex flex-col gap-2 justify-end items-center">
                        {currentMessages.length > 0 ? (
                            <div
                                ref={scrollContainerRef}
                                onScroll={handleContainerScroll}
                                className="flex flex-col gap-4 pt-4 max-h-[calc(100vh-20rem+24px)] p-2 overflow-y-auto w-full"
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
                                            questionId={
                                                message.questionId ?? ''
                                            }
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
                                                message.id !==
                                                BOT_ERROR_MESSAGE_ID
                                            }
                                            definitiveAnswerFound={
                                                message.definitiveAnswerFound ??
                                                null
                                            }
                                            isStreaming={
                                                index !==
                                                currentMessages.length - 1
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
                            <AiLogo
                                width="100px"
                                height="100px"
                                autoPlay={true}
                                loop={false}
                            />
                        )}
                    </div>
                    <div className="flex-col justify-end flex">
                        {currentMessages.length == 0 && (
                            <>
                                <Typography
                                    variant={TypographyVariant.H3}
                                    className="whitespace-pre-line text-center my-8"
                                >
                                    <h5 className="text-5xl font-bold text-transparent bg-clip-text bg-[linear-gradient(180deg,#ffc600_-12.77%,#ec6c00_39.25%,#ff1822_124.05%)]">
                                        {opsUserData?.name &&
                                            t(
                                                'chat.startingMessageBetaPrefix',
                                                {
                                                    name: getUserDisplayName(
                                                        opsUserData.name
                                                    ),
                                                }
                                            )}
                                    </h5>
                                    <h5 className="text-xl mt-4">
                                        {t('chat.startingMessageBetaSuffix')}
                                    </h5>
                                </Typography>
                            </>
                        )}
                        <ChatInput
                            opsUserData={opsUserData}
                            sendMessage={sendMessage}
                            stopStreaming={stopStreaming}
                            isStreaming={isStreaming}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};
