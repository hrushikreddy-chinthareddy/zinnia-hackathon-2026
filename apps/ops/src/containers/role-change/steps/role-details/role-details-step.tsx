import { Transition } from '@headlessui/react';
import { PartyRole, Policy } from '@zinnia/api-types/types/sor';
import { AssistiveText, AssistiveTextVariant } from '@zinnia/bloom/components';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import NavElement, {
    NavElementSize,
    NavElementType,
} from '@deps/components/nav-element/nav-element';
import TransactionNavigationButtons, {
    ParentPage,
} from '@deps/components/transaction-navigation-buttons/transaction-navigation-buttons';
import WorkflowCard from '@deps/components/workflows/workflow-card/workflow-card';
import { TranslationFiles } from '@deps/config/translations';
import {
    ActionType,
    PolicyRole,
    RoleLabel,
    Roles,
} from '@deps/constants/policy';
import { useRoleChange } from '@deps/contexts/RoleChangeContext';
import { useWorkflow } from '@deps/contexts/WorkflowContainerContext';
import { ReactComponent as AddIcon } from '@deps/styles/elements/icons/content/add-small.svg';

import RoleDetailsComponent from './role-details-component';
import { validate } from '../../role-change-helper';

interface RoleDetailsStepProps {
    policy: Policy;
    role: PolicyRole;
    roleLabel: RoleLabel;
    leaveTransactionLink?: string;
}

const RoleDetailsStep = ({
    policy,
    role,
    roleLabel,
    leaveTransactionLink,
}: RoleDetailsStepProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: 'roleChange.roleDetails',
    });

    const { goToNext } = useWorkflow();
    const newrole = 'NEW' + role;

    const {
        roleData,
        existingRoleData,
        addRole,
        setAddRole,
        removeRole,
        setRemoveRole,
        currentErrors,
        setCurrentErrors,
    } = useRoleChange();

    const handleStepContinue = useCallback(() => {
        const errors = validate(
            roleData,
            addRole,
            removeRole,
            t,
            roleLabel,
            role.toUpperCase() as PartyRole
        );
        if (setCurrentErrors) setCurrentErrors(errors);
        if (Object.keys(errors).length > 0) {
            return;
        } else {
            goToNext();
        }
    }, [roleData, addRole, removeRole, setCurrentErrors, goToNext, t]);

    return (
        <WorkflowCard
            title={t('header', { roleLabel }) as string}
            footerContent={
                <TransactionNavigationButtons
                    className="mt-10"
                    disableContinue={false}
                    handleContinue={handleStepContinue}
                    parentPage={ParentPage.CreateCase}
                    leaveTransactionLink={leaveTransactionLink}
                />
            }
        >
            {Array.isArray(existingRoleData) &&
                existingRoleData.length > 0 &&
                existingRoleData.map((party: any, idx: number) => (
                    <RoleDetailsComponent
                        key={idx}
                        role={role}
                        roleData={party}
                        action={ActionType.Remove}
                        roleLabel={roleLabel}
                        index={idx}
                        policy={policy as any}
                    />
                ))}

            <div
                className={
                    addRole
                        ? 'my-3 flex w-full justify-center gap-4 border-2 p-8 align-middle'
                        : 'invisible'
                }
            >
                <Transition
                    as="div"
                    show={addRole}
                    className="mt-2"
                    enter="transition ease-in-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <NavElement
                        onClick={() => {
                            if (
                                role.toUpperCase() !== Roles.THIRDPARTYDESIGNEE
                            ) {
                                setAddRole(!addRole),
                                    !removeRole
                                        ? setRemoveRole(!removeRole)
                                        : null;
                            } else {
                                setAddRole(!addRole);
                                setRemoveRole(false);
                            }
                        }}
                        size={NavElementSize.Small}
                        startIcon={<AddIcon height={20} width={20} />}
                        type={NavElementType.Button}
                        disabled={false}
                    >
                        {`Add ${roleLabel.toLowerCase()}`}
                    </NavElement>
                </Transition>
            </div>

            {!addRole && (
                <RoleDetailsComponent
                    role={newrole as PolicyRole}
                    roleLabel={roleLabel}
                    roleData={roleData}
                    action={ActionType.Add}
                    index={existingRoleData?.length || 0}
                    policy={policy as any}
                />
            )}
            {Object.keys(currentErrors).map((errorKey) =>
                currentErrors[errorKey] ? (
                    <AssistiveText
                        key={errorKey}
                        text={currentErrors[errorKey]}
                        variant={AssistiveTextVariant.Error}
                        className="mt-2"
                    />
                ) : null
            )}
        </WorkflowCard>
    );
};

export default RoleDetailsStep;
