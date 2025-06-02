import { PartyRole, PhoneType, Policy } from '@zinnia/api-types/types/sor';
import { AssistiveText, AssistiveTextVariant, Loader } from '@zinnia/bloom/components';
import { useTranslation } from 'next-i18next';
import { useCallback, useEffect, useMemo, useState } from 'react';

import TransactionNavigationButtons, { ParentPage } from '@deps/components/transaction-navigation-buttons/transaction-navigation-buttons';
import WorkflowCard from '@deps/components/workflows/workflow-card/workflow-card';
import { TranslationFiles } from '@deps/config/translations';
import { buildClaimPaylod, validateOtherNotifier } from '@deps/containers/death-claim-container/death-claim.helpers';
import { getPolicyOwnersByRole } from '@deps/containers/death-claim-container/steps/death-claim-notifier/death-claim-notifier.helpers';
import { useDeathClaim } from '@deps/contexts/DeathClaimContext';
import { useWorkflow } from '@deps/contexts/WorkflowContainerContext';
import { isNullEmptyOrUndefined } from '@deps/helpers/string.helpers';
import { FormValidationErrors } from '@deps/models/case/withdrawal/case';
import { submitDeathClaim } from '@deps/queries/api/web-non-financial';
import { browserLogInfo } from '@deps/utils/browser-logging';

import { DeathClaim } from './death-claim';
import { DeceasedDetails } from './deceased-details';
import { DeceasedParty, NotifierParty, RoleType } from '../../death-claim.types';

interface DeathClaimNotificationStepProps {
    policy: Policy;
    showNotification: boolean;
}

export const checkNewPhone = (notifierPhone: any, party: any) => {
    const homePhone = party?.phones?.filter((phone: { phoneType: string }) => phone.phoneType === PhoneType.HOME)?.[0] || {};
    const existingPhone = [homePhone.extension, homePhone.dialNumber].filter(Boolean).join('');

    return {
        isNewPhone: notifierPhone !== existingPhone,
        existingPhone,
    };
};

export const DeathClaimNotificationStep = ({ policy, showNotification }: DeathClaimNotificationStepProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, { keyPrefix: 'deathClaims.deathClaimNotification' });
    const { goToNext } = useWorkflow();
    const { formErrors, setNotifiers, owners, setOwners, notifiers, beneficiaries, setFormErrors, setSubmitFailed, setCaseId } =
        useDeathClaim();
    const [isNewBene, setIsNewBene] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState(false);

    const policyOwners = useMemo(() => {
        return getPolicyOwnersByRole(policy, [PartyRole.OWNER, PartyRole.JOINTOWNER]);
    }, [policy]);

    useEffect(() => {
        if (policyOwners && policyOwners?.length > 0) {
            setOwners(policyOwners);
        }
    }, [policyOwners, setOwners]);

    useEffect(() => {
        if (isNullEmptyOrUndefined(notifiers?.notifierRole)) {
            return;
        }
        let errors: FormValidationErrors = {};

        if (notifiers?.notifierRole === RoleType.Beneficiary && isNewBene) {
            errors = validateOtherNotifier(notifiers?.party, RoleType.Beneficiary, t);
        } else if (notifiers?.notifierRole === RoleType.Other) {
            errors = validateOtherNotifier(notifiers?.party, RoleType.Other, t);
        } else {
            errors['firstName'] = '';
            errors['middleName'] = '';
            errors['lastName'] = '';
            errors['suffix'] = '';
            errors['relationship'] = '';
        }

        setFormErrors(prevState => ({
            ...prevState,
            ...errors,
        }));
    }, [notifiers, isNewBene, setFormErrors, t]);

    const submit = useCallback(async () => {
        setIsLoading(true);
        const payload = buildClaimPaylod(policy, null, notifiers, owners, beneficiaries);
        browserLogInfo('DeathClaomNotifierStep::Submit claim payload', {
            payload,
            policy: policy?.policyNumber,
        });
        const successfulSubmit = await submitDeathClaim(payload);
        browserLogInfo('DeathClaomNotifierStep::submitDeathClaim', {
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
    }, [policy, notifiers, owners, beneficiaries, setCaseId, setSubmitFailed]);

    const handleStepContinue = useCallback(async () => {
        const errors: FormValidationErrors = {};
        if (!isNullEmptyOrUndefined(notifiers?.notifierRole)) {
            //} && notifiers?.notifierRole as RoleType !== RoleType.Other) {
            if (isNullEmptyOrUndefined(notifiers?.party?.partyId) && !isNewBene && notifiers?.notifierRole !== RoleType.Other) {
                errors['beneficiary'] = t('formErrors.formValidation.notifierIsRequired');
            } else {
                errors['beneficiary'] = '';
            }
        }

        const isDeceasedArr = owners?.filter(owner => owner.isDeceased) || [];
        if (isDeceasedArr.length > 0) {
            errors['deceased'] = '';
        } else {
            errors['deceased'] = t('formErrors.formValidation.deceasedSelectionIsRequired');
        }

        if (formErrors['submit']) {
            delete formErrors['submit'];
        }

        const asArray = Object.entries({ ...formErrors, ...errors });
        const filterCb = asArray.filter(([key, value]) => value !== '' || key === 'submit');
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
    }, [
        notifiers?.notifierRole,
        notifiers?.party?.partyId,
        owners,
        formErrors,
        setFormErrors,
        isNewBene,
        t,
        showNotification,
        goToNext,
        submit,
    ]);

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
            setFormErrors(prevState => ({
                ...prevState,
                ...errors,
            }));
        } else {
            setFormErrors(prevState => {
                delete prevState?.role;
                return prevState;
            });
        }
        setNotifiers(prevState => ({
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
                />
                {notifiers.notifierRole && owners.length > 0 && (
                    <DeceasedDetails
                        deceasedData={owners}
                        handleDeceased={handleOwners}
                        selectedNotifierPartyRole={notifiers?.party?.partyRole}
                    />
                )}
                {formErrors['deceased'] && (
                    <AssistiveText className="my-lg" variant={AssistiveTextVariant.Error} text={formErrors['deceased']} />
                )}
            </div>
        </WorkflowCard>
    );
};
