import { TabContent, TabGroup, TabList, TabTrigger } from '@zinnia/bloom/components';
import { TranslationFiles } from "@deps/config/translations";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Policy } from '@deps/models/policy/sor-policy';
import { getCarrierNameByClientId } from '@deps/utils/carriers';
import { DocumentData } from '@deps/models/case/document';
import { DEFAULT_EXTENDED_DATE_FORMAT } from '@deps/types/constants';
import dayjs from 'dayjs';
import DetailsTab from './detail-tab';
export enum TabOptions {
  Details = 'Details',
  Related = 'Related',
}
type CaseDetailsProps = {
  policy: Policy;
  documentData: DocumentData

};
function CaseDetailsContent({ policy, documentData, }: CaseDetailsProps) {
  const { t } = useTranslation(TranslationFiles.COMMON, { keyPrefix: 'nigoEntry.CaseDetailsContent' });
  const [activeTab, setActiveTab] = useState(TabOptions.Details);
  const handleTabChange = (value: string) => setActiveTab(value as TabOptions);
  const carrierName = getCarrierNameByClientId(policy.carrierId as string);
  useEffect(() => {
    console.log(policy)
  }, [])
  const formattedCertifiedReceiveDate = dayjs(policy.policyDates?.certifiedReceivedDate).format(DEFAULT_EXTENDED_DATE_FORMAT);
  const formattedApplicationDate = dayjs(policy.policyDates?.applicationDate).format(DEFAULT_EXTENDED_DATE_FORMAT);
  const renderTabContent = (
    <>
      <TabContent value={TabOptions.Details} className='flex flex-col px-6 pt-6 md:px-8 lg:px-10 gap-5'>
        <DetailsTab
          carrierName={carrierName}
          documentData={documentData}
          policy={policy}
          formattedCertifiedReceiveDate={formattedCertifiedReceiveDate}
          t={t}
          formattedApplicationDate={formattedApplicationDate}
        />
      </TabContent>
      <TabContent className="flex w-full flex-col items-center" value={TabOptions.Related}>

      </TabContent>
    </>
  );
  return (
    <div>
      <TabGroup defaultValue={activeTab} value={activeTab} activationMode="manual" onValueChange={handleTabChange}>
        <TabList className="!mb-0 w-full px-4 pt-4 md:px-6 lg:px-8">
          <TabTrigger value={TabOptions.Details}>{t('tabs.details') ?? ''}</TabTrigger>
          <TabTrigger value={TabOptions.Related}>{t('tabs.related') ?? ''}</TabTrigger>
        </TabList>
        {renderTabContent}

      </TabGroup>
    </div>
  )
}

export default CaseDetailsContent
