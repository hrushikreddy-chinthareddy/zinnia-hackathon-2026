import { Policy } from '@zinnia/api-types/types/sor';

import { PageHead } from '@deps/components/page-title';
import FreeLookCancelContainer from '@deps/containers/financial-transactions/free-look-cancel/free-look-cancel-container';
import { WithdrawalProvider } from '@deps/contexts/transactions/WithdrawalContext';
import { getServerSidePropsPolicyDetailsPage } from '@deps/utils/page';
import { withPageAuthAndLogging } from '@deps/utils/server-logging';

const CancelFreeLook = ({ policy }: { policy: Policy }) => {
    return (
        <WithdrawalProvider>
            <PageHead titleKey="cancelFreeLook" />
            <FreeLookCancelContainer policy={policy} />
        </WithdrawalProvider>
    );
};

export const getServerSideProps = withPageAuthAndLogging(
    {
        getServerSideProps: getServerSidePropsPolicyDetailsPage,
    },
    {
        file: 'policies/[planCode]/[id]/policy/freelook/cancel-freelook',
        function: 'getServerSideProps',
        page: 'policies/:planCode/:id/policy/freelook/cancel-freelook',
    }
);

export default CancelFreeLook;
