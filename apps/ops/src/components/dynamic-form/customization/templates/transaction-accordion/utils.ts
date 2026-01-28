import { PartyRole } from '@zinnia/api-types/types/sor';

import { BeneficiaryRole, TabTitle } from './types';

export const getTitle = (
    item: any,
    index: number,
    tabTitle: string | number | boolean | object | any[] | null | undefined,
    titlePaths?: any[] | null,
    titleSeparator?: any,
    defaultTitle?: string
) => {
    let header = defaultTitle || `Item ${index + 1}`;

    if (Array.isArray(titlePaths) && titlePaths.length > 0) {
        const values = titlePaths
            .map((path: string) =>
                path
                    .split('.')
                    .reduce((acc: any, key: string) => acc?.[key], item)
            )
            .filter(Boolean);

        if (values.length > 0) {
            return values.join(titleSeparator);
        }
    }

    if (tabTitle === TabTitle.OwnerDetails) {
        header =
            item?.partyRole === PartyRole.OWNER
                ? BeneficiaryRole.OWNER
                : BeneficiaryRole.JOINTOWNER;
    } else if (tabTitle === TabTitle.BeneficiaryDetails) {
        header =
            item?.partyRole?.partyRole === PartyRole.PRIMARYBENEFICIARY
                ? BeneficiaryRole.PRIMARYBENEFICIARY
                : BeneficiaryRole.CONTINGENTBENEFICIARY;
    } else if (tabTitle === TabTitle.Signature) {
        header =
            item?.signTypeForUI ?? item?.signType ?? `Signature ${index + 1}`;
    } else if (tabTitle === TabTitle.AssigneeDetails) {
        header = item?.party?.fullName || 'Assignees';
    }
    return header;
};
