import { useTranslation } from 'next-i18next';

import PageHeader from '@deps/components/page-header/page-header';
import { BasePolicyComponentArgs } from '@deps/helpers/policy-sor/PolicyDetails';

export const PolicyDetailsHeader = ({
    policy,
    belowHeaderTextChildren = '',
}: BasePolicyComponentArgs & { belowHeaderTextChildren?: React.ReactNode }) => {
    const { t } = useTranslation(undefined, {
        keyPrefix: 'policy.detailCards.policyDetails',
    });

    const title = t(
        `${policy.isAnnuity ? 'contractDetails' : 'policyDetails'}`
    );

    return (
        <PageHeader
            headerText={title}
            belowHeaderTextChildren={belowHeaderTextChildren}
        />
    );
};

export default PolicyDetailsHeader;
