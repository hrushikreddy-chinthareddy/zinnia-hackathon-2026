import { Policy } from '@zinnia/api-types/types/sor';

import { PageHead } from '@deps/components/page-title';
import NewLoanContainer from '@deps/containers/financial-transactions/loan/new-loan/new-loan-container';
import { NewLoanProvider } from '@deps/contexts/transactions/NewLoanContext';
import { Policy as PolicyOld } from '@deps/models/policy/sor-policy';
import { getServerSidePropsPolicyDetailsPage } from '@deps/utils/page';
import { withPageAuthAndLogging } from '@deps/utils/server-logging';

export interface NewLoanProps {
    policy: PolicyOld;
}

const NewLoan = ({ policy }: NewLoanProps) => {
    return (
        <NewLoanProvider>
            <PageHead titleKey="newLoan" />
            <div className="px-4 flex justify-center md:px-6 lg:px-8 xl:px-0">
                <NewLoanContainer policy={policy as Policy} />
            </div>
        </NewLoanProvider>
    );
};

export const getServerSideProps = withPageAuthAndLogging(
    {
        getServerSideProps: getServerSidePropsPolicyDetailsPage,
    },
    {
        file: 'policies/[planCode]/[id]/policy/loans/new-loan',
        function: 'getServerSideProps',
        page: 'policies/:planCode/:id/policy/loans/new-loan',
    }
);

export default NewLoan;
