import { withPageAuthRequired } from '@auth0/nextjs-auth0';

import { PageHead } from '@deps/components/page-title';
import { ParentPage } from '@deps/components/transaction-navigation-buttons/transaction-navigation-buttons';
import AutopayContainer from '@deps/containers/financial-transactions/autopay/autopay-container';
import { AutopayProvider } from '@deps/contexts/transactions/AutopayContext';
import { ArrangementType, Policy, Reason } from '@deps/models/policy/sor-policy';
import { getServerSidePropsPolicyDetailsPage } from '@deps/utils/page';

export interface ManageLoanPaymentProps {
    policy: Policy;
}

const ManageLoanPayment = ({ policy }: ManageLoanPaymentProps) => {
    return (
        <AutopayProvider>
            <PageHead titleKey="loanAutopay" />
            <div className="px-4 py-6 flex justify-center md:px-6 md:py-8 lg:px-8 lg:py-10 xl:px-0 xl:py-16">
                <AutopayContainer
                    arrangementType={ArrangementType.LOANREPAYMENT}
                    policy={policy}
                    parentPage={ParentPage.Loans}
                    systematicProgramReason={Reason.LOANREPAYMENT}
                    translationKeyPrefix='loanAutopay'
                />
            </div>
        </AutopayProvider>
    );
};

export const getServerSideProps = withPageAuthRequired({
    getServerSideProps: getServerSidePropsPolicyDetailsPage,
});

export default ManageLoanPayment;
