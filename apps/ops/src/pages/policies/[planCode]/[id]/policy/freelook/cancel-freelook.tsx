import { PageHead } from '@deps/components/page-title';
import FreeLookCancelContainer from '@deps/containers/financial-transactions/free-look-cancel/free-look-cancel';
import { WithdrawalProvider } from '@deps/contexts/transactions/WithdrawalContext';
import { Policy } from '@deps/models/policy/sor-policy';
import { getServerSidePropsPolicyDetailsPage } from '@deps/utils/page';
import { withPageAuthAndLogging } from '@deps/utils/server-logging';

const CancelFreeLook = ({ policy }: { policy: Policy }) => {
    return (
        <WithdrawalProvider>
            <PageHead titleKey="cancelFreeLook" />
            <div className="flex w-full flex-col overflow-auto px-4 py-6 md:px-6 md:py-8 lg:px-8 lg:py-10">
                <FreeLookCancelContainer policy={policy} />
            </div>
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
