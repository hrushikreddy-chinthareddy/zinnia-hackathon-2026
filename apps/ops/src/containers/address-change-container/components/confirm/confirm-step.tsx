import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { useCallback, useEffect, useMemo, useState } from 'react';

import CardInfo from '@deps/components/card/card-info/card-info';
import PageLoader, { PageLoaderVariant } from '@deps/components/page-loader/page-loader';
import ApiErrorCard from '@deps/components/workflows/api-error-card/api-error-card';
import { TranslationFiles } from '@deps/config/translations';
import { useAddressChange } from '@deps/containers/address-change-container/address-change-provider';
import { buildAddressChangeRequestBody } from '@deps/containers/address-change-container/utils/build-payload-helper';
import { getFirstLastName } from '@deps/helpers/party-info-helper';
import { DocumentData, DocumentType } from '@deps/models/case/document';
import { PartyRole, Policy } from '@deps/models/policy/sor-policy';
import { fetchDocument } from '@deps/operations/documents/documentOperations';
import { addTransaction } from '@deps/queries/api/web-non-financial';
import { ReactComponent as CircleCheckIcon } from '@deps/styles/elements/icons/circles/circle-checkmark.svg';

interface ConfirmProps {
    policy: Policy;
    document: DocumentData;
    planCode: string;
    clientId: string;
}

export const ConfirmStep = ({ policy, document, planCode, clientId }: ConfirmProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, { keyPrefix: 'addressChange.confirm' });
    const router = useRouter();
    const { signatureData, roleIdentifier, applyToRoles, formErrors, formData, phone, address } = useAddressChange();
    const [submitFailed, setSubmitFailed] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [ownerName, setOwnerName] = useState('');
    const validationSucceeded = useMemo(() => Object.keys(formErrors).length === 0, [formErrors]);

    const submit = useCallback(async () => {
        let documentResult;

        if (!document && formData.businessKey && formData.caseId !== '' && clientId) {
            documentResult = await fetchDocument(formData.businessKey, DocumentType.AddressChange, clientId.toUpperCase());
        
            if (!documentResult.success) {
                console.error('ConfirmStep:: No documentNumber from getDocument', { documentNumber: formData.businessKey, documentType: DocumentType.AddressChange, clientId });
                setSubmitFailed(true);
            }
        }

        const requestBody = buildAddressChangeRequestBody({
            applyToRoles,
            signatureData,
            formData,
            document,
            planCode,
            policy,
            phone,
            roleIdentifier,
            selectedDocument: documentResult?.success ? documentResult.value : null
        });

        const response = await addTransaction(requestBody);
        if (response.status !== 'ACCEPTED') {
            setSubmitFailed(true);
        }
        const policyOwnerId = policy?.partyRoles?.find(pr => pr.partyRole === PartyRole.OWNER)?.partyId;
        const policyOwner = policy?.parties?.find(party => party.partyId === policyOwnerId);

        if (policyOwner) {
            const fullName = getFirstLastName(policyOwner)
            setOwnerName(fullName)
        }
        setIsLoading(false);
    }, [document, formData, clientId, applyToRoles, signatureData, planCode, policy, phone, address, roleIdentifier]);

    useEffect(() => {
        submit();
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
                leaveRoute={'/create-case'}
                submit={{
                    action: submit,
                    text: t('submitAddress'),
                }}
            />
        );
    }

    return (
        <div className="responsive-padding flex h-full w-full grow flex-col items-center justify-center">
            {validationSucceeded  && ownerName !== '' ? (
                <CardInfo
                    icon={<CircleCheckIcon className="text-semantic-success" height={50} width={50} />}
                    cta={{
                        action: () => {
                            router.push('/create-case');
                        },
                        text: t('close'),
                    }}

                    subtitle={<span>{t('successMessage', { customerName: ownerName })}</span>}
                    title={t('title')}
                />
            ) : null}
        </div>
    );
};