import { GetServerSidePropsContext } from 'next';

import { filterAliasesWithSellingCode } from '@deps/components/illustrations/helpers/hooks/user-identity';
import { UserPermission } from '@deps/models/user-profile';
import { listCarriersPage } from '@deps/queries/api/server/fga/listCarriers';
import { getPartyReferenceByPartyId } from '@deps/queries/api/server/v1/party-reference';
import { LoggingContext } from '@deps/utils/server-logging';

export const canUserCreateClientCase = async (
    context: GetServerSidePropsContext,
    loggingContext: LoggingContext
) => {
    // Validate loggin user permissions
    const carriersList = await listCarriersPage(
        context,
        UserPermission.AllowWriteClientCase,
        loggingContext
    );
    const partyReference = await getPartyReferenceByPartyId(
        loggingContext.user?.partyId!,
        loggingContext
    );
    const aliases = filterAliasesWithSellingCode(partyReference?.alias);
    const isAgent = aliases?.length ?? 0 > 0;
    const isAllowWriteClientCase = !!carriersList.length; //TODO: update this to check the ui access permission when CIAM implements

    return !!(isAgent || isAllowWriteClientCase);
};
