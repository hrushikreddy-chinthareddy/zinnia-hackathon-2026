import { useTranslation } from 'next-i18next';

import AdditionalInformationCard from '@deps/containers/coverage-sub-page/cards/additional-information-card';
import BaseCoverageCard from '@deps/containers/coverage-sub-page/cards/base-coverage-card';
import CoveragePageHeaderContainer from '@deps/containers/page-header/coverage-page-header';
import ContestabilityCard from '@deps/containers/policy-details/cards/contestability/contestability-card';
import useBreadcrumb from '@deps/hooks/useBreadcrumbs';
import { Policy } from '@deps/models/policy/sor-policy';

import { mapCoverageData } from './coverage-sub-page.helper';
import InsuredCard from '../shared-cards/insured/insured-card';

interface CoverageSubPageProps {
    policy: Policy;
}

export const CoverageSubPage = ({ policy }: CoverageSubPageProps) => {
    const { t } = useTranslation();
    const { breadcrumb } = useBreadcrumb();

    const { insured, contestability, coverage, currency, deathBenefit, netAmountAtRisk, planCode } = mapCoverageData(policy, t);

    return (
        <div className="rounded bg-white shadow-elevation-light-04">
            <CoveragePageHeaderContainer
                breadcrumbText={breadcrumb?.text}
                breadcrumbUrl={breadcrumb?.url}
                coverage={coverage}
                currency={currency}
                deathBenefit={deathBenefit}
            />
            <BaseCoverageCard policy={policy} />
            <InsuredCard insuredCardData={insured} />
            <ContestabilityCard contestabilityCardData={contestability} />
            <AdditionalInformationCard currency={currency} netAmountAtRisk={netAmountAtRisk} planCode={planCode} />
        </div>
    );
};

export default CoverageSubPage;
