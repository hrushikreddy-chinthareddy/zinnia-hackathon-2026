import { Icon, IconType } from '@zinnia/bloom/components';
import { useRouter } from 'next/router';
import { ChangeEvent, useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import Field from '@deps/components/fields/field';
import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import { TranslationFiles } from '@deps/config/translations';
import { useKnowledgeBaseContext } from '@deps/contexts/KnowledgeBaseContext';
import {
    listChatSessionsByClientId,
    searchChatHistory,
} from '@deps/queries/api/knowledge-base';
import { KeyboardEvents, KnowledgeBasePages } from '@deps/types/knowledge-base';
import { browserLogError } from '@deps/utils/browser-logging';
import { formatDateTime } from '@deps/utils/dates';
import {
    ChatSearchResponse,
    ChatSessionResponse,
    MeResponse,
} from '@zinnia/api-types/types/knowledgebase';

import styles from './recent-chat.module.css';
import { KnowledgeBasePaths } from '../../knowledge-base-sidenav/knowledge-base-sidenav';

type RecentChatsProps = {
    opsUserData: MeResponse;
};

const PAGE_SIZE = 10;
const START_PAGE_NUM = 0;
const DEBOUNCE_DELAY = 300;
const SESSION_TITLE_MAX_LEN = 22;

const RecentChat = ({ opsUserData }: RecentChatsProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: 'zinniaAiAssistant',
    });
    const {
        selectedClientId,
        viewChatHistory,
        chatHistoryReloadTrigger,
        sessionId,
    } = useKnowledgeBaseContext();
    const router = useRouter();
    const containerRef = useRef<HTMLDivElement | null>(null);

    const [loading, setLoading] = useState(false);
    const [chatHistory, setChatHistory] = useState<ChatSessionResponse[]>([]);
    const [page, setPage] = useState(START_PAGE_NUM);
    const [isLastPage, setIsLastPage] = useState(false);

    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<ChatSearchResponse[]>(
        []
    );
    const [searchPage, setSearchPage] = useState(START_PAGE_NUM);
    const [isLastSearchPage, setIsLastSearchPage] = useState(false);

    const isSearchActive = searchTerm.trim().length >= 3;
    const chatsToRender = isSearchActive ? searchResults : chatHistory;

    const clientName =
        opsUserData?.client?.find((c) => c.id === selectedClientId)?.name || '';

    const fetchChatHistory = useCallback(
        async (clientId: string, pageNum: number) => {
            setLoading(true);
            try {
                const res = await listChatSessionsByClientId(
                    opsUserData.email || '',
                    clientId,
                    pageNum,
                    PAGE_SIZE
                );
                if (res?.content) {
                    setChatHistory((prev) =>
                        pageNum === START_PAGE_NUM
                            ? res.content
                            : [...prev, ...res.content]
                    );
                    setIsLastPage(res.last);
                }
            } catch (error) {
                browserLogError('Error fetching chat history', { error });
            } finally {
                setLoading(false);
            }
        },
        [opsUserData]
    );

    const fetchSearchResults = useCallback(
        async (clientId: string, pageNum: number, term: string) => {
            setLoading(true);
            try {
                const res = await searchChatHistory(
                    opsUserData?.email || '',
                    clientId,
                    term,
                    pageNum,
                    PAGE_SIZE
                );
                if (res?.content) {
                    setSearchResults((prev) =>
                        pageNum === START_PAGE_NUM
                            ? res.content
                            : [...prev, ...res.content]
                    );
                    setIsLastSearchPage(res.last);
                }
            } catch (error) {
                browserLogError('Error searching chat history', { error });
            } finally {
                setLoading(false);
            }
        },
        [opsUserData.email]
    );

    const resetData = useCallback(() => {
        setChatHistory([]);
        setSearchResults([]);
        setPage(START_PAGE_NUM);
        setSearchPage(START_PAGE_NUM);
        setIsLastPage(false);
        setIsLastSearchPage(false);
    }, []);

    const handleViewChatHistory = (newSessionId: string) => {
        if (sessionId === newSessionId) {
            return;
        }
        if (router.pathname.split('/').pop() !== KnowledgeBasePages.CHAT) {
            router.push(`${KnowledgeBasePaths.chat}?sessionId=${newSessionId}`);
        } else {
            const urlParams = new URLSearchParams(
                router.query as Record<string, string>
            );
            urlParams.set('sessionId', newSessionId);
            router.push(
                router.pathname + '?' + urlParams.toString(),
                undefined,
                { shallow: true }
            );
            viewChatHistory(newSessionId);
            fetchChatHistory(selectedClientId!, START_PAGE_NUM);
        }
    };

    const handleScroll = () => {
        const container = containerRef.current;
        if (!container || loading) return;

        const threshold = 100;
        const scrollBottom =
            container.scrollHeight -
            container.scrollTop -
            container.clientHeight;

        if (scrollBottom < threshold) {
            if (isSearchActive && !isLastSearchPage) {
                const next = searchPage + 1;
                setSearchPage(next);
                fetchSearchResults(selectedClientId!, next, searchTerm);
            } else if (!isSearchActive && !isLastPage) {
                const next = page + 1;
                setPage(next);
                fetchChatHistory(selectedClientId!, next);
            }
        }
    };

    const handleSearchTermChange = (term: string) => {
        setSearchTerm(term);
        setSearchResults([]);
        setSearchPage(START_PAGE_NUM);
    };

    const handleSearchClear = () => {
        setSearchTerm('');
        resetData();
        fetchChatHistory(selectedClientId!, START_PAGE_NUM);
    };

    useEffect(() => {
        if (!selectedClientId) return;

        const trimmed = searchTerm.trim();
        const timer = setTimeout(() => {
            if (trimmed.length < 3) {
                resetData();
                fetchChatHistory(selectedClientId, START_PAGE_NUM);
            } else {
                resetData();
                fetchSearchResults(selectedClientId, START_PAGE_NUM, trimmed);
            }
        }, DEBOUNCE_DELAY);

        return () => clearTimeout(timer);
    }, [
        searchTerm,
        selectedClientId,
        chatHistoryReloadTrigger,
        fetchChatHistory,
        fetchSearchResults,
        resetData,
    ]);

    return (
        <div className="text-gray-500 border-t border-gray-100 mt-4">
            <div className="flex flex-col gap-2 my-4">
                <Typography variant={TypographyVariant.BodySmBold}>
                    {t('sidenav.recentChat')}
                </Typography>
                <Typography variant={TypographyVariant.BodySm}>
                    {clientName
                        .replace(/\.aspx$/i, '')
                        .replace(/-/g, ' ')
                        .replace(/([a-z])([A-Z])/g, '$1 $2')}
                </Typography>
            </div>

            <Field
                placeholder={t('sidenav.search') || ''}
                value={searchTerm}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    handleSearchTermChange(e.target.value)
                }
                startIcon={<Icon type={IconType.SEARCH} className="mr-1" />}
                className="py-1 mb-4"
                onClear={handleSearchClear}
                isClearable
            />

            <div
                className="flex flex-col h-[320px] overflow-y-auto py-2"
                ref={containerRef}
                onScroll={handleScroll}
            >
                {chatsToRender.length > 0 ? (
                    chatsToRender?.map((chat) => {
                        const {
                            sessionId: itemSessionId,
                            sessionTitle,
                            lastActivity,
                        } = chat;
                        return (
                            <div
                                tabIndex={0}
                                key={itemSessionId}
                                className={`flex gap-2 items-center py-2 cursor-pointer ${
                                    styles.itemhover
                                } ${
                                    itemSessionId === sessionId
                                        ? styles.activeItem
                                        : ''
                                }`}
                                onClick={() =>
                                    handleViewChatHistory(itemSessionId || '')
                                }
                                onKeyDown={(e) => {
                                    if (
                                        e.key === KeyboardEvents.Enter ||
                                        e.key === KeyboardEvents.Space
                                    ) {
                                        e.preventDefault();
                                        handleViewChatHistory(
                                            itemSessionId || ''
                                        );
                                    }
                                }}
                            >
                                <Icon type={IconType.ANNOTATION} />
                                <div className="flex flex-col">
                                    <Typography
                                        variant={TypographyVariant.BodySmBold}
                                    >
                                        {sessionTitle &&
                                        sessionTitle?.length <=
                                            SESSION_TITLE_MAX_LEN
                                            ? sessionTitle
                                            : `${sessionTitle?.slice(
                                                  0,
                                                  SESSION_TITLE_MAX_LEN
                                              )}...`}
                                    </Typography>
                                    <Typography
                                        variant={TypographyVariant.BodySm}
                                        className="text-gray-200"
                                    >
                                        {formatDateTime(lastActivity || '')}
                                    </Typography>
                                </div>
                            </div>
                        );
                    })
                ) : !loading ? (
                    <Typography
                        variant={TypographyVariant.BodySm}
                        className="px-2"
                    >
                        {isSearchActive
                            ? t('sidenav.noResultsFound')
                            : t('sidenav.noRecentChats')}
                    </Typography>
                ) : null}
                {loading && (
                    <Typography
                        variant={TypographyVariant.BodySm}
                        className="py-2"
                    >
                        {t('sidenav.loadingChats')}
                    </Typography>
                )}
            </div>
        </div>
    );
};

export default RecentChat;
