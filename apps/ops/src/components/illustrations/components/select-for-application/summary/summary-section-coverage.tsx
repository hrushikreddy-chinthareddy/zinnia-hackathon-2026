import { useIllustrationDetail } from '@deps/components/illustrations/providers/IllustrationDetailProvider';
import { ProductTypes } from '@deps/types/product';

import SectionIulCoverage from './summary-section-iul-coverage';
import SectionTermCoverage from './summary-section-term-coverage';

export default function IllustrationSelectForApplicationSectionCoverage() {
    const illustration = useIllustrationDetail();

    if (illustration?.productType === ProductTypes.INDEX_UNIVERSAL_LIFE) {
        return <SectionIulCoverage />;
    }

    return <SectionTermCoverage />;
}
