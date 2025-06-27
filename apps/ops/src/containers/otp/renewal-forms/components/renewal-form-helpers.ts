import { LifeCadParty } from '@deps/models/case/lifecad-party';

export const OWNER_TYPES = ['Primary', 'Joint'];

export const DEFAULT_TRANS_OPTION = '2';

export const getOwnerInfo = (owners: LifeCadParty[]) => {
    return owners.map((owner) => {
        const ownerType = owner?.SrcRoleOptionIdDesc?.includes('Joint')
            ? 'Joint'
            : owner.SrcRoleOptionIdDesc;
        return {
            firstName: owner.FirstName || null,
            middleName: owner.MiddleName || null,
            lastName: owner.LastName || null,
            fullName: owner.FullName || null,
            type: ownerType,
            signature: {
                title: owner?.PersonType,
                signaturePresent: '',
                type: ownerType,
                isValidDate: false,
                signDate: null,
                name: null,
            },
        };
    });
};
