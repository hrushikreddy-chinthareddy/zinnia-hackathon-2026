import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import React, { useMemo } from 'react';

import { TranslationFiles } from '@deps/config/translations';
import TabGroupContainer from '@deps/containers/bene-change/components/tab-group-container';
import { DocumentData } from '@deps/models/case/document';
import { Policy } from '@deps/models/policy/sor-policy';

import { useBeneChange } from './bene-change-provider';
import BeneDetailsStep from './components/steps/bene-details/bene-details-step';
import ConfirmStep from './components/steps/confirm/confirm-step';
import DocSelectionStep from './components/steps/doc-selection/doc-selection-step';
import OwnersInfoStep from './components/steps/owner-info/owners-info-step';
import SignatureStep from './components/steps/signature/signature-step';
import SummaryStep from './components/steps/summary/summary-step';
import { Step } from '../progress-bar-steps/progress-bar-steps-item/progress-bar-steps-item';
import { ReRegPeopleView } from '../re-reg/componet/re-reg-people';

interface BeneChangeContainerProps {
    policy: Policy;
    document: DocumentData;
    planCode: string;
}

const BeneChangeContainer = ({ policy, document, planCode }: BeneChangeContainerProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, { keyPrefix: 'beneChange' });
    const { isPeopleView, setIsPeopleView } = useBeneChange();

    const router = useRouter();
    const {
        query: { doc, clientId },
    } = router;

    const onManageBeneficiaryClickHandler = () => {
        setIsPeopleView(!isPeopleView);
    };

    const steps = useMemo(
        () => [
            {
                ariaLabel: t('tabs.start'),
                isVisible: () => !doc,
                component: <DocSelectionStep policy={policy} />,
                screenReaderLabel: t('tabs.start'),
                text: t('tabs.start'),
            },
            {
                ariaLabel: t('tabs.ownerInformation'),
                isVisible: () => true,
                component: <OwnersInfoStep policy={policy} />,
                screenReaderLabel: t('tabs.ownerInformation'),
                text: t('tabs.ownerInformation'),
            },
            {
                ariaLabel: t('tabs.beneDetails'),
                isVisible: () => true,
                component: <BeneDetailsStep policy={policy} />,
                screenReaderLabel: t('tabs.beneDetails'),
                text: t('tabs.beneDetails'),
            },
            {
                ariaLabel: t('tabs.signature'),
                isVisible: () => true,
                component: <SignatureStep policy={policy} />,
                screenReaderLabel: t('tabs.signature'),
                text: t('tabs.signature'),
            },
            {
                ariaLabel: t('tabs.summary'),
                isVisible: () => true,
                component: <SummaryStep policy={policy}></SummaryStep>,
                screenReaderLabel: t('tabs.summary'),
                text: t('tabs.summary'),
            },
            {
                ariaLabel: t('tabs.confirm'),
                isVisible: () => true,
                component: <ConfirmStep policy={policy} document={document} planCode={planCode} clientId={clientId as string} />,
                screenReaderLabel: t('tabs.confirm'),
                text: t('tabs.confirm'),
            },
        ],
        [doc, policy, document, planCode, clientId, t]
    );

    const filteredSteps: Step[] = useMemo(
        () => steps.filter((item: any) => item.isVisible?.()).map((item: any, index: number) => ({ ...item, index })),
        [steps]
    );

    return isPeopleView ? (
        <ReRegPeopleView onManageBeneficiaryClick={onManageBeneficiaryClickHandler} policy={policy}></ReRegPeopleView>
    ) : (
        <TabGroupContainer hideGlobalValueBar={true} steps={filteredSteps} policy={policy} showDiaryNotes={true} showLink={false}></TabGroupContainer>
    );
};

export default BeneChangeContainer;
