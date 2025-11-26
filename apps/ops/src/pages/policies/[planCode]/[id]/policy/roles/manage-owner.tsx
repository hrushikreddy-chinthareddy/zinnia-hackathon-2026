import { PageHead } from '@deps/components/page-title';
import { PolicyRole, RoleLabel } from '@deps/constants/policy';
import RoleChangeContainer from '@deps/containers/role-change/role-change-container';
import { RoleChangeProvider } from '@deps/contexts/RoleChangeContext';
import { getServerSidePropsPolicyDetailsPage } from '@deps/utils/page';
import { withPageAuthAndLogging } from '@deps/utils/server-logging';
import { Policy } from '@zinnia/api-types/types/sor';

interface fundProps {
    policy: Policy;
}

const OwnerChange = ({ policy }: fundProps) => {
    return (
        <RoleChangeProvider>
            <PageHead titleKey="ownerChange" />
            <RoleChangeContainer
                policy={policy}
                role={PolicyRole.OWNER}
                roleLabel={RoleLabel.OWNER}
            />
        </RoleChangeProvider>
    );
};

export const getServerSideProps = withPageAuthAndLogging(
    {
        getServerSideProps: getServerSidePropsPolicyDetailsPage,
    },
    {
        file: 'policies/[planCode]/[id]/policy/roles/manage-owner',
        function: 'getServerSideProps',
        page: 'policies/:planCode/:id/policy/roles/manage-owner',
    }
);

export default OwnerChange;
