import clsx from 'clsx';

import TaskInfo from '../task-info/task-info';

export interface GlobalValuesBarNbProps {
    children?: React.ReactNode;
    carrierId: string;
    isNavDrawerOpen?: boolean;
    showLink?: boolean;
    caseId?: string;
}

const GlobalValuesNbBar = ({ children, carrierId, isNavDrawerOpen, caseId }: GlobalValuesBarNbProps) => {
    const headerClasses = clsx('flex w-full flex-col pb-4 md:pb-6 lg:pb-8', isNavDrawerOpen ? 'lg:flex-col xl:flex-row' : 'lg:flex-row');

    return (
        <div className={headerClasses}>
            <div className="mr-0 flex flex-col md:flex-row">
                <TaskInfo carrierId={carrierId} caseId={caseId} />
            </div>
            {children}
        </div>
    );
};

export default GlobalValuesNbBar;
