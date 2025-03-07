import { useTranslation } from 'next-i18next';
import { useMemo, useCallback } from 'react';

import SignatureValidationContainer from '@deps/components/otp-signature-container/component/otp-signature-conatiner';
import TransactionNavigationButtons, { ParentPage } from '@deps/components/transaction-navigation-buttons/transaction-navigation-buttons';
import WorkflowCard from '@deps/components/workflows/workflow-card/workflow-card';
import { TranslationFiles } from '@deps/config/translations';
import { useAddressChange } from '@deps/containers/address-change-container/address-change-provider';
import { useWorkflow } from '@deps/contexts/WorkflowContainerContext';
import { getName } from '@deps/helpers/party-info-helper';
import { SignatureValidationTypeWithdrawal } from '@deps/models/case/renewal/signature-validation';
import { SignatureWithdrawal } from '@deps/models/case/withdrawal/case';
import { PartyRole, Policy } from '@deps/models/policy/sor-policy';

import { useSignatureStepConfig } from './signature-step-helper';
import { SignatureState } from '../../types/address-change-types';
import { isAnnuitantSignatureRequired, isJointOwnerPresent } from '../../utils/address-change-helper';

export interface SignatureStepProps {
    policy: Policy;
}

export function SignatureStep({ policy }: SignatureStepProps) {
    const { t } = useTranslation(TranslationFiles.COMMON, { keyPrefix: 'addressChange.signature' });

    const { goToNext } = useWorkflow();
    // const isJointOwnerExistForPolicy = useMemo(() => isJointOwnerExist(policy?.partyRoles ?? []), [policy]);
    const isJointOwnerExistForPolicy = useMemo(() => isJointOwnerPresent(policy?.partyRoles ?? []), [policy]);
    const isAnnuitant = useMemo(() => isAnnuitantSignatureRequired(policy?.partyRoles ?? [], policy.parties ?? []), [policy]);

    const { signatureData, setSignatureData, formErrors, setFormErrors, submitSuccess } = useAddressChange();
    const { signaturesConfig, formValidation } = useSignatureStepConfig(t, isJointOwnerExistForPolicy, isAnnuitant);

    const policyOwnerId = policy?.partyRoles?.find(pr => pr.partyRole === PartyRole.OWNER)?.partyId;
    const policyOwner = policy?.parties?.find(party => party.partyId === policyOwnerId);

    const policyJointOwnerId = policy?.partyRoles?.find(pr => pr.partyRole === PartyRole.JOINTOWNER)?.partyId;
    const policyJointOwner = policy?.parties?.find(party => party.partyId === policyJointOwnerId);

    const policyAnnuitantId = policy?.partyRoles?.find(pr => pr.partyRole === PartyRole.INSURED)?.partyId;
    const policyAnnuitant = policy?.parties?.find(party => party.partyId === policyAnnuitantId);

    const handleSignatureChange = (signatureType: SignatureValidationTypeWithdrawal, val: SignatureWithdrawal) => {
        setSignatureData((fs: SignatureState) => ({
            signatures: [...fs.signatures.filter(sig => sig.signType.text !== signatureType), val],
        }));
    };

    const handleStepContinue = useCallback(() => {
        if (signatureData) {
            const formErrors = formValidation(signatureData.signatures);

            if (Object.keys(formErrors).length > 0) {
                setFormErrors(formErrors);
            } else {
                setFormErrors({});
                goToNext();
            }
        }
    }, [formValidation, signatureData, goToNext, setFormErrors]);

    if (!signatureData?.signatures) return null;

    return (
        <WorkflowCard
            title={t('header')}
            footerContent={
                <TransactionNavigationButtons
                    className="mt-10"
                    disableContinue={submitSuccess}
                    handleContinue={handleStepContinue}
                    parentPage={ParentPage.CreateCase}
                    leaveTransactionLink="/create-case"
                />
            }
        >
            <SignatureValidationContainer
                config={signaturesConfig}
                onSignatureSet={handleSignatureChange}
                signatureData={signatureData}
                errorData={formErrors}
                ownerName={getName(policyOwner)}
                jointOwnerName={getName(policyJointOwner)}
                annuitantName={getName(policyAnnuitant)}
            ></SignatureValidationContainer>
        </WorkflowCard>
    );
}
