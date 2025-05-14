import { PageHead } from '@deps/components/page-title';
import { ParentPage } from '@deps/components/transaction-navigation-buttons/transaction-navigation-buttons';
import AutopayContainer from '@deps/containers/financial-transactions/autopay/autopay-container';
import { AutopayProvider } from '@deps/contexts/transactions/AutopayContext';
import { ArrangementType, Policy, Reason } from '@deps/models/policy/sor-policy';
import { getServerSidePropsPolicyDetailsPage } from '@deps/utils/page';
import { withPageAuthAndLogging } from '@deps/utils/server-logging';

export interface ManageLoanPaymentProps {
    policy: Policy;
}

const ManageLoanPayment = ({ policy }: ManageLoanPaymentProps) => {
    return (
        <AutopayProvider>
            <PageHead titleKey="loanAutopay" />
            <div className="px-4 flex justify-center md:px-6 lg:px-8 xl:px-0">
                <AutopayContainer
                    arrangementType={ArrangementType.LOANREPAYMENT}
                    policy={policy}
                    parentPage={ParentPage.Loans}
                    systematicProgramReason={Reason.LOANREPAYMENT}
                    translationKeyPrefix="loanAutopay"
                />
            </div>
        </AutopayProvider>
    );
};

export const getServerSideProps = withPageAuthAndLogging(
    {
        getServerSideProps: getServerSidePropsPolicyDetailsPage,
    },
    {
        file: 'policies/[planCode]/[id]/policy/loans/manage-loan-payment',
        function: 'getServerSideProps',
        page: 'policies/:planCode/:id/policy/loans/manage-loan-payment',
    }
);

export default ManageLoanPayment;
