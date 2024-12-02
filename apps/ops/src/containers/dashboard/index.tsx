import { PropsWithChildren } from 'react';

import { FiltersHeader } from '@deps/components/dashboard/filters-header/filters-header';
import Typography, { TypographyVariant } from '@deps/components/typography/typography';
import { DashboardFilterProvider } from '@deps/contexts/DashboardFilterContext';
import { DashboardResponseData } from '@deps/queries/api/dashboard';

type DashboardContainerProps = {
    title?: JSX.Element | string;
    authorizedCarriers: string[];
    initialBrokerDealers: DashboardResponseData[];
} & PropsWithChildren;

export const DashboardContainer = ({ title, authorizedCarriers, children, initialBrokerDealers }: DashboardContainerProps) => {
    return (
        <DashboardFilterProvider brokerDealers={initialBrokerDealers} authorizedCarriers={authorizedCarriers}>
            <div>
                <FiltersHeader />
                <Typography variant={TypographyVariant.H1}>{title}</Typography>
                {children}
            </div>
        </DashboardFilterProvider>
    );
};
