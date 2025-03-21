import { PageHead } from '@deps/components/page-title';
import { ParentPage } from '@deps/components/transaction-navigation-buttons/transaction-navigation-buttons';
import AutopayContainer from '@deps/containers/financial-transactions/autopay/autopay-container';
import { AutopayProvider } from '@deps/contexts/transactions/AutopayContext';
import { ArrangementType, Policy, Reason } from '@deps/models/policy/sor-policy';
import { getServerSidePropsPolicyDetailsPage } from '@deps/utils/page';
import { withPageAuthAndLogging } from '@deps/utils/server-logging';

export interface StartLoanPaymentProps {
    policy: Policy;
}

const StartLoanPayment = ({ policy }: StartLoanPaymentProps) => {
    return (
        <AutopayProvider>
            <PageHead titleKey="loanAutopay" />
            <div className="px-4 py-6 flex justify-center md:px-6 md:py-8 lg:px-8 lg:py-10 xl:px-0 xl:py-16">
                <AutopayContainer
                    arrangementType={ArrangementType.LOANREPAYMENT}
                    isSetUp={true}
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
        file: 'policies/[planCode]/[id]/policy/loans/start-loan-payment',
        function: 'getServerSideProps',
        page: 'policies/:planCode/:id/policy/loans/start-loan-payment',
    }
);

export default StartLoanPayment;
