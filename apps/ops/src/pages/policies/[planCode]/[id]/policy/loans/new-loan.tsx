import { PageHead } from '@deps/components/page-title';
import NewLoanContainer from '@deps/containers/financial-transactions/loan/new-loan/new-loan-container';
import { NewLoanProvider } from '@deps/contexts/transactions/NewLoanContext';
import { getServerSidePropsPolicyDetailsPage } from '@deps/utils/page';
import { withPageAuthAndLogging } from '@deps/utils/server-logging';
import { Policy } from '@zinnia/api-types/types/sor';

export interface NewLoanProps {
    policy: Policy;
}

const NewLoan = ({ policy }: NewLoanProps) => {
    return (
        <NewLoanProvider>
            <PageHead titleKey="newLoan" />
            <NewLoanContainer policy={policy as Policy} />
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
