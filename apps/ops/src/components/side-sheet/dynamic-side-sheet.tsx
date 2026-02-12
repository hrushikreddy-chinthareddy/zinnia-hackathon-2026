import { useState } from 'react';

/**
 * @deprecated Use standard Sidesheet from Bloom component library
 */
import { useSideSheetContextLegacy } from '@deps/contexts/SideSheetContext';
import { DynamicSideSheetDataType } from '@deps/utils/dynamicSideSheet';

import DynamicSideSheetContent from './dynamic-side-sheet-content';

export default function useDynamicSideSheet(
    sideSheetData: DynamicSideSheetDataType
) {
    const tabs: DynamicSideSheetDataType['tabs'] = sideSheetData?.tabs ?? [];

    const [activeTab] = useState(tabs.length > 0 ? tabs[0] : null);
    const sideSheet = useSideSheetContextLegacy();
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
