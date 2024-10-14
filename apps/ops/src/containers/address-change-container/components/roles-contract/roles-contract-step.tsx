import { AssistiveTextVariant } from '@zinnia/bloom/components';
import { useCallback, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import AssistiveText from '@deps/components/assistive-text/assistive-text';
import TransactionNavigationButtons, { ParentPage } from '@deps/components/transaction-navigation-buttons/transaction-navigation-buttons';
import WorkflowCard from '@deps/components/workflows/workflow-card/workflow-card';
import { TranslationFiles } from '@deps/config/translations';
import { useWorkflow } from '@deps/contexts/WorkflowContainerContext';
import { FormValidationErrors } from '@deps/models/case/withdrawal/case';
import { PartyRole, Policy } from '@deps/models/policy/sor-policy';

import { RoleAddressCard } from './components/role-address-cards';
import { AllowedRoleTypes } from './utils/roles-contract-constants';
import { groupPartiesByAddress } from './utils/roles-contract-helper';
import { PartyAddressCard, RoleContractValidationKeys } from './utils/roles-contract-types';
import { useAddressChange } from '../../address-change-provider';

interface IRolesAndContractProps {
    policy: Policy;
}

export const RolesAndContractStep = ({ policy }: IRolesAndContractProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, { keyPrefix: 'addressChange' });
    const { goToNext } = useWorkflow();
    const { applyToRoles, setApplyToRoles, formErrors, setRoleIdentifier, setFormErrors, selectedIds, setSelectedIds } = useAddressChange();

    const extractedParties = useMemo(() => policy?.parties || [], [policy]);
    const extractedPartyRoles = useMemo(
        () => policy?.partyRoles?.filter(role => AllowedRoleTypes.includes(role?.partyRole ?? '')) || [],
        [policy]
    );
    const qualificationType = useMemo(() => policy?.qualificationType ?? '', [policy]);

    const partyCardsData: PartyAddressCard[] = useMemo(
        () => groupPartiesByAddress(extractedPartyRoles, extractedParties, qualificationType, t),
        [extractedPartyRoles, extractedParties, qualificationType, t]
    );

    const handleClick = (id: number): void => {
        if (selectedIds.includes(id)) {
            setSelectedIds((prevState: number[]) => prevState.filter((item: number) => item !== id));
        } else {
            setSelectedIds((prevState: number[]) => [...prevState, id]);
        }
    };

    const handleStepContinue = useCallback(() => {
        const errors = {} as FormValidationErrors;
        if (applyToRoles.length === 0) {
            errors['noSelection'] = t('rolesAndContracts.formErrors.formValidation.noAddressCardSelection');
            setFormErrors(errors);
        } else {
            setFormErrors({});
            goToNext();
        }
    }, [applyToRoles, goToNext, setFormErrors, t]);

    /*useEffect(() => {
        if (roleIdentifier) {
            const partyId = roleIdentifier.partyId;
            if (partyId ) {
                const applicableRoles: any[] = [];
                partyCardsData?.map(partyCard => {
                    partyCard.roleIdentifiers.map(role => {
                        if (role.partyId != partyId) {
                            return;
                        }
                        applicableRoles.push({
                            policyNumber: policy?.policyNumber,
                            partyId: role.partyId,
                            partyRole: role.partyRole,
                            partyRoleId: role.partyRoleId
                        })
                    });
                });
                setApplyToRoles([...applicableRoles]);
            }
        }
    }, [roleIdentifier, partyCardsData, setApplyToRoles, setFormErrors, policy?.policyNumber]);*/

    useEffect(() => {

        if (selectedIds.length > 0) {
            const applicableRoles: any[] = [];
            selectedIds.map(selectedId => {
                partyCardsData[selectedId].roleIdentifiers.map(role => {
                    applicableRoles.push({
                        policyNumber: policy?.policyNumber,
                        partyId: role.partyId,
                        partyRole: role.partyRole,
                        partyRoleId: role.partyRoleId
                    })
                })
            });
            setApplyToRoles([...applicableRoles]);

            const selectedRoleIdentifier = applicableRoles.filter(applyToRole => applyToRole.partyRole === PartyRole.OWNER);
            if (selectedRoleIdentifier.length > 0) {
                setRoleIdentifier({
                    partyRoleId: selectedRoleIdentifier[0]?.partyRoleId,
                    partyRole: selectedRoleIdentifier[0]?.partyRole,
                    partyId: selectedRoleIdentifier[0]?.partyId,
                });
            } else {
                setRoleIdentifier({
                    partyRoleId: applicableRoles[0]?.partyRoleId,
                    partyRole: applicableRoles[0]?.partyRole,
                    partyId: applicableRoles[0]?.partyId,
                });
            }
        } else {
            setApplyToRoles([]);
            setRoleIdentifier({});
        }
    }, [partyCardsData, policy?.policyNumber, selectedIds, setApplyToRoles, setRoleIdentifier]);

    return (
        <WorkflowCard
            title={t('rolesAndContracts.label')}
            footerContent={
                <TransactionNavigationButtons
                    className="mt-4"
                    handleContinue={handleStepContinue}
                    parentPage={ParentPage.CreateCase}
                    leaveTransactionLink='/create-case'
                />
            }
        >
            <div className="flex flex-col gap-5">
                <RoleAddressCard partyCardsLits={partyCardsData} title={t('rolesAndContracts.title')} handleClick={handleClick} selectedIds={selectedIds} ></RoleAddressCard>
                {/*<RolesRadioSelectors extractedPartyRoles={extractedPartyRoles}></RolesRadioSelectors>*}
                {/*<AssociatedAddressTable extractedPartyRoles={extractedPartyRoles} policy={policy}></AssociatedAddressTable>*/}
                {formErrors[RoleContractValidationKeys.RolesContractPresent] ? (
                    <AssistiveText
                        text={formErrors[RoleContractValidationKeys.RolesContractPresent]}
                        variant={AssistiveTextVariant.Error}
                        className="mt-2"
                    />
                ) : null}

                {formErrors.noSelection ? (
                    <AssistiveText text={formErrors.noSelection} variant={AssistiveTextVariant.Error} className="mt-2" />
                ) : null}
            </div>
        </WorkflowCard>
    );
};
