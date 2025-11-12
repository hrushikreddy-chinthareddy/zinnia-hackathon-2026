import { PartyRole, PhoneType, Policy } from '@zinnia/api-types/types/sor';
import {
    AssistiveText,
    AssistiveTextVariant,
    Loader,
} from '@zinnia/bloom/components';
import { useTranslation } from 'next-i18next';
import { useEffect, useMemo, useState } from 'react';

import TransactionNavigationButtons, {
    ParentPage,
} from '@deps/components/transaction-navigation-buttons/transaction-navigation-buttons';
import WorkflowCard from '@deps/components/workflows/workflow-card/workflow-card';
import { TranslationFiles } from '@deps/config/translations';
import {
    buildClaimPaylod,
    validateOtherNotifier,
} from '@deps/containers/death-claim-container/death-claim.helpers';
import { getPolicyOwnersByRole } from '@deps/containers/death-claim-container/steps/death-claim-notifier/death-claim-notifier.helpers';
import { useDeathClaim } from '@deps/contexts/DeathClaimContext';
import { useWorkflow } from '@deps/contexts/WorkflowContainerContext';
import {
    isNullEmptyOrUndefined,
    toTitleCase,
} from '@deps/helpers/string.helpers';
import { FormValidationErrors } from '@deps/models/case/withdrawal/case';
import { PartyType } from '@deps/models/policy/sor-policy';
import { UserProfile } from '@deps/models/user-profile';
import { submitDeathClaim } from '@deps/queries/api/web-non-financial';
import { browserLogInfo } from '@deps/utils/browser-logging';

import { DeathClaim } from './death-claim';
import { DeceasedDetails } from './deceased-details';
import {
    DeceasedParty,
    NotifierParty,
    RoleType,
} from '../../death-claim.types';

interface DeathClaimNotificationStepProps {
    policy: Policy;
    showNotification: boolean;
    user: UserProfile;
}

export const checkNewPhone = (notifierPhone: any, party: any) => {
    const homePhone =
        party?.phones?.filter(
            (phone: { phoneType: string }) => phone.phoneType === PhoneType.HOME
        )?.[0] || {};
    const existingPhone = [homePhone.extension, homePhone.dialNumber]
        .filter(Boolean)
        .join('');

    return {
        isNewPhone: notifierPhone !== existingPhone,
        existingPhone,
    };
};

export const DeathClaimNotificationStep = ({
    policy,
    showNotification,
    user,
}: DeathClaimNotificationStepProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: 'deathClaims.deathClaimNotification',
    });
    const { goToNext } = useWorkflow();
    const {
        formErrors,
        setNotifiers,
        owners,
        setOwners,
        notifiers,
        beneficiaries,
        setFormErrors,
        setSubmitFailed,
        setCaseId,
        onbaseCaseId,
        onbaseDocumentNumber,
    } = useDeathClaim();
    const [isNewBene, setIsNewBene] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState(false);

    const policyOwners = useMemo(() => {
        return getPolicyOwnersByRole(policy, [
            PartyRole.OWNER,
            PartyRole.JOINTOWNER,
        ]);
    }, [policy]);

    const policyAnnuitants = useMemo(() => {
        return getPolicyOwnersByRole(policy, [
            PartyRole.ANNUITANT,
            PartyRole.JOINTANNUITANT,
        ]);
    }, [policy]);

    const ownerPartyType = useMemo(() => {
        return getPolicyOwnersByRole(policy, [PartyRole.OWNER])?.[0]?.party
            .partyType;
    }, [policy]);

    const isIndividual = ownerPartyType === PartyType.INDIVIDUAL;
    const isNonIndividual = ownerPartyType !== PartyType.INDIVIDUAL;

    useEffect(() => {
        if (isIndividual && policyOwners && policyOwners?.length > 0) {
            browserLogInfo(
                'DeathClaimNotifierStep::Setting owner under deceased list',
                {
                    isIndividual: isIndividual,
                    policyOwners: policyOwners,
                }
            );
            setOwners(policyOwners);
        }
    }, [policyOwners, setOwners, isIndividual]);

    useEffect(() => {
        if (
            isNonIndividual &&
            policyAnnuitants &&
            policyAnnuitants?.length > 0
        ) {
            browserLogInfo(
                'DeathClaimNotifierStep::setting annuitants under deceased list',
                {
                    isNonIndividual: isNonIndividual,
                    policyAnnuitants: policyAnnuitants,
                }
            );
            setOwners(policyAnnuitants);
        }
    }, [policyAnnuitants, setOwners, isNonIndividual]);

    useEffect(() => {
        if (isNullEmptyOrUndefined(notifiers?.notifierRole)) {
            return;
        }
        let errors: FormValidationErrors = {};

        if (notifiers?.notifierRole === RoleType.Beneficiary && isNewBene) {
            errors = validateOtherNotifier(
                notifiers?.party,
                RoleType.Beneficiary,
                t
            );
        } else if (notifiers?.notifierRole === RoleType.Other) {
            errors = validateOtherNotifier(notifiers?.party, RoleType.Other, t);
        } else {
            errors['firstName'] = '';
            errors['lastName'] = '';
            errors['relationship'] = '';
        }

        setFormErrors((prevState) => ({
            ...prevState,
            ...errors,
        }));
    }, [notifiers, isNewBene, setFormErrors, t]);

    const submit = async () => {
        setIsLoading(true);
        const payload = buildClaimPaylod(
            policy,
            null,
            notifiers,
            owners,
            beneficiaries,
            onbaseCaseId,
            onbaseDocumentNumber,
            user
        );
        browserLogInfo('DeathClaimNotifierStep::Submit claim payload', {
            payload,
            policy: policy?.policyNumber,
        });
        const successfulSubmit = await submitDeathClaim(payload);
        browserLogInfo('DeathClaimNotifierStep::submitDeathClaim', {
            response: successfulSubmit,
            policy: policy?.policyNumber,
        });
        if (successfulSubmit && successfulSubmit?.zlCaseId) {
            setCaseId(successfulSubmit?.zlCaseId);
            setSubmitFailed(false);
        } else {
            setCaseId('');
            setSubmitFailed(true);
        }

        setIsLoading(false);
    };

    const handleStepContinue = async () => {
        const errors: FormValidationErrors = {};
        if (!isNullEmptyOrUndefined(notifiers?.notifierRole)) {
            if (
                isNullEmptyOrUndefined(notifiers?.party?.partyId) &&
                !isNewBene &&
                notifiers?.notifierRole !== RoleType.Other
            ) {
                errors['beneficiary'] = t(
                    'formErrors.formValidation.notifierIsRequired'
                );
            } else {
                errors['beneficiary'] = '';
            }
        }

        const isDeceasedArr = owners?.filter((owner) => owner.isDeceased) || [];
        if (isDeceasedArr.length > 0) {
            errors['deceased'] = '';
        } else {
            errors['deceased'] = t(
                'formErrors.formValidation.deceasedSelectionIsRequired'
            );
        }

        if (formErrors['submit']) {
            delete formErrors['submit'];
        }

        const asArray = Object.entries({ ...formErrors, ...errors });
        const filterCb = asArray.filter(
            ([key, value]) => value !== '' || key === 'submit'
        );
        const filteredErrors = Object.fromEntries(filterCb);

        setFormErrors(filteredErrors);
        if (Object.keys(filteredErrors).length > 0) {
            return;
        } else {
            if (showNotification == false) {
                await submit();
            }
            goToNext();
        }
    };

    const handleOwners = (owner: DeceasedParty, position: number) => {
        setOwners((prevState: DeceasedParty[]) => {
            const newState = prevState;
            if (position > -1) {
                newState[position] = owner;
            }
            return newState;
        });
    };

    const updateNotifier = (notifier: NotifierParty) => {
        let errors: FormValidationErrors = {};
        if (isNullEmptyOrUndefined(notifier?.notifierRole)) {
            errors = {
                role: t('formErrors.formValidation.roleIsRequired'),
            };
            setFormErrors((prevState) => ({
                ...prevState,
                ...errors,
            }));
        } else {
            setFormErrors((prevState) => {
                delete prevState?.role;
                return prevState;
            });
        }

        if (
            notifier?.notifierRole === RoleType.Other ||
            (notifier?.notifierRole === RoleType.Beneficiary &&
                isNullEmptyOrUndefined(notifier.party.partyId))
        ) {
            notifier.party.fullName = toTitleCase(
                [notifier.party.firstName, notifier.party.lastName]
                    .filter(Boolean)
                    .join(' ')
            );
        }
        setNotifiers((prevState) => ({
            ...prevState,
            ...notifier,
        }));
    };

    const handleNewBene = (value: boolean) => {
        setIsNewBene(value);
    };

    return (
        <WorkflowCard
            title={t('title')}
            subtitle={t('subTitle') as string}
            footerContent={
                <TransactionNavigationButtons
                    className="mt-4"
                    handleContinue={handleStepContinue}
                    planCode={policy?.product?.planCode}
                    policyNumber={policy?.policyNumber}
                    parentPage={ParentPage.None}
                />
            }
        >
            <div className="flex flex-col gap-2">
                {isLoading && (
                    <div className="fixed left-0 top-0 z-10 flex h-screen w-screen justify-center bg-gray-800 opacity-80">
                        <Loader />
                    </div>
                )}
                <DeathClaim
                    policy={policy}
                    formErrors={formErrors}
                    notifiers={notifiers}
                    updateNotifier={updateNotifier}
                    isNewBene={isNewBene}
                    handleNewBene={handleNewBene}
                    setFormErrors={setFormErrors}
                    isIndividual={isIndividual}
                    isNonIndividual={isNonIndividual}
                />
                {notifiers.notifierRole && owners.length > 0 && (
                    <DeceasedDetails
                        deceasedData={owners}
                        handleDeceased={handleOwners}
                        selectedNotifierPartyId={notifiers?.party?.partyId}
                        setFormErrors={setFormErrors}
                    />
                )}
                {formErrors['deceased'] && (
                    <AssistiveText
                        className="my-lg"
                        variant={AssistiveTextVariant.Error}
                        text={formErrors['deceased']}
                    />
                )}
            </div>
        </WorkflowCard>
    );
};
