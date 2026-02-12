import { Meta } from '@storybook/react';

import Button, { ButtonSize, ButtonType } from '@deps/components/button/button';
import '@deps/styles/styles.css';
import NavElement, {
    NavElementSize,
    NavElementType,
    NavElementVariant,
} from '@deps/components/nav-element/nav-element';

import {
    SideSheetProviderLegacy,
    useSideSheetContextLegacy,
} from './SideSheetContext';

export default {
    title: 'Context/SideSheet',
    component: SideSheetProviderLegacy,
    decorators: [
        (Story) => (
            <div className="container">
                <Story />
            </div>
        ),
    ],
} as Meta<typeof SideSheetProviderLegacy>;

export const MyApp = () => {
    return (
        <div className="flex">
            <SideSheetProviderLegacy>
                <MyComponent></MyComponent>
            </SideSheetProviderLegacy>
        </div>
    );
};

const MyComponent = () => {
    const sideSheet = useSideSheetContextLegacy();

    const clickButton1 = () => {
        sideSheet.changeSideSheetContent('Header 1', <SideSheetContent1 />);
        sideSheet.handleOpen(true);
    };

    const clickButton2 = () => {
        sideSheet.changeSideSheetContent(<>Header 2</>, <SideSheetContent2 />);
        sideSheet.handleOpen(true);
    };
    return (
        <div className="width-20">
            <Button onClick={clickButton1} className="mb-2">
                Open Side Sheet #1
            </Button>
            <Button onClick={clickButton2}>Open Side Sheet #2</Button>
        </div>
    );
};

const SideSheetContent1: React.FC = () => {
    return <div className="m-8">Side Sheet Content #1!</div>;
};

const SideSheetContent2: React.FC = () => {
    const sideSheet = useSideSheetContextLegacy();

    const swapClick = () => {
        sideSheet.changeSideSheetContent(
            <>Component #1 with a different header</>,
            <SideSheetContent1 />
        );
    };

    const cancelClick = () => {
        sideSheet.handleOpen(false);
    };

    return (
        <div className="m-8">
            Side Sheet Content #2!
            <div className="mt-2">
                <div className="flex flex-row justify-start gap-6">
                    <div className="flex flex-col">
                        <Button
                            type={ButtonType.Primary}
                            size={ButtonSize.Small}
                            onClick={() => swapClick()}
                        >
                            Swap to component #1
                        </Button>
                    </div>
                    <NavElement
                        type={NavElementType.Button}
                        size={NavElementSize.Small}
                        variant={NavElementVariant.Default}
                        onClick={() => cancelClick()}
                    >
                        Cancel
                    </NavElement>
                </div>
            </div>
        </div>
    );
};
