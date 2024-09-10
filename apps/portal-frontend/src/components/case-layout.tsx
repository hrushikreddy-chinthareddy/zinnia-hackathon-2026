import { PropsWithChildren } from 'react';

import { Case } from '@deps/models/case/case';
import NavBarCase from '@deps/navigation/nav-bar-case/nav-bar-case';

interface PageLayoutProps extends PropsWithChildren {
    caseDetails?: Case;
    children: React.ReactNode;
}

const CaseLayout = ({ children, caseDetails }: PageLayoutProps) => (
    <>
        <NavBarCase caseDetails={caseDetails} />
        <div>{children}</div>
    </>
);

export default CaseLayout;
