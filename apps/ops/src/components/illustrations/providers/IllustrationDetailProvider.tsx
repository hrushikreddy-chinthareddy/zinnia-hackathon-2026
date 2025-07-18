import { createContext, useContext } from 'react';

import { Illustration } from '@deps/queries/api/client/documents/v3/illustrations';

const IllustrationDetailContext = createContext<Illustration | null>(null);

export const useIllustrationDetail = () => {
    return useContext(IllustrationDetailContext);
};

export const IllustrationDetailProvider = IllustrationDetailContext.Provider;
