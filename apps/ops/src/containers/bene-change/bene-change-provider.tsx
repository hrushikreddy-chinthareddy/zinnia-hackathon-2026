import { useContext, useState } from 'react';

import { SignatureState } from '@deps/containers/bene-change/bene-change.types';
import { BeneChangeContext } from '@deps/contexts/BeneChangeContext';
import { FormValidationErrors } from '@deps/models/case/withdrawal/case';

import { PeopleState } from '../people-sub-page';

type BeneChangeProviderProps = {
    children: React.ReactNode;
};

const INITIAL_FORM_DATA: any = {
    caseId: undefined,
    businessKey: undefined,
    isPrimaryBeneInfoOnFile: false,
    isContingentBeneInfoOnFile: false
};

/*interface BeneData {
    actionType: string,
    action: string,
    partyRole: any,
    party: any,
    isPerStirpes: boolean,
    isIrrevocable: boolean,
    isRestrictedBeneficiary: boolean
};*/

const initialPeopleState: PeopleState = {
    cardActionData: {
        filteredData: [],
        isAgentSelected: false,
        isBeneficiarySelected: false,
    },
    selectedChip: 'All',
    selectedTagList: ['All'],
};

export const BeneChangeProvider = ({ children }: BeneChangeProviderProps) => {
    const [formData, setFormData] = useState(INITIAL_FORM_DATA);
    const [formErrors, setFormErrors] = useState<FormValidationErrors>({});
    const [beneData, setBeneData] = useState<any>([]);
    const [deletedBene, setDeletedBene] = useState<any>([]);
    const [peopleSelection, setPeopleSelection] = useState<PeopleState>(initialPeopleState);
    const [signatureData, setSignatureData] = useState<SignatureState>({ signatures: [], isIrrevocableBene: false, isSpousePresent: null });
    const [isPeopleView, setIsPeopleView] = useState<boolean>(true);
    const [ownerInfo, setOwnerInfo] = useState({});

    return (
        <BeneChangeContext.Provider
            value={{
                isPeopleView,
                formData,
                beneData,
                deletedBene,
                peopleSelection,
                formErrors,
                signatureData,
                ownerInfo,
                setPeopleSelection,
                setFormData,
                setFormErrors,
                setBeneData,
                setSignatureData,
                setIsPeopleView,
                setOwnerInfo,
                setDeletedBene
            }}
        >
            {children}
        </BeneChangeContext.Provider>
    );
};

export const useBeneChange = () => {
    const context = useContext(BeneChangeContext);

    if (!context) {
        throw new Error('useBeneChange must be used within a BeneChangeProvider');
    }
    return context;
};
