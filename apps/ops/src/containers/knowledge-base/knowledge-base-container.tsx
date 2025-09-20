import { MeResponse } from '@xd/api-types/dist/generated-types/knowledgebase';

import KnowledgeBaseSidenav from '@deps/components/knowledge-base/knowledge-base-sidenav/knowledge-base-sidenav';
import KnowledgeBaseProvider from '@deps/contexts/KnowledgeBaseContext';

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
    return (
        <KnowledgeBaseProvider opsUserData={opsUserData} sessionId={sessionId}>
            <div className="flex w-full h-full">
                <div className="flex-1 h-full ">{children}</div>
                <KnowledgeBaseSidenav opsUserData={opsUserData} />
            </div>
        </KnowledgeBaseProvider>
    );
};

export default KnowledgeBaseContainer;
