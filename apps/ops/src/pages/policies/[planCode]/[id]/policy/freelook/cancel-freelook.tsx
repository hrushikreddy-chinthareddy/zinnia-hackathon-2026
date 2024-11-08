import { withPageAuthRequired } from '@auth0/nextjs-auth0';

import { PageHead } from '@deps/components/page-title';
import FreelookCancelContainer from '@deps/containers/financial-transactions/freelook-cancel/freelook-cancel-container';
// import { PremiumProvider } from '@deps/contexts/NewPremiumContext';
import { Policy } from '@deps/models/policy/sor-policy';
import { getServerSidePropsPolicyDetailsPage } from '@deps/utils/page';

const CancelFreelook = ({ policy }: { policy: Policy }) => {
    return (
        <>
            {/* <PremiumProvider> */}
            <PageHead titleKey="cancelFreelook" />
            <div className="flex w-full flex-col overflow-auto px-4 py-6 md:px-6 md:py-8 lg:px-8 lg:py-10">
                <FreelookCancelContainer policy={policy} />
            </div>
            {/* </PremiumProvider> */}
        </>
    );
};

export const getServerSideProps = withPageAuthRequired({
    getServerSideProps: getServerSidePropsPolicyDetailsPage,
});

export default CancelFreelook;
