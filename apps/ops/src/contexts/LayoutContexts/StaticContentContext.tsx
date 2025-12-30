import { useTranslation } from 'next-i18next';
import { PropsWithChildren, createContext, useContext, useMemo } from 'react';

import { GlobalValues } from '@deps/components/global-values/global-values.types';
import { PolicyDetails } from '@deps/helpers/policy-sor/PolicyDetails';
import { Policy } from '@zinnia/api-types/types/sor';

import { policyDataToGlobalValues } from '../../helpers/global-values';

interface StaticContentContextProps {
    globalValuesData: GlobalValues;
}

const StaticContentContext = createContext<StaticContentContextProps>({
    globalValuesData: {} as GlobalValues,
});

export const useContentContext = () => {
    return useContext(StaticContentContext);
};

interface StaticContentProviderProps extends PropsWithChildren {
    policy: Policy;
}

export const StaticContentProvider = ({
    children,
    policy,
}: StaticContentProviderProps) => {
    const { t } = useTranslation();

    const globalValuesData = useMemo(() => {
        return policyDataToGlobalValues(new PolicyDetails(policy), t);
    }, [policy, t]);

    return (
        <StaticContentContext.Provider value={{ globalValuesData }}>
            {children}
        </StaticContentContext.Provider>
    );
};
