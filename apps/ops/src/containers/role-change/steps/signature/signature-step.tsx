import { toTitleCase } from '@xd/utils/dist';
import { Policy } from '@zinnia/api-types/types/sor';
import { AssistiveText, AssistiveTextVariant } from '@zinnia/bloom/components';
import { useTranslation } from 'react-i18next';

import TransactionNavigationButtons, {
    ParentPage,
} from '@deps/components/transaction-navigation-buttons/transaction-navigation-buttons';
import WorkflowCard from '@deps/components/workflows/workflow-card/workflow-card';
import { TranslationFiles } from '@deps/config/translations';
import { PolicyRole, Roles } from '@deps/constants/policy';
import { useRoleChange } from '@deps/contexts/RoleChangeContext';
import { useWorkflow } from '@deps/contexts/WorkflowContainerContext';
import { validateRoleChange } from '@deps/queries/api/role-change';

import SignatureSection from './signature-section';
import { buildRoleChangeRequestBody } from '../../role-change-helper';

interface SignatureStepProps {
    policy: Policy;
    role: PolicyRole;
    leaveTransactionLink?: string;
}

const SignatureStep = ({
    policy,
    role,
    leaveTransactionLink,
}: SignatureStepProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: 'roleChange.signature',
    });

    const { goToNext } = useWorkflow();

    const {
        roleData,
        setRoleData,
        existingRoleData,
        currentErrors,
        setCurrentErrors,
    } = useRoleChange();

    const validateTransaction = () => {
        return validateRoleChange(
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

        const response = await validateTransaction();

        setRoleData((prev: any) => ({
            ...prev,
            validationResponse: response,
        }));

        goToNext();
    };

    return (
        <WorkflowCard
            title={t('header')}
            footerContent={
                <TransactionNavigationButtons
                    className="mt-10"
                    disableContinue={false}
                    handleContinue={handleContinue}
                    parentPage={ParentPage.CreateCase}
                    leaveTransactionLink={leaveTransactionLink}
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
