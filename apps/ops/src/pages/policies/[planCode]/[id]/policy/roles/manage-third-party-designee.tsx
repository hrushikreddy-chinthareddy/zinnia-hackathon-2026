import { Policy } from '@zinnia/api-types/types/sor';

import { PageHead } from '@deps/components/page-title';
import { PolicyRole, RoleLabel } from '@deps/constants/policy';
import RoleChangeContainer from '@deps/containers/role-change/role-change-container';
import { RoleChangeProvider } from '@deps/contexts/RoleChangeContext';
import { getServerSidePropsPolicyDetailsPage } from '@deps/utils/page';
import { withPageAuthAndLogging } from '@deps/utils/server-logging';

interface IThirdPartyProps {
    policy: Policy;
}

const ThirdPartyChange = ({ policy }: IThirdPartyProps) => {
    return (
        <RoleChangeProvider>
            <PageHead titleKey="thirdPartyDesigneeChange" />
            <RoleChangeContainer
                policy={policy}
                role={PolicyRole.THIRDPARTYDESIGNEE}
                roleLabel={RoleLabel.THIRDPARTYDESIGNEE}
            />
        </RoleChangeProvider>
    );
};

export const getServerSideProps = withPageAuthAndLogging(
    {
        getServerSideProps: getServerSidePropsPolicyDetailsPage,
    },
    {
        file: 'policies/[planCode]/[id]/policy/roles/manage-third-party-designee',
        function: 'getServerSideProps',
        page: 'policies/:planCode/:id/policy/roles/manage-third-party-designee',
    }
);

export default ThirdPartyChange;
