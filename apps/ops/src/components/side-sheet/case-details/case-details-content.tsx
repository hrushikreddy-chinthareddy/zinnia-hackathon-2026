import { TabContent, TabGroup, TabList, TabTrigger } from '@zinnia/bloom/components';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ErrorMessagePart } from '@deps/components/error/Error';
import { TranslationFiles } from '@deps/config/translations';
import { CaseTableData } from '@deps/contexts/CaseManagementFilters';
import { DocumentData } from '@deps/models/case/document';
import { AddressTypes } from '@deps/models/case/withdrawal/case';
import { PartyRole, Policy } from '@deps/models/policy/sor-policy';
import { getCarrierNameByClientId } from '@deps/utils/carriers';

import AddressTab from './address-tab';
import DetailsTab from './details-tab';
import RelatedTab from './related-tab';

export enum TabOptions {
  Details = 'Details',
  Related = 'Related',
  Address = 'Address',
}
type CaseDetailsProps = {
  policy: Policy;
  documentData: DocumentData;
  offset: number;
  limit: number;
  setOffset: React.Dispatch<React.SetStateAction<number>>;
  caseTableData: CaseTableData;
  setError: React.Dispatch<React.SetStateAction<ErrorMessagePart[] | null>>;
};
export type addressType = { addressType: AddressTypes; preferredAddress: boolean; city: string; state: string; zipCode: string }[];
function CaseDetailsContent({ policy, documentData, offset, limit, setOffset, caseTableData, setError }: CaseDetailsProps) {
  const { t } = useTranslation(TranslationFiles.COMMON, { keyPrefix: 'sideSheet.caseDetailsContent' });
  const [activeTab, setActiveTab] = useState(TabOptions.Details);
  const handleTabChange = (value: string) => setActiveTab(value as TabOptions);
  const carrierName = getCarrierNameByClientId(policy.carrierId as string);

  const policyOwnerId = policy?.partyRoles?.find(pr => pr.partyRole === PartyRole.OWNER)?.partyId;
  const policyOwner = policy?.parties?.find(party => party.partyId === policyOwnerId);

  const renderTabContent = (
    <>
      <TabContent value={TabOptions.Details} className="flex flex-col px-6 pt-6 md:px-8 lg:px-10 gap-5">
        <DetailsTab carrierName={carrierName} documentData={documentData} policy={policy} />
      </TabContent>
      <TabContent className="flex w-full flex-col items-center" value={TabOptions.Related}>
        <RelatedTab offset={offset} limit={limit} setOffset={setOffset} caseTableData={caseTableData} setError={setError} />
      </TabContent>
      <TabContent className="flex w-full flex-col items-center" value={TabOptions.Address}>
        <AddressTab
          addresses={policyOwner?.addresses as addressType[]}
          planCode={policy.product?.planCode}
          policyNumber={policy?.policyNumber}
        />
      </TabContent>
    </>
  );
  return (
    <div>
      <TabGroup defaultValue={activeTab} value={activeTab} activationMode="manual" onValueChange={handleTabChange}>
        <TabList className="!mb-0 w-full px-4 pt-4 md:px-6 lg:px-8">
          <TabTrigger value={TabOptions.Details}>{t('tabs.details') ?? ''}</TabTrigger>
          <TabTrigger value={TabOptions.Related}>
            {t('tabs.related') ?? ''} ({caseTableData.total})
          </TabTrigger>
          <TabTrigger value={TabOptions.Address}>
            {t('tabs.addressHistory') ?? ''} ({policyOwner?.addresses?.length})
          </TabTrigger>
        </TabList>
        {renderTabContent}
      </TabGroup>
    </div>
  );
}

export default CaseDetailsContent;
