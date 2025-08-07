import { Policy } from '@zinnia/api-types/types/sor';

import { PageHead } from '@deps/components/page-title';
import { PolicyRole, RoleLabel } from '@deps/constants/policy';
import RoleChangeContainer from '@deps/containers/role-change/role-change-container';
import { RoleChangeProvider } from '@deps/contexts/RoleChangeContext';
import { getServerSidePropsPolicyDetailsPage } from '@deps/utils/page';
import { withPageAuthAndLogging } from '@deps/utils/server-logging';

interface IPayorProps {
    policy: Policy;
}

const PayorChange = ({ policy }: IPayorProps) => {
    return (
        <RoleChangeProvider>
            <PageHead titleKey="payorChange" />
            <RoleChangeContainer
                policy={policy}
                role={PolicyRole.PAYOR}
                roleLabel={RoleLabel.PAYOR}
            />
        </RoleChangeProvider>
    );
};

export const getServerSideProps = withPageAuthAndLogging(
    {
        getServerSideProps: getServerSidePropsPolicyDetailsPage,
    },
    {
        file: 'policies/[planCode]/[id]/policy/roles/manage-payor',
        function: 'getServerSideProps',
        page: 'policies/:planCode/:id/policy/roles/manage-payor',
    }
);

export default PayorChange;
