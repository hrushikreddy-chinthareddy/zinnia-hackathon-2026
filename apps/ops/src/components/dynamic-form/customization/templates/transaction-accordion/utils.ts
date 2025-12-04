import { PartyRole } from '@deps/models/policy/sor-policy';

import { BeneficiaryRole, TabTitle } from './types';

export const getTitle = (
    item: any,
    index: number,
    tabTitle: string | number | boolean | object | any[] | null | undefined
) => {
    let header = `Item ${index + 1}`;
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
