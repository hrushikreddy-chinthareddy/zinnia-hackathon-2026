import { Party } from '@xd/api-types/dist/generated-types/sor';
import { TFunction } from 'next-i18next';
import { FC, useContext, useState } from 'react';

import NavElement, { NavElementSize, NavElementType } from '@deps/components/nav-element/nav-element';
import { useOptimizely } from '@deps/contexts/OptimizelyContext';
import { PolicyData } from '@deps/contexts/PolicyDataContext';
import { useSideSheetContext } from '@deps/contexts/SideSheetContext';
import { ReactComponent as EditIcon } from '@deps/styles/elements/icons/icons_outlined/edit-alt.svg';
import { FEATURE_FLAGS } from '@deps/utils/optimizely/flags';

import { SidesheetNameCard } from './sidesheet/sidesheet-name-card';

interface INameCardProps {
    selectedPolicyParty?: Party;
    children: React.ReactNode;
    t: TFunction;
    editable?: boolean;
}

export const NameCard: FC<INameCardProps> = ({ children, selectedPolicyParty, t, editable }) => {
    const sidesheet = useSideSheetContext();
    const { policyDetails } = useContext(PolicyData);
    const { featureFlags } = useOptimizely();
    const partyNameChangeEnabled = featureFlags[FEATURE_FLAGS.PARTY_NAME_CHANGE_TRANSACTION];

    const handleEditClick = () => {
        sidesheet.changeSideSheetContent(
            t('people.sideSheet.name.editName'),
            <SidesheetNameCard
                onCancel={() => sidesheet.handleOpen(false)}
                policyDetails={policyDetails}
                selectedPolicyParty={selectedPolicyParty}
            />
        );
        sidesheet.handleOpen(true);
    };

    return (
        <div className="flex items-start align-middle justify-between bg-opacity-50 pb-2">
            <div className="flex h-6 items-center gap-2 xs:mt-2">
                {children}
                {editable && partyNameChangeEnabled && (
                    <NavElement type={NavElementType.Button} size={NavElementSize.Small} tabIndex={0} className=" h-4">
                        <EditIcon height={16} onClick={handleEditClick} data-testid="edit-icon" />
                    </NavElement>
                )}
            </div>
        </div>
    );
};
