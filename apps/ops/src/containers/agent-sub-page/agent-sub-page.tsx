import { useTranslation } from 'next-i18next';
import { useContext, useMemo } from 'react';

import FieldData from '@deps/components/fields/field-data/field-data';
import Typography, { TypographyVariant } from '@deps/components/typography/typography';
import PersonPageHeader from '@deps/containers/page-header/interior-people-page-header';
import AddressCard from '@deps/containers/people-data-cards/address-card/address-card';
import EmailCard from '@deps/containers/people-data-cards/email-card/email-card';
import IdentificationCard from '@deps/containers/people-data-cards/identification-card/identification-card';
import PhoneCard from '@deps/containers/people-data-cards/phone-card/phone-card';
import { PolicyData } from '@deps/contexts/PolicyDataContext';
import useBreadcrumb from '@deps/hooks/useBreadcrumbs';

import CardContainer from '../card-container/card-container';
import FirmInformationCard from '../people-data-cards/firm-information-card/firm-information-card';

export type AgentSubPage = {
    partyId: string;
};

export const AgentSubPage = ({ partyId }: AgentSubPage) => {
    const { policy, policyDetails } = useContext(PolicyData);

    const { t } = useTranslation();
    const { breadcrumb } = useBreadcrumb();

    const { parties, partyRoles, policyNumber, product } = policy ?? {};
    const { planCode } = product ?? {};

    const selectedPolicyParty = useMemo(() => {
        return parties?.find(pr => pr.partyId === partyId);
    }, [parties, partyId]);

    const selectedPolicyPartyRoles = useMemo(() => {
        return partyRoles?.filter(pr => pr.partyId === selectedPolicyParty?.partyId) || [];
    }, [partyRoles, selectedPolicyParty?.partyId]);

    // to do - this is the new implementation of the Parties Class - update in all locations, rather than just the Identification Card
    const newSelectedPolicyParty = policyDetails.getPartyById(partyId);

    return (
        <div className="shadow-elevation-light-04">
            <PersonPageHeader
                breadcrumbText={breadcrumb?.text}
                breadcrumbUrl={breadcrumb?.url}
                selectedPolicyParty={selectedPolicyParty}
                selectedPolicyPartyRoles={selectedPolicyPartyRoles}
                editable={false}
                partyStatus={selectedPolicyParty?.partyStatus}
            />

            <hr className=" h-0.5 border-none bg-gray-100" />
            <FirmInformationCard
                party={selectedPolicyParty}
                partyRoles={selectedPolicyPartyRoles}
                planCode={planCode}
                policyNumber={policyNumber}
            />

            <hr className=" h-0.5 border-none bg-gray-100" />
            <CardContainer classNames="flex w-full flex-col items-start">
                <Typography className="mr-5" variant={TypographyVariant.H2}>
                    {t('people.card.allocation.label')}
                </Typography>
                <div className="flex gap-8 mt-4 flex-wrap">
                    <FieldData label={t('people.card.allocation.commissionAllocation')}>{}</FieldData>
                </div>
                {/* <EmptyCard text={t('empty') as string} /> */}
            </CardContainer>

            <hr className=" h-0.5 border-none bg-gray-100" />
            <IdentificationCard
                selectedPolicyParty={newSelectedPolicyParty}
                isAnnuity={policyDetails.isAnnuity}
                partyRoles={selectedPolicyPartyRoles}
            />

            <hr className="h-0.5 border-none bg-gray-100" />
            <PhoneCard
                editable={false}
                party={selectedPolicyParty}
                partyRoles={selectedPolicyPartyRoles}
                planCode={planCode}
                policyNumber={policyNumber}
            />

            <hr className="h-0.5 border-none bg-gray-100" />
            <EmailCard
                editable={false}
                party={selectedPolicyParty}
                partyRoles={selectedPolicyPartyRoles}
                planCode={planCode}
                policyNumber={policyNumber}
            />

            <hr className="h-0.5 border-none bg-gray-100" />
            <AddressCard
                editable={false}
                party={selectedPolicyParty}
                partyRoles={selectedPolicyPartyRoles}
                planCode={planCode}
                policyNumber={policyNumber}
            />
        </div>
    );
};

export default AgentSubPage;
