import { SideSheet } from '@zinnia/bloom/components';
import { Dispatch, SetStateAction } from 'react';

import { Collapse, TreeStateProvider } from '@deps/hooks/useTreeState';
import { FundAllocation, Fund } from '@zinnia/api-types/types/sor';

import { FundSidesheetContent } from './content/fund-sidesheet-content';

/**
 * Props for the FindAllKeyValuesFundSidesheet component.
 */
interface FindAllKeyValuesFundSidesheetProps {
    /** Whether the sidesheet is open */
    open: boolean;
    /** Callback to control open state */
    onOpenChange: Dispatch<SetStateAction<boolean>>;
    /** The selected fund from the funds table */
    combinedFund: Fund | FundAllocation;
}

/**
 * A Sidesheet component that displays all key-value pairs for a fund.
 *
 * Displays fund data in a 3-level nested structure:
 * - Level 1: Fund information (merged from fundAllocationsInvestments + funds)
 * - Level 2: Segments (accordion sections)
 * - Level 3: Rates (nested accordions within segments)
 *
 * Includes type-ahead search to quickly locate specific values.
 *
 * @param props - Component props
 * @returns The rendered sidesheet component
 */
export const FindAllKeyValuesFundSidesheet = ({
    open,
    onOpenChange,
    combinedFund,
}: FindAllKeyValuesFundSidesheetProps) => {
    const fundName = combinedFund.fundName ?? 'Fund Details';

    return (
        <SideSheet
            trigger={null}
            header={
                <span className="typography-desktop-headline-2-d">
                    {fundName}
                </span>
            }
            open={open}
            onOpenChange={onOpenChange}
            preventCloseOnOutsideClick={false}
        >
            <TreeStateProvider initialTreeState={Collapse}>
                <FundSidesheetContent combinedFund={combinedFund} />
            </TreeStateProvider>
        </SideSheet>
    );
};
