import { PropsWithChildren, ReactElement } from 'react';

import ResponsiveGrid from '@deps/components/responsive-grid/responsive-grid';
import { filterTruthyProps } from '@deps/helpers/data-transform.helpers';

import { BadgeWithTooltipProps } from '../badge/badge-with-tooltip/badge-with-tooltip';
import PolicyExtrasHeader, {
    PolicyExtrasHeaderProps,
} from '../policy-extras-header/policy-extras-header';

export type PolicyExtrasCardProps = {
    badge: ReactElement<BadgeWithTooltipProps>;
} & PolicyExtrasHeaderProps &
    PropsWithChildren;

const PolicyExtrasCard = ({
    children,
    badge,
    headerText,
    subheader,
    labelText,
    ...toltipProps
}: PolicyExtrasCardProps) => {
    return (
        <article className="mb-2 grid grid-cols-[1fr] gap-y-4 rounded border-2 border-gray-100 p-4 last:mb-0  md:p-6 lg:grid-cols-[6em,1fr] lg:gap-x-6 lg:p-8 xl:gap-x-8">
            <div className="col-span-full lg:row-span-1 lg:row-start-1">
                <PolicyExtrasHeader
                    headerText={headerText}
                    subheader={subheader}
                    labelText={labelText}
                    {...filterTruthyProps(toltipProps)}
                />
            </div>
            <div className="col-span-1 col-start-1 row-span-1 row-start-2 mb-2 place-self-start">
                {badge}
            </div>
            <ResponsiveGrid>{children}</ResponsiveGrid>
        </article>
    );
};

export default PolicyExtrasCard;
