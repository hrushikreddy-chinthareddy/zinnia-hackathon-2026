import { useTranslation } from 'next-i18next';

import CardColumns, { CardColumnsVariant } from '@deps/components/card/card-columns/card-columns';
import DescriptionLists from '@deps/components/description-list/description-lists';
import { fillColDefs } from '@deps/helpers/data-transform.helpers';
import { Policy } from '@deps/models/policy/sor-policy';

import { SideSheetCoverageColDto, toSideSheetCoverageDto, getSideSheetCoverageColDefs } from '../../../data/side-sheet-coverage-details';

const BASE_KEY = 'policy.detailCards.baseCoverage';

export interface SideSheetPolicyItemProps {
    policy: Policy;
}

export default function SideSheetCoverage({ policy }: SideSheetPolicyItemProps) {
    const { t } = useTranslation();

    const policySummaryDto = toSideSheetCoverageDto(policy);
    const policySummaryInfo = fillColDefs<SideSheetCoverageColDto>(
        policySummaryDto,
        getSideSheetCoverageColDefs(t),
        t,
        'colDefs:coverageSideSheet'
    );

    const policySummaryLists = (
        <DescriptionLists
            data={policySummaryInfo}
            labelClassName="text-gray-900"
            valueClassName="text-gray-900"
            gap="2.5"
            policy={policy}
            sideSheet
        />
    );

    const title = t(`${BASE_KEY}.coverageChangeRulesSidesheet`);
    const subHeaderContent = t(`${BASE_KEY}.sideSheetBody`);

    return (
        <div className="rounded bg-white">
            <div className="p-8">
                <CardColumns
                    items={[policySummaryLists]}
                    titles={[title]}
                    variant={CardColumnsVariant.SIDE_SHEET}
                    subHeader={subHeaderContent}
                    keepFormattingOnAllSize={true}
                />
            </div>
        </div>
    );
}
