import { Policy } from '@zinnia/api-types/types/sor';

import { PageHead } from '@deps/components/page-title';
import { PolicyRole, RoleLabel } from '@deps/constants/policy';
import RoleChangeContainer from '@deps/containers/role-change/role-change-container';
import { RoleChangeProvider } from '@deps/contexts/RoleChangeContext';
import { getServerSidePropsPolicyDetailsPage } from '@deps/utils/page';
import { withPageAuthAndLogging } from '@deps/utils/server-logging';

interface RoleProps {
    policy: Policy;
}

const JointOwner = ({ policy }: RoleProps) => {
    return (
        <RoleChangeProvider>
            <PageHead titleKey="jointOwnerChange" />
            <RoleChangeContainer
                policy={policy}
                role={PolicyRole.JOINTOWNER}
                roleLabel={RoleLabel.JOINTOWNER}
            />
        </RoleChangeProvider>
    );
};

export const getServerSideProps = withPageAuthAndLogging(
    {
        getServerSideProps: getServerSidePropsPolicyDetailsPage,
    },
    {
        file: 'policies/[planCode]/[id]/policy/roles/manage-jointowner',
        function: 'getServerSideProps',
        page: 'policies/:planCode/:id/policy/roles/manage-jointowner',
    }
);

export default JointOwner;
