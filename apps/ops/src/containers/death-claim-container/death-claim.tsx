import { useContext, useState } from 'react';

import { DeathClaimContext } from '@deps/contexts/DeathClaimContext';
import { Correspondence } from '@deps/models/case/correspondence';
import { FormValidationErrors } from '@deps/models/case/withdrawal/case';

import { DeceasedParty, NotificationMethod, NotifierParty } from './death-claim.types';

type DeathClaimProviderProps = {
    children: React.ReactNode;
};

const INITIAL_FORM_DATA: any = {
};

export const DeathClaimProvider = ({ children }: DeathClaimProviderProps) => {
    const [formData, setFormData] = useState(INITIAL_FORM_DATA);
    const [formErrors, setFormErrors] = useState<FormValidationErrors>({});
    const [submitFailed, setSubmitFailed] = useState<boolean>(false);
    const [correspondence, setCorrespondence] = useState<Correspondence>({} as Correspondence);
    const [notifiers, setNotifiers] = useState<NotifierParty>({} as NotifierParty);
    const [owners, setOwners] = useState<DeceasedParty[]>([]);
    const [beneficiaries, setBeneficiaries] = useState<NotificationMethod[]>([]);
    const [caseId, setCaseId] = useState<string>('');

    return (
        <DeathClaimContext.Provider
            value={{
                formData,
                formErrors,
                submitFailed,
                correspondence,
                notifiers,
                owners,
                beneficiaries,
                caseId,
                setFormData,
                setFormErrors,
                setSubmitFailed,
                setCorrespondence,
                setNotifiers,
                setOwners,
                setBeneficiaries,
                setCaseId
            }}
        >
            {children}
        </DeathClaimContext.Provider>
    );
};

export const useDeathClaim = () => {
    const context = useContext(DeathClaimContext);

    if (!context) {
        throw new Error('useDeathClaim must be used within a DeathClaimProvider');
    }
    return context;
};
