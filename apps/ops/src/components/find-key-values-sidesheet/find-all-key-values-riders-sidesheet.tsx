import { SideSheet } from '@zinnia/bloom/components';
import { Dispatch, SetStateAction } from 'react';

import { ViewStateProvider } from '@deps/contexts/ViewStateContext';
import { toTitleCase } from '@deps/helpers/string.helpers';
import { Collapse, TreeStateProvider } from '@deps/hooks/useTreeState';

import { RiderSidesheetContent } from './content/rider-sidesheet-content';
import { RiderSidesheetProps } from './types';

/**
 * A Sidesheet component that displays all key-value pairs of a rider.
 *
 * @param {Rider} transaction - the rider
 * @returns {JSX.Element} - the rendered component
 */
export const FindAllKeyValuesRiderSidesheet = ({
    onOpenChange,
    open,
    policyDetails,
    rider,
}: RiderSidesheetProps & {
    open: boolean;
    onOpenChange: Dispatch<SetStateAction<boolean>>;
}) => {
    if (!rider) {
        return null;
    }

    return (
        <SideSheet
            trigger={null}
            header={
                <span className="typography-desktop-headline-2-d">
                    {toTitleCase(rider.riderName ?? '')}
                </span>
            }
            open={open}
            onOpenChange={onOpenChange}
            preventCloseOnOutsideClick={false}
        >
            <ViewStateProvider>
                <TreeStateProvider initialTreeState={Collapse}>
                    <RiderSidesheetContent
                        policyDetails={policyDetails}
                        rider={rider}
                    />
                </TreeStateProvider>
            </ViewStateProvider>
        </SideSheet>
    );
};
