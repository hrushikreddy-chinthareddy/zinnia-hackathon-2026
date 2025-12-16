import {
    Icon,
    IconType,
    Tooltip,
    TooltipPlacement,
} from '@zinnia/bloom/components';
import clsx from 'clsx';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import NavButton from '@deps/components/nav-element/nav-button/nav-button';
import NavElement, {
    NavElementSize,
    NavElementType,
} from '@deps/components/nav-element/nav-element';
import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import { TranslationFiles } from '@deps/config/translations';
import { useKnowledgeBaseContext } from '@deps/contexts/KnowledgeBaseContext';
import { useSideSheetContext } from '@deps/contexts/SideSheetContext';
import {
    DocumentsDisplayType,
    KnowledgeBasePages,
} from '@deps/types/knowledge-base';
import { MeResponse } from '@zinnia/api-types/types/knowledgebase';

import styles from './knowledge-base-sidenav.module.css';
import RecentChat from '../chat/recent-chat/recent-chat';
import Quiz from '../documents/quiz/quiz';

type KnowledgeBaseSidenavProps = {
    opsUserData: MeResponse;
    isNavCollapsed: boolean;
    setIsNavCollapsed: (isNavCollapsed: boolean) => void;
};

export const KnowledgeBasePaths = {
    chat: '/zinnia-ai-assistant/chat',
    documents: '/zinnia-ai-assistant/documents',
    admin: '/zinnia-ai-assistant/admin',
};

const KnowledgeBaseSidenav = ({
    opsUserData,
    isNavCollapsed,
    setIsNavCollapsed,
}: KnowledgeBaseSidenavProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: 'zinniaAiAssistant',
    });
    const { startNewChatSession, selectedClientId } = useKnowledgeBaseContext();
    const router = useRouter();
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const sidesheet = useSideSheetContext();

    const handleStartNewChat = () => {
        const currentPage = router.pathname.split('/').pop();
        if (currentPage !== KnowledgeBasePages.CHAT) {
            router.push(KnowledgeBasePaths.chat);
        }
        const urlParams = new URLSearchParams(
            router.query as Record<string, string>
        );
        urlParams.delete('sessionId');

        const queryString = urlParams.toString();
        const newPath = queryString
            ? `${router.pathname}?${queryString}`
            : router.pathname;

        router.push(newPath, undefined, { shallow: true });
        startNewChatSession();
    };

    const handleShowSharepointDocuments = (docs: DocumentsDisplayType) => {
        router.push({
            pathname: KnowledgeBasePaths.documents,
            query: { docs },
        });
    };

    const handleShowAdminPage = () => {
        if (opsUserData?.role === MeResponse.role.ADMIN) {
            router.push(KnowledgeBasePaths.admin);
        }
    };

    const handleOpenQuiz = () => {
        sidesheet.changeSideSheetContent(
            t('sidenav.quiz.header'),
            <Quiz
                userId={opsUserData.id ?? ''}
                selectedClientId={selectedClientId}
            />,
            true
        );
        sidesheet.handleOpen(true, 500);
    };

    const getIconComponent = (iconType: IconType) => {
        const size = isNavCollapsed ? 20 : 16;
        return (
            <Icon
                type={iconType}
                width={size}
                height={size}
                color={
                    isNavCollapsed
                        ? 'white'
                        : 'var(--color-nav-drawer-2-nav-drawer-item-2-active-border)'
                }
            />
        );
    };

    const sharePointDocumentsItems = [
        {
            icon: getIconComponent(IconType.STAR),
            label: t('sidenav.recentlyAdded'),
            href: DocumentsDisplayType.Recent,
            onClick: () => {
                return handleShowSharepointDocuments(
                    DocumentsDisplayType.Recent
                );
            },
        },
        {
            icon: getIconComponent(IconType.EDIT),
            label: t('sidenav.recentlyModified'),
            href: DocumentsDisplayType.Updated,
            onClick: () =>
                handleShowSharepointDocuments(DocumentsDisplayType.Updated),
        },
        {
            icon: getIconComponent(IconType.DOCUMENT_DUPLICATE),
            label: t('sidenav.allDocs'),
            href: DocumentsDisplayType.All,
            onClick: () =>
                handleShowSharepointDocuments(DocumentsDisplayType.All),
        },
    ];

    const renderNavButton = (
        handleOnClick: () => void,
        iconType: IconType,
        label: string
    ) => {
        return (
            <NavButton
                aria-label={label}
                type="button"
                className={`border-1 ${
                    styles.navButtonWrapper
                } rounded-lg flex gap-2 py-1 ${styles.itemhover} ${
                    isNavCollapsed ? 'px-1' : 'px-2 w-full'
                }`}
                onClick={handleOnClick}
            >
                {isNavCollapsed ? (
                    <Tooltip
                        placement={TooltipPlacement.CenterLeft}
                        trigger={
                            <Icon width={24} height={24} type={iconType} />
                        }
                        tooltipClassName="!w-auto !mr-2 !p-2 !text-sm"
                    >
                        {label}
                    </Tooltip>
                ) : (
                    <>
                        <Icon width={24} height={24} type={iconType} />
                        <Typography variant={TypographyVariant.BodySm}>
                            {label}
                        </Typography>
                    </>
                )}
            </NavButton>
        );
    };

    return (
        <div
            className={`${
                styles.sidenav
            } px-4 flex flex-col justify-between border-gray-100 py-2 ${clsx(
                isNavCollapsed
                    ? `${styles.smallSidenavWrapper}`
                    : `${styles.sidenavWrapper}`
            )}`}
        >
            <div
                className={clsx(
                    'relative flex items-center justify-end gap-2',
                    isNavCollapsed
                        ? styles.headerCollapsed
                        : styles.headerExpanded
                )}
            >
                <button
                    type="button"
                    aria-label={'Collapse sidebar'}
                    className={styles.collapseBtn}
                    onClick={() => setIsNavCollapsed(true)}
                >
                    <Icon
                        type={IconType.CHEVRON_DOUBLE}
                        width={16}
                        height={16}
                    />
                </button>
                <div
                    className={clsx(
                        'flex items-center justify-end gap-2',
                        isNavCollapsed && styles.sidenavLogo
                    )}
                >
                    <Icon
                        type={IconType.SUPPORT}
                        width={24}
                        height={24}
                        className={clsx(styles.sidenavLogoIcon, 'mr-1')}
                    />
                    <button
                        type="button"
                        aria-label={'Expand sidebar'}
                        onClick={() => setIsNavCollapsed(false)}
                        className={clsx(styles.expandBtn)}
                    >
                        <Icon
                            type={IconType.CHEVRON_DOUBLE}
                            width={16}
                            height={16}
                            className={clsx(isNavCollapsed && styles.chevron)}
                        />
                    </button>
                </div>
            </div>
            <div className={`${styles.sidenavContent} flex-1`}>
                {renderNavButton(
                    handleStartNewChat,
                    IconType.EDIT_ALT,
                    t('sidenav.newChat')
                )}

                <div
                    className={`w-full text-gray-500 ${styles.sharepointWrap} ${
                        isNavCollapsed
                            ? styles.itemhover + ' mt-2'
                            : 'mt-4 border-t border-gray-100 '
                    } mb-4`}
                >
                    {isNavCollapsed ? (
                        <>
                            <NavButton
                                type="button"
                                className={`border-1 ${
                                    styles.navButtonWrapper
                                } rounded-lg flex gap-2 py-1 text-white ${
                                    styles.itemhover
                                } ${isNavCollapsed ? 'px-1' : 'mb-2 w-full'}`}
                            >
                                <Tooltip
                                    placement={TooltipPlacement.TopLeft}
                                    trigger={
                                        <Icon
                                            width={24}
                                            height={24}
                                            type={IconType.DOCUMENT_DUPLICATE}
                                        />
                                    }
                                    tooltipClassName="!w-auto !mr-2 !p-2 !text-sm"
                                >
                                    {t('sidenav.sharepointDocuments')}
                                </Tooltip>
                            </NavButton>
                            <div
                                className={`${styles.floatingZone}`}
                                aria-hidden="true"
                            >
                                <div
                                    className={`${styles.floatingInner} flex flex-col gap-2`}
                                >
                                    {sharePointDocumentsItems.map((item) => (
                                        <button
                                            aria-label={item.label}
                                            key={item.label}
                                            type="button"
                                            onClick={() => item.onClick()}
                                        >
                                            <Tooltip
                                                placement={
                                                    TooltipPlacement.CenterLeft
                                                }
                                                trigger={item.icon}
                                                tooltipClassName="!w-auto !mr-2 !p-2 !text-sm"
                                            >
                                                {item.label}
                                            </Tooltip>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="flex flex-row gap-2 items-center my-4">
                                <Typography
                                    variant={TypographyVariant.BodySmBold}
                                >
                                    {t('sidenav.sharepointDocuments')}
                                </Typography>
                            </div>
                            <div className={`text-gray-500`}>
                                <div aria-hidden="true">
                                    <div className={`flex flex-col gap-2 pl-2`}>
                                        {sharePointDocumentsItems.map(
                                            (item, index) => (
                                                <NavElement
                                                    key={item.label}
                                                    tabIndex={index}
                                                    size={NavElementSize.Small}
                                                    type={NavElementType.Link}
                                                    startIcon={item.icon}
                                                    className="flex items-center whitespace-nowrap"
                                                    href={`${KnowledgeBasePaths.documents}?docs=${item.href}`}
                                                    onClick={() =>
                                                        item.onClick()
                                                    }
                                                >
                                                    {item.label}
                                                </NavElement>
                                            )
                                        )}
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {renderNavButton(
                    handleOpenQuiz,
                    IconType.CIRCLE_QUESTION,
                    t('sidenav.quiz.header')
                )}

                {isNavCollapsed ? (
                    <NavButton
                        type="button"
                        className={`border-1 ${
                            styles.navButtonWrapper
                        } rounded-lg flex gap-2 py-1 text-white ${
                            styles.itemhover
                        } ${isNavCollapsed ? 'px-1 mt-2' : 'mt-4 w-full px-2'}`}
                        onClick={() => {
                            setIsNavCollapsed(false);
                            setIsSearchFocused(true);
                        }}
                    >
                        <Tooltip
                            placement={TooltipPlacement.CenterLeft}
                            trigger={
                                <Icon
                                    width={24}
                                    height={24}
                                    type={IconType.SEARCH}
                                />
                            }
                            tooltipClassName="!w-auto !mr-2 !p-2 !text-sm"
                        >
                            {t('sidenav.search')}
                        </Tooltip>
                    </NavButton>
                ) : (
                    <RecentChat
                        opsUserData={opsUserData}
                        isSearchFocused={isSearchFocused}
                    />
                )}
            </div>
            <div>
                {opsUserData.role === MeResponse.role.ADMIN &&
                    renderNavButton(
                        handleShowAdminPage,
                        IconType.COG,
                        t('sidenav.settings')
                    )}
            </div>
        </div>
    );
};

export default KnowledgeBaseSidenav;
