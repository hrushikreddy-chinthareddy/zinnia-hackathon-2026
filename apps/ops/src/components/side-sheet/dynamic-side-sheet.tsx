import { useState } from 'react';

import { useSideSheetContext } from '@deps/contexts/SideSheetContext';
import { DynamicSideSheetDataType } from '@deps/utils/dynamicSideSheet';

import DynamicSideSheetContent from './dynamic-side-sheet-content';

export default function useDynamicSideSheet(
    sideSheetData: DynamicSideSheetDataType
) {
    const tabs: DynamicSideSheetDataType['tabs'] = sideSheetData?.tabs ?? [];

    const [activeTab, setActiveTab] = useState(
        tabs.length > 0 ? tabs[0] : null
    );
    const sideSheet = useSideSheetContext();
    const openSideSheet = () => {
        sideSheet.changeSideSheetContent(
            sideSheetData?.title || '',
            <DynamicSideSheetContent
                sideSheetData={sideSheetData}
                initialTab={activeTab?.tabName || ''}
                handleButtonClick={() => {}}
            />
        );
        sideSheet.handleOpen(true);
    };

    return openSideSheet;
}
