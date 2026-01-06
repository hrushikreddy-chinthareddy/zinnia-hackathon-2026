import { skipToken, useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { useMemo, useEffect, useCallback, useState } from 'react';

import PageLoader, {
    PageLoaderVariant,
} from '@deps/components/page-loader/page-loader';
import { ParentPage } from '@deps/components/transaction-navigation-buttons/transaction-navigation-buttons';
import { TranslationFiles } from '@deps/config/translations';
import TabGroupContainer from '@deps/containers/bene-change/components/tab-group-container';
import { useOptimizely } from '@deps/contexts/OptimizelyContext';
import { useTransactionPermissionCheck } from '@deps/hooks/useTransactionPermissionCheck';
import { DocumentData, DocumentType } from '@deps/models/case/document';
import { SOR_MAP, SorSystem } from '@deps/models/policy/enums';
import { fetchDocument } from '@deps/operations/documents/documentOperations';
import { TransactionResponseStatus } from '@deps/queries/api/bpm';
import { validateBeneChangeTransaction } from '@deps/queries/api/web-non-financial';
import { checkBeneficiaryEligibilityQuery } from '@deps/queries/tanstack/checkEligibilityQueries/checkEligibilityQueries';
import { TransactionPermission } from '@deps/utils/auth';
import { browserLogError } from '@deps/utils/browser-logging';
import { FEATURE_FLAGS } from '@deps/utils/optimizely/flags';
import { Policy } from '@zinnia/api-types/types/sor';

import { useBeneChange } from './bene-change-provider';
import PeopleSubPage from '../people-sub-page';
import { Step } from '../progress-bar-steps/progress-bar-steps-item/progress-bar-steps-item';
import { ReRegPeopleView } from '../re-reg/componet/re-reg-people';
import BeneDetailsStep from './components/steps/bene-details/bene-details-step';
import ConfirmStep from './components/steps/confirm/confirm-step';
import { buildReRegRequestBody } from './components/steps/confirm/confirm-step.helpers';
import DocSelectionStep from './components/steps/doc-selection/doc-selection-step';
import OwnersInfoStep from './components/steps/owner-info/owners-info-step';
import SignatureStep from './components/steps/signature/signature-step';
import SummaryStep from './components/steps/summary/summary-step';

interface BeneChangeContainerProps {
    policy: Policy;
    document?: DocumentData;
    planCode: string;
    isReReg?: boolean;
    clientId?: string;
}

const BeneChangeContainer = ({
    policy,
    document,
    planCode,
    isReReg = true,
}: BeneChangeContainerProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: 'beneChange',
    });
    const {
        isPeopleView,
        setIsPeopleView,
        SOR,
        setSOR,
        setEligibility,
        eligibility,
        formData,
        signatureData,
        beneData,
        ownerInfo,
        peopleSelection,
    } = useBeneChange();
    const [isLoading, setIsLoading] = useState(true);

    const { policyNumber } = policy;
    const leaveTransactionLink = isReReg
        ? '/create-case'
        : `/policies/${planCode}/${policyNumber}/${ParentPage.People}`;
    const parentPage = isReReg ? ParentPage.CreateCase : ParentPage.People;

    const router = useRouter();
    const {
        query: { doc, clientId },
    } = router;

    const onManageBeneficiaryClickHandler = () => {
        setIsPeopleView(!isPeopleView);
    };

    const isPeople = useMemo(() => {
        return !router.asPath.includes('/benechange');
    }, [router.asPath]);

    const renderCondition = !isReReg ? isPeople : isPeopleView;

    const { data, isFetched } = useQuery({
        queryKey: ['beneficiaryEligibility', planCode, policyNumber],
        queryFn:
            planCode && policyNumber
                ? () => checkBeneficiaryEligibilityQuery(planCode, policyNumber)
                : skipToken,
        enabled: !!planCode && !!policyNumber,
    });
    const { featureFlags } = useOptimizely();
    const invokeNewBeneChangeApi =
        featureFlags[FEATURE_FLAGS.BENE_CHANGE_NEW_API];

    const { isPermissioned: isUserPermissionedToWithdraw } =
        useTransactionPermissionCheck(
            TransactionPermission.WritePolicy,
            policyNumber,
            planCode
        );

    useEffect(() => {
        if (!isFetched || !data) return;

        const sor = (data?.sor ?? '').toLowerCase();
        const isZahara = sor === SorSystem.Zahara.toLowerCase();
        const isEligible = isZahara
            ? data?.status === TransactionResponseStatus.Success
            : !!sor;

        setEligibility(isEligible);
        setSOR(SOR_MAP[sor.toLowerCase()] || SorSystem.LifeCad);

        if (
            router.asPath.includes('/people/benechange') &&
            (!isEligible || !isUserPermissionedToWithdraw)
        ) {
            router.replace('/403');
        } else {
            setIsLoading(false);
        }
    }, [
        isFetched,
        data,
        setEligibility,
        setSOR,
        policyNumber,
        isUserPermissionedToWithdraw,
        router.asPath,
    ]);

    const validateCall = useCallback(async () => {
        let documentResult;

        if (
            !document &&
            formData.businessKey &&
            formData.caseId !== '' &&
            clientId
        ) {
            documentResult = await fetchDocument(
                formData.businessKey,
                DocumentType.Rereg,
                ''
            );

            if (!documentResult.success) {
                browserLogError(
                    'SummaryStep::No documentNumber from getDocument',
                    {
                        payload: { planCode, policyNumber },
                        function: 'webnonfinancial.validateCall',
                    }
                );
            }
        }

        const parties = peopleSelection?.cardActionData?.filteredData || [];

        const requestBody = buildReRegRequestBody({
            formData,
            beneData,
            ownerInfo,
            signatureData,
            document,
            policy,
            selectedDocument: documentResult?.success
                ? documentResult.value
                : null,
            parties,
            sorSystem: SOR || SorSystem.LifeCad,
        });

        const response = await validateBeneChangeTransaction(
            requestBody,
            invokeNewBeneChangeApi
        );

        return response;
    }, [
        document,
        formData,
        clientId,
        peopleSelection,
        beneData,
        ownerInfo,
        signatureData,
        policy,
        SOR,
    ]);

    const steps = useMemo(
        () => [
            {
                ariaLabel: t('tabs.start'),
                isVisible: () => !doc,
                component: (
                    <DocSelectionStep
                        policy={policy}
                        parentPage={parentPage}
                        leaveTransactionLink={leaveTransactionLink}
                    />
                ),
                screenReaderLabel: t('tabs.start'),
                text: t('tabs.start'),
            },
            {
                ariaLabel: t('tabs.ownerInformation'),
                isVisible: () => true,
                component: (
                    <OwnersInfoStep
                        policy={policy}
                        parentPage={parentPage}
                        leaveTransactionLink={leaveTransactionLink}
                    />
                ),
                screenReaderLabel: t('tabs.ownerInformation'),
                text: t('tabs.ownerInformation'),
            },
            {
                ariaLabel: t('tabs.beneDetails'),
                isVisible: () => true,
                component: (
                    <BeneDetailsStep
                        policy={policy}
                        parentPage={parentPage}
                        leaveTransactionLink={leaveTransactionLink}
                    />
                ),
                screenReaderLabel: t('tabs.beneDetails'),
                text: t('tabs.beneDetails'),
            },
            {
                ariaLabel: t('tabs.signature'),
                isVisible: () => true,
                component: (
                    <SignatureStep
                        policy={policy}
                        parentPage={parentPage}
                        leaveTransactionLink={leaveTransactionLink}
                        validateTransaction={validateCall}
                    />
                ),
                screenReaderLabel: t('tabs.signature'),
                text: t('tabs.signature'),
            },
            {
                ariaLabel: t('tabs.summary'),
                isVisible: () => true,
                component: (
                    <SummaryStep
                        policy={policy}
                        parentPage={parentPage}
                        leaveTransactionLink={leaveTransactionLink}
                    ></SummaryStep>
                ),
                screenReaderLabel: t('tabs.summary'),
                text: t('tabs.summary'),
            },
            {
                ariaLabel: t('tabs.confirm'),
                isVisible: () => true,
                component: (
                    <ConfirmStep
                        policy={policy}
                        document={document}
                        planCode={planCode}
                        clientId={clientId as string}
                        parentPage={parentPage}
                        leaveTransactionLink={leaveTransactionLink}
                    />
                ),
                screenReaderLabel: t('tabs.confirm'),
                text: t('tabs.confirm'),
            },
        ],
        [doc, policy, document, planCode, clientId, t, validateCall]
    );

    const filteredSteps: Step[] = useMemo(
        () =>
            steps
                .filter((item: any) => item.isVisible?.())
                .map((item: any, index: number) => ({ ...item, index })),
        [steps]
    );

    if (isLoading) {
        return <PageLoader variant={PageLoaderVariant.Center} />;
    }

    return renderCondition ? (
        !isReReg ? (
            <PeopleSubPage isEligibleBeneficiary={eligibility} />
        ) : (
            <ReRegPeopleView
                onManageBeneficiaryClick={onManageBeneficiaryClickHandler}
                policy={policy}
                isEligibleBeneficiary={true}
            ></ReRegPeopleView>
        )
    ) : (
        <TabGroupContainer
            hideGlobalValueBar={true}
            steps={filteredSteps}
            policy={policy}
            showDiaryNotes={SOR && SOR != SorSystem.Zahara ? true : false}
            showLink={false}
        ></TabGroupContainer>
    );
};

export default BeneChangeContainer;
