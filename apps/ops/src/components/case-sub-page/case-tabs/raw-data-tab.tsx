import { toTitleCase } from '@xd/utils/dist';
import { useTranslation } from 'next-i18next';

import RawDataViewer from '@deps/components/raw-data-viewer/raw-data-viewer';
import CardContainer from '@deps/containers/card-container/card-container';
import { Case } from '@deps/models/case/case';

export default function RawDataTab({ caseDetails }: { caseDetails: Case }) {
    const { t } = useTranslation();
    return (
        <CardContainer>
            <RawDataViewer
                data={caseDetails}
                title={toTitleCase(t('site.navLinks.caseDetails.text'))}
            />
        </CardContainer>
    );
}
