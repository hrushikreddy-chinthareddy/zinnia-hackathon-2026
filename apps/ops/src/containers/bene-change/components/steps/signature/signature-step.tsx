import { PartyRole, Policy } from '@zinnia/api-types/types/sor';
import { useTranslation } from 'next-i18next';
import { useState, useCallback, useEffect, ChangeEvent } from 'react';

import CheckboxText from '@deps/components/checkbox/checkbox-text/checkbox-text';
import SignatureValidationContainer from '@deps/components/otp-signature-container/component/otp-signature-conatiner';
import Radio, {
    RadioOrientation,
    RadioVariant,
} from '@deps/components/radio/radio';
import TransactionNavigationButtons, {
    ParentPage,
} from '@deps/components/transaction-navigation-buttons/transaction-navigation-buttons';
import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import WorkflowCard from '@deps/components/workflows/workflow-card/workflow-card';
import { TranslationFiles } from '@deps/config/translations';
import { SignatureState } from '@deps/containers/bene-change/bene-change.types';
import { useWorkflow } from '@deps/contexts/WorkflowContainerContext';
import {
    SignatureDesignation,
    SignatureValidationTypeWithdrawal,
    SignPresent,
} from '@deps/models/case/renewal/signature-validation';
import { SignatureWithdrawal } from '@deps/models/case/withdrawal/case';

import { useReRegSignatureStepConfig } from './signature-step-helpers';
import { useBeneChange } from '../../../bene-change-provider';
import { ENTERPRISE_ADDRESS_TYPE } from '../../beneficiary-details/address-details/address-details.helpers';

interface SignatureStepProps {
    policy: Policy;
}
const SignatureStep = ({ policy }: SignatureStepProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: 'beneChange.signature',
    });

    const jointOwnerId = policy?.partyRoles?.find(
        (pr) => pr.partyRole === PartyRole.JOINTOWNER
    )?.partyId;
    const ownerId = policy?.partyRoles?.find(
        (pr) => pr.partyRole === PartyRole.OWNER
    )?.partyId;
    const ownerPolicy = policy?.parties?.find(
        (partyItem) => partyItem.partyId === ownerId
    );
    const ownerState = ownerPolicy?.addresses?.find(
        (address) =>
            address.addressType === ENTERPRISE_ADDRESS_TYPE.HOME ||
            address.addressType === ENTERPRISE_ADDRESS_TYPE.DEFAULT
    )?.state;

    const { goToNext } = useWorkflow();
    const {
        formValidation,
        isIrrevocableBene,
        signaturesConfig,
        setIssirrovocableBene,
        setIsOwnerSignGuaranteeStamp,
        spousalSignatureStateCodes,
    } = useReRegSignatureStepConfig(
        t,
        !!jointOwnerId,
        ownerState as string,
        policy.carrierId as string
    );

    const { signatureData, setSignatureData, formErrors, setFormErrors } =
        useBeneChange();
    const [spousalConsent, setSpousalConsent] = useState(
        signatureData?.isSpousePresent ||
            (!!ownerState &&
                spousalSignatureStateCodes.includes(ownerState?.toUpperCase()))
            ? false
            : null
    );

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

    const handleSignatureChange = (
        signatureType: SignatureValidationTypeWithdrawal,
        val: SignatureWithdrawal
    ) => {
        setSignatureData((fs: SignatureState) => ({
            signatures: [
                ...fs.signatures.filter(
                    (sig) => sig.signType.text !== signatureType
                ),
                val,
            ],
            isIrrevocableBene: fs.isIrrevocableBene,
            isSpousePresent: fs.isSpousePresent,
        }));
    };

    const handleIsIrrevocableBeneChange = (
        e: ChangeEvent<HTMLInputElement>
    ) => {
        const isIrrevocableBeneRequired = e.target.value;
        if (isIrrevocableBeneRequired) {
            setIssirrovocableBene(
                isIrrevocableBeneRequired === SignPresent.Yes ? true : false
            );
        }
    };

    useEffect(() => {
        const isOwnerHasPOA = !!signatureData.signatures?.find(
            (item: SignatureWithdrawal) =>
                item.signType.text ===
                    SignatureValidationTypeWithdrawal.Owner &&
                item.signTitle.text === SignatureDesignation.AttorneyInFact
        );

        setIsOwnerSignGuaranteeStamp(isOwnerHasPOA ? true : false);
    }, [signatureData.signatures, setIsOwnerSignGuaranteeStamp]);

    useEffect(() => {
        setSignatureData((fs: SignatureState) => ({
            ...fs,
            isSpousePresent: spousalConsent,
        }));
    }, [setSignatureData, spousalConsent]);

    useEffect(() => {
        setSignatureData((fs: SignatureState) => ({
            ...fs,
            isIrrevocableBene: isIrrevocableBene,
        }));
    }, [setSignatureData, isIrrevocableBene]);

    return (
        <WorkflowCard
            title={t('header')}
            footerContent={
                <TransactionNavigationButtons
                    className="mt-10"
                    disableContinue={false}
                    handleContinue={handleStepContinue}
                    parentPage={ParentPage.CreateCase}
                    leaveTransactionLink="/create-case"
                />
            }
        >
            <Typography
                className="mb-2 mt-2"
                variant={TypographyVariant.BodySm}
            >
                {t('isIrrevocableBene')}
            </Typography>
            <Radio
                items={[
                    { label: 'Yes', value: 'Yes' },
                    { label: 'No', value: 'No' },
                ]}
                orientation={RadioOrientation.Horizontal}
                onChange={handleIsIrrevocableBeneChange}
                value={isIrrevocableBene ? SignPresent.Yes : SignPresent.No}
                required={false}
                disabled={false}
                name={'bene.signature.selectOptions'}
                variant={RadioVariant.Default}
            />
            <SignatureValidationContainer
                config={signaturesConfig}
                onSignatureSet={handleSignatureChange}
                signatureData={signatureData}
                errorData={formErrors}
            ></SignatureValidationContainer>
            {!!ownerState &&
                spousalSignatureStateCodes.includes(
                    ownerState?.toUpperCase()
                ) &&
                policy.carrierId === 'FLIC' && (
                    <div className="mt-5 flex">
                        <CheckboxText
                            label={t('spouseConsentText')}
                            checked={spousalConsent as boolean}
                            onChange={() => setSpousalConsent(!spousalConsent)}
                        />
                    </div>
                )}
        </WorkflowCard>
    );
};

export default SignatureStep;
