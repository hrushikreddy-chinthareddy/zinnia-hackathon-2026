import { PageHead } from '@deps/components/page-title';
import NewLoanContainer from '@deps/containers/financial-transactions/loan/new-loan/new-loan-container';
import { NewLoanProvider } from '@deps/contexts/transactions/NewLoanContext';
import { Policy } from '@deps/models/policy/sor-policy';
import { getServerSidePropsPolicyDetailsPage } from '@deps/utils/page';
import { withPageAuthAndLogging } from '@deps/utils/server-logging';

export interface NewLoanProps {
    policy: Policy;
}

const NewLoan = ({ policy }: NewLoanProps) => {
    return (
        <NewLoanProvider>
            <PageHead titleKey="newLoan" />
            <div className="px-4 py-6 flex justify-center md:px-6 md:py-8 lg:px-8 lg:py-10 xl:px-0 xl:py-16">
                <NewLoanContainer policy={policy} />
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
