import router from 'next/router';
import { useEffect, useState } from 'react';

import KnowledgeBaseSidenav from '@deps/components/knowledge-base/knowledge-base-sidenav/knowledge-base-sidenav';
import KnowledgeBaseProvider from '@deps/contexts/KnowledgeBaseContext';
import { useScreenSize } from '@deps/hooks/useScreenSize';
import { SCREEN_BREAKPOINTS } from '@deps/types/constants';
import { MeResponse } from '@zinnia/api-types/types/knowledgebase';

import styles from './knowledge-base-container.module.css';

type KnowledgeBaseContainerProps = {
    opsUserData: MeResponse;
    children: React.ReactNode;
    sessionId?: string;
};

const KnowledgeBaseContainer = ({
    opsUserData,
    children,
    sessionId = '',
}: KnowledgeBaseContainerProps) => {
    const isLargeScreen = useScreenSize(SCREEN_BREAKPOINTS.md);
    const [isNavCollapsed, setIsNavCollapsed] = useState(false);

    useEffect(() => {
        setIsNavCollapsed(!isLargeScreen);
    }, [isLargeScreen]);

    useEffect(() => {
        const handleRouteChange = () => {
            if (!isLargeScreen && !isNavCollapsed) {
                setIsNavCollapsed(true);
            }
        };

        router.events.on('routeChangeComplete', handleRouteChange);
        return () =>
            router.events.off('routeChangeComplete', handleRouteChange);
    }, [isNavCollapsed, isLargeScreen]);

    return (
        <KnowledgeBaseProvider opsUserData={opsUserData} sessionId={sessionId}>
            <div
                className={`flex w-full h-full relative ${styles.knowledgeBaseContainer}`}
            >
                <div
                    className={`transition-all duration-300 ${
                        isNavCollapsed
                            ? styles.knowledgeBaseContainerCollapsed
                            : styles.knowledgeBaseContainerExpanded
                    }`}
                >
                    {children}
                </div>
                <KnowledgeBaseSidenav
                    opsUserData={opsUserData}
                    isNavCollapsed={isNavCollapsed}
                    setIsNavCollapsed={setIsNavCollapsed}
                />
            </div>
        </KnowledgeBaseProvider>
    );
};

export default KnowledgeBaseContainer;
