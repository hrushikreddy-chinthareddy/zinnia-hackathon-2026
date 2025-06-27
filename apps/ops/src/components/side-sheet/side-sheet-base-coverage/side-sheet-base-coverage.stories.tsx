import { Meta } from '@storybook/react';

import Button from '@deps/components/button/button';
import {
    SideSheetProvider,
    useSideSheetContext,
} from '@deps/contexts/SideSheetContext';
import { mockPolicy } from '@deps/jest/data/mockPolicy';

import SideSheetCoverage from './side-sheet-base-coverage';

import '@deps/styles/styles.css';

export default {
    title: 'Components/SideSheet',
    component: SideSheetCoverage,
    decorators: [
        (Story) => (
            <div className="container">
                <SideSheetProvider>
                    <Story />
                </SideSheetProvider>
            </div>
        ),
    ],
} as Meta<typeof SideSheetCoverage>;

export const BaseCoverage = () => {
    const sideSheet = useSideSheetContext();
    const openSideSheet = () => {
        sideSheet.changeSideSheetContent(
            'Related Policies',
            <SideSheetCoverage policy={mockPolicy} />
        );
        sideSheet.handleOpen(true);
    };

    return (
        <div className="flex">
            <div className="width-20">
                <Button onClick={openSideSheet}>Open SideSheet</Button>
            </div>
        </div>
    );
};
