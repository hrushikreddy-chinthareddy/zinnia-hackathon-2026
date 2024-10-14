import { useState, createContext, Dispatch, SetStateAction } from 'react';

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = () => {};

type CaseOverviewNavDrawerContextType = [string, Dispatch<SetStateAction<string>>];

export const CASE_OVERVIEW_TEXT = 'Case Overview';

const defaultValue: CaseOverviewNavDrawerContextType = [CASE_OVERVIEW_TEXT, noop];

export const CaseOverviewNavDrawerContext = createContext<CaseOverviewNavDrawerContextType>(defaultValue);

export const CaseOverviewNavDrawerProvider = ({ children }: any) => {
    const [selectedNavItem, setSelectedNavItem] = useState(CASE_OVERVIEW_TEXT);

    return (
        <CaseOverviewNavDrawerContext.Provider value={[selectedNavItem, setSelectedNavItem]}>
            {children}
        </CaseOverviewNavDrawerContext.Provider>
    );
};
