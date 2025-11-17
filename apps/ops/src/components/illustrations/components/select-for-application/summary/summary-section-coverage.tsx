import { useIllustrationDetail } from '@deps/components/illustrations/providers/IllustrationDetailProvider';
import { IllustrationsClientCase } from '@deps/types/illustrations';
import { ProductTypes } from '@deps/types/product';

import SectionIulCoverage from './summary-section-iul-coverage';
import SectionTermCoverage from './summary-section-term-coverage';

type IllustrationSelectForApplicationSectionCoverageProps = {
    clientCase: IllustrationsClientCase;
};

export default function IllustrationSelectForApplicationSectionCoverage({
    clientCase,
}: IllustrationSelectForApplicationSectionCoverageProps) {
    const illustration = useIllustrationDetail();

    if (illustration?.productType === ProductTypes.INDEX_UNIVERSAL_LIFE) {
        return <SectionIulCoverage clientCase={clientCase} />;
    }

    return <SectionTermCoverage />;
}
