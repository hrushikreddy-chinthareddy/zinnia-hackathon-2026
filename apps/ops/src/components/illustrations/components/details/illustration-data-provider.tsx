import { createContext, useContext } from 'react';

import { Illustration } from '@deps/queries/api/client/documents/v3/illustrations';

const IllustrationDataContext = createContext<Illustration | null>(null);

export const useIllustrationData = () => {
    return useContext(IllustrationDataContext);
};

export const IllustrationDataProvider = IllustrationDataContext.Provider;
