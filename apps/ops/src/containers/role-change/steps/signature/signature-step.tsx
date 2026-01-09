import { AssistiveText, AssistiveTextVariant } from '@zinnia/bloom/components';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import TransactionCta from '@deps/components/transaction-cta/transaction-cta';
import { ParentPage } from '@deps/components/transaction-navigation-buttons/transaction-navigation-buttons';
import WorkflowCard from '@deps/components/workflows/workflow-card/workflow-card';
import { TranslationFiles } from '@deps/config/translations';
import { PolicyRole, Roles, Action } from '@deps/constants/policy';
import { useRoleChange } from '@deps/contexts/RoleChangeContext';
import { useWorkflow } from '@deps/contexts/WorkflowContainerContext';
import { isNullEmptyOrUndefined } from '@deps/helpers/string.helpers';
import { validateRoleChange } from '@deps/queries/api/role-change';
import { validateThirdPartyDesigneeChange } from '@deps/queries/api/web-non-financial';
import { Policy } from '@zinnia/api-types/types/sor';

import SignatureSection from './signature-section';
import {
    buildRoleChangeRequestBody,
    createMainCta,
    createSecondaryCta,
} from '../../role-change-helper';

interface SignatureStepProps {
    policy: Policy;
    role: PolicyRole;
    leaveTransactionLink?: string;
}

const SignatureStep = ({ policy, role }: SignatureStepProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: 'roleChange.signature',
    });

    const { t: t2 } = useTranslation(TranslationFiles.COMMON);

    const { goToNext } = useWorkflow();
    const [loading, setLoading] = useState<boolean>(false);

    const {
        roleData,
        setRoleData,
        existingRoleData,
        currentErrors,
        setCurrentErrors,
        removedTpdIndex,
    } = useRoleChange();

    const partyAdded =
        !isNullEmptyOrUndefined(roleData?.party?.firstName) ||
        !isNullEmptyOrUndefined(roleData?.party?.lastName);
    const partyDeleted = removedTpdIndex !== null;

    let requestType = '';

    const validateTransaction = () => {
        if (partyAdded && partyDeleted) {
            requestType = Action.UPDATE;
        } else if (partyAdded && !partyDeleted) {
            requestType = Action.ADD;
        } else if (!partyAdded && partyDeleted) {
            requestType = Action.DELETE;
        }

        return role.toUpperCase() === Roles.THIRDPARTYDESIGNEE
            ? validateThirdPartyDesigneeChange(
                  policy.product?.planCode,
                  policy.policyNumber,
                  removedTpdIndex !== null
                      ? existingRoleData?.[removedTpdIndex]?.party?.partyId
                      : '',
                  requestType,
                  buildRoleChangeRequestBody(roleData, role)
              )
            : validateRoleChange(
                  policy.product?.planCode,
                  policy.policyNumber,
                  role.toUpperCase() === Roles.PAYOR
                      ? ''
                      : existingRoleData?.[0]?.party?.partyId ?? '',
                  role,
                  buildRoleChangeRequestBody(roleData, role)
              );
    };

    const signTypeToTitleMap: Record<string, string> = {
        OWNER: 'Owner signature',
        NEWOWNER: 'New Owner signature',
        JOINT_OWNER: 'Joint owner signature',
        NEWJOINT_OWNER: 'New Joint owner signature',
        IRREVOCABLE: 'Irrevocable beneficiary signature',
    };

    const validateSignatures = () => {
        const currentErrors: Record<string, string> = {};

        if (roleData?.signatures && roleData.signatures.length > 0) {
            const hasInvalidSignature = roleData?.signatures?.some(
                (signature: any) =>
                    !signature.isSignedPresent ||
                    signature.isSignedPresent.trim().length === 0
            );

            if (hasInvalidSignature) {
                currentErrors['signatures'] = t(
                    'validationReasons.signatuePresent'
                );
            }
        }

        return currentErrors;
    };

    const handleContinue = async () => {
        const errors = validateSignatures();
        if (setCurrentErrors) {
            setCurrentErrors(errors);
        }

        if (Object.keys(errors).length > 0) {
            return;
        }

        if (!validateTransaction) {
            goToNext();
            return;
        }

        setLoading(true);

        const response = await validateTransaction();

        setRoleData((prev: any) => ({
            ...prev,
            validationResponse: response,
        }));

        setLoading(false);

        goToNext();
    };

    return (
        <WorkflowCard
            title={t('header')}
            footerContent={
                <TransactionCta
                    mainCta={createMainCta(t2, handleContinue)}
                    secondaryCta={createSecondaryCta(
                        t2,
                        policy,
                        ParentPage.People
                    )}
                    stopLoading={!loading}
                    newSpinner={true}
                />
            }
        >
            <div>
                {roleData?.signatures?.map((signature: any, index: number) => (
                    <div key={`signature-${index}`}>
                        <SignatureSection
                            index={index}
                            title={signTypeToTitleMap[signature.signType]}
                            signature={signature}
                            role={role}
                        />
                    </div>
                ))}
            </div>

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

export default SignatureStep;
