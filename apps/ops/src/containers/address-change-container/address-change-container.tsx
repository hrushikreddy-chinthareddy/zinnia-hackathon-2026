import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { useMemo } from 'react';

import TabGroupContainer from '@deps/components/address-change/tab-group-container';
import { ParentPage } from '@deps/components/transaction-navigation-buttons/transaction-navigation-buttons';
import StartStep, { StartStepSetState } from '@deps/components/workflows/start-step/start-step';
import { TranslationFiles } from '@deps/config/translations';
import { Processes } from '@deps/models/case/case';
import { DocumentData } from '@deps/models/case/document';
import { Channel } from '@deps/models/case/renewal/case-renewal';
import { Policy } from '@deps/models/policy/sor-policy';

import { useAddressChange } from './address-change-provider';
import { ConfirmStep } from './components/confirm/confirm-step';
import { ContactDetailsStep } from './components/contact-details/contact-details-step';
import { RolesAndContractStep } from './components/roles-contract/roles-contract-step';
import { SignatureStep } from './components/signature/signature-step';
import { SummaryStep } from './components/summary/summary-step';
import { getChannel } from './utils/address-change-helper';
import { Step } from '../progress-bar-steps/progress-bar-steps-item/progress-bar-steps-item';

interface AddressChangeContainerProps {
    policy: Policy;
    document: DocumentData;
    planCode: string;
}

const AddressChangeContainer = ({ policy, document, planCode }: AddressChangeContainerProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, { keyPrefix: 'addressChange' });
    const router = useRouter();
    const {
        query: { doc, clientId },
    } = router;
    const { formData, setFormData } = useAddressChange();
    const channel = doc ? getChannel(doc as string) : null;

    const steps = useMemo(
        () => [
            {
                ariaLabel: t('tabs.start'),
                isVisible: () => !doc,
                component: (
                    <StartStep
                        parentPage={ParentPage.CreateCase}
                        policy={policy}
                        setState={setFormData as StartStepSetState}
                        state={formData}
                        title={t('start.title')}
                        subtitle={t('start.subtitle')}
                        processType={Processes.AddressChange}
                        isOnBaseUpdateAssistiveText={true}
                    />
                ),
                screenReaderLabel: t('tabs.start'),
                text: t('tabs.start'),
            },
            {
                ariaLabel: t('tabs.rolesAndContract'),
                isVisible: () => true,
                component: <RolesAndContractStep policy={policy} />,
                screenReaderLabel: t('tabs.rolesAndContract'),
                text: t('tabs.rolesAndContract'),
            },
            {
                ariaLabel: t('tabs.contactDetails'),
                isVisible: () => true,
                component: <ContactDetailsStep policy={policy} />,
                screenReaderLabel: t('tabs.contactDetails'),
                text: t('tabs.contactDetails'),
            },
            {
                ariaLabel: t('address-change.step-navigations.signature'),
                component: <SignatureStep policy={policy}></SignatureStep>,
                screenReaderLabel: t('address-change.step-navigations.signature'),
                isVisible: () => !!doc && channel !== Channel.Phone,
                text: t('tabs.signature'),
            },
            {
                ariaLabel: t('tabs.summary'),
                isVisible: () => true,
                component: <SummaryStep policy={policy} isSignatureSummaryRequired={!!doc}></SummaryStep>,
                screenReaderLabel: t('tabs.summary'),
                text: t('tabs.summary'),
            },
            {
                ariaLabel: t('address-change.step-navigations.confirm'),
                isVisible: () => true,
                component: <ConfirmStep policy={policy} document={document} planCode={planCode} clientId={clientId as string}/>,
                screenReaderLabel: t('address-change.step-navigations.confirm'),
                text: t('tabs.confirm'),
            },
        ],
        [t, policy, setFormData, formData, doc, document, planCode, clientId]
    );

    const filteredSteps: Step[] = useMemo(
        () => steps.filter((item: any) => item.isVisible?.()).map((item: any, index: number) => ({ ...item, index })),
        [steps]
    );

    return <TabGroupContainer steps={filteredSteps} policy={policy}></TabGroupContainer>;
};

export default AddressChangeContainer;
