import { toTitleCase } from '@xd/utils/dist';
import { Policy } from '@zinnia/api-types/types/sor';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import CardInfo from '@deps/components/card/card-info/card-info';
import NavElement, {
    NavElementType,
    NavElementVariant,
} from '@deps/components/nav-element/nav-element';
import PageLoader, {
    PageLoaderVariant,
} from '@deps/components/page-loader/page-loader';
import ApiErrorCard from '@deps/components/workflows/api-error-card/api-error-card';
import { TranslationFiles } from '@deps/config/translations';
import { PolicyRole, RoleLabel, Roles } from '@deps/constants/policy';
import { useRoleChange } from '@deps/contexts/RoleChangeContext';
import { Statuses } from '@deps/models/case/case';
import { TransactionResponseStatus } from '@deps/queries/api/bpm';
import { submitRoleChange } from '@deps/queries/api/role-change';
import { StatusCode } from '@deps/queries/api-utils/baseAPIClient';

import { buildRoleChangeRequestBody } from '../../role-change-helper';

interface ConfirmStepProps {
    policy: Policy;
    role: PolicyRole;
    roleLabel: RoleLabel;
    leaveTransactionLink: string;
}

const ConfirmStep = ({
    policy,
    role,
    roleLabel,
    leaveTransactionLink,
}: ConfirmStepProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: 'roleChange.confirm',
    });
    const router = useRouter();

    const [submitFailed, setSubmitFailed] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [submitNigo, setSubmitNigo] = useState(false);

    const { roleData, existingRoleData } = useRoleChange();
    const [newCaseId, setNewCaseId] = useState<string | null>(
        roleData.caseId ?? null
    );

    const { validationResponse } = roleData;

    const partyId = existingRoleData?.[0]?.party?.partyId || '';

    const validationSucceed = useMemo(
        () => validationResponse?.status === TransactionResponseStatus.Success,
        [validationResponse]
    );

    const submit = useCallback(async () => {
        const roleBody = buildRoleChangeRequestBody(roleData, role);

        const response = await submitRoleChange(
            policy.product?.planCode,
            policy.policyNumber,
            role,
            role.toUpperCase() === Roles.THIRDPARTYDESIGNEE ? '' : partyId,
            roleBody
        );

        if (response?.status !== StatusCode.Accepted) {
            setSubmitFailed(true);
        } else {
            if (response?.data?.caseStatus === Statuses.Exception) {
                setSubmitNigo(true);
            }
            setNewCaseId(response?.data?.caseId);
        }

        setIsLoading(false);
    }, [policy]);

    const hasAutoSubmittedRef = useRef(false);

    useEffect(() => {
        if (!hasAutoSubmittedRef.current) {
            hasAutoSubmittedRef.current = true;
            submit();
        }
    }, [submit]);

    if (isLoading) {
        return (
            <div className="responsive-padding flex h-[300px] w-full grow">
                <PageLoader variant={PageLoaderVariant.Center} />
            </div>
        );
    }

    if (submitFailed) {
        return (
            <ApiErrorCard
                leaveRoute={leaveTransactionLink}
                submit={{
                    action: submit,
                    text: t('updateRole', { roleLabel }),
                }}
            />
        );
    }

    const isSuccess = validationSucceed && !submitNigo;

    return (
        <div className="responsive-padding flex h-full w-full grow flex-col items-center justify-center">
            <CardInfo
                icon={null}
                cta={
                    newCaseId
                        ? {
                              action: () => {
                                  router.push(`/cases/${newCaseId}/progress`);
                              },
                              text: t('goToCase'),
                          }
                        : undefined
                }
                secondaryCta={
                    <NavElement
                        aria-label={t('close') as string}
                        onClick={() => router.push(leaveTransactionLink)}
                        type={NavElementType.Button}
                        variant={NavElementVariant.Default}
                        className="font-semibold text-secondary"
                    >
                        {t('close')}
                    </NavElement>
                }
                subtitle={
                    isSuccess ? (
                        <span>
                            {t('successMessage', { roleLabel })}
                            {'.'}
                        </span>
                    ) : (
                        <>
                            <span> {t('successMessage', { roleLabel })}</span>
                            <span> {t('for')} </span>
                            <span className="font-bold">{t('nigo')}</span>
                        </>
                    )
                }
                title={isSuccess ? t('title') : t('submit')}
            />
        </div>
    );
};

export default ConfirmStep;
