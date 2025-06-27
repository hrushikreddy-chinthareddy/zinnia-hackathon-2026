import { Meta } from '@storybook/react';

import Button from '@deps/components/button/button';
import {
    SideSheetProvider,
    useSideSheetContext,
} from '@deps/contexts/SideSheetContext';
import { mockPolicy } from '@deps/jest/data/mockPolicy';

import '@deps/styles/styles.css';

import SideSheetPolicyItemForStoryBook from './side-sheet-policy-item';

export default {
    title: 'Components/SideSheet',
    component: SideSheetPolicyItemForStoryBook,
    decorators: [
        (Story) => (
            <div className="container">
                <SideSheetProvider>
                    <Story />
                </SideSheetProvider>
            </div>
        ),
    ],
} as Meta<typeof SideSheetPolicyItemForStoryBook>;

export const PolicyItems = () => {
    const mockItems = [
        <SideSheetPolicyItemForStoryBook key={1} policy={mockPolicy} />,
        <SideSheetPolicyItemForStoryBook key={2} policy={mockPolicy} />,
        <SideSheetPolicyItemForStoryBook key={3} policy={mockPolicy} />,
    ];

    const sideSheet = useSideSheetContext();
    const openSideSheet = () => {
        sideSheet.changeSideSheetContent(
            'Related Policies',
            <div className="relative z-10 flex flex-1 flex-col gap-6 bg-gray-100 px-4 pb-6 pt-6 sm:px-6">
                {mockItems.map((item, index) => {
                    return <div key={index}>{item}</div>;
                })}
            </div>
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
