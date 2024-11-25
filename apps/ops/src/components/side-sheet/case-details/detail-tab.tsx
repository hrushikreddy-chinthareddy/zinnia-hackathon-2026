import { PolicyCarrierLogo } from "@deps/components/global-values/policy-info/policy-info";
import { Policy } from '@deps/models/policy/sor-policy';
import { DocumentData } from '@deps/models/case/document';
import { useState } from "react";
import { TFunction } from "next-i18next";
import { TabContent, TabGroup, TabTrigger, TabList } from "@zinnia/bloom/components";


type DetailTabProps = {
  carrierName: string,
  formattedApplicationDate: string,
  formattedCertifiedReceiveDate: string,
  policy: Policy,
  documentData: DocumentData
  t: TFunction
}

export enum TabOptions {
  People = 'People',
  CedingCarriers = 'Ceding Carriers',
}

const renderTabContent = (
  <>
    <TabContent value={TabOptions.People} className='flex flex-col px-6 pt-6 md:px-8 lg:px-10 gap-5'>

    </TabContent>
    <TabContent className="flex w-full flex-col items-center" value={TabOptions.CedingCarriers}>

    </TabContent>
  </>
);

function DetailTab({ carrierName, formattedApplicationDate, formattedCertifiedReceiveDate, policy, documentData, t }: DetailTabProps) {
  const [activeTab, setActiveTab] = useState(TabOptions.People);
  const handleTabChange = (value: string) => setActiveTab(value as TabOptions);
  return (
    <>
      <div className='flex float-start'>
        <PolicyCarrierLogo carrierId={policy.carrierId} />
        <div>
          <div className='text-md text-[--color-base-text-text-secondary]'>{carrierName}</div>
          <div className='text-md'>{documentData?.productName}</div>
          <div className='text-md'>Contract#: {policy?.policyNumber}</div>
        </div>
      </div>
      <div className=' grid grid-cols-2 gap-2 text-md'>
        <div className='col-span-1  text-[--color-base-text-text-secondary]'>
          {t('applicationSignedDate')}
        </div>
        {/* not sure if this is the date */}
        <div className='col-span-1'>
          {formattedApplicationDate}
        </div>
        <div className='col-span-1  text-[--color-base-text-text-secondary]'>
          {t('issueState')}
        </div>
        <div className='col-span-1'>
          {policy.issueState}
        </div>
        <div className='col-span-1  text-[--color-base-text-text-secondary]'>
          {t('recievedDate')}
        </div>
        <div className='col-span-1'>
          {formattedCertifiedReceiveDate}
        </div>
        <div className='col-span-1  text-[--color-base-text-text-secondary]'>
          {t('QualificationType')}
        </div>
        <div className='col-span-1'>
          {policy.qualificationType}
        </div>
      </div>

      <div>
        <TabGroup defaultValue={activeTab} value={activeTab} activationMode="manual" onValueChange={handleTabChange}>
          <TabList className="!mb-0 w-full px-4 pt-4 md:px-6 lg:px-8">
            <TabTrigger value={TabOptions.People}>{t('detailsTab.people') ?? ''}</TabTrigger>
            <TabTrigger value={TabOptions.CedingCarriers}>{t('detailsTab.cedingCarriers') ?? ''}</TabTrigger>
          </TabList>
          {renderTabContent}

        </TabGroup>
      </div>

    </>
  )
}

export default DetailTab
