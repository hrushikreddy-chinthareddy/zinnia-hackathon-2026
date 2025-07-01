import { createContext } from 'react';

import { SearchBarInitialValues } from '@deps/components/search/search-bar';
import { SearchViewQuery } from '@deps/types/search';

export interface DashboardContextProps {
    searchValue: SearchViewQuery;
}

export const DashboardContext = createContext<DashboardContextProps>({
    searchValue: SearchBarInitialValues,
});
