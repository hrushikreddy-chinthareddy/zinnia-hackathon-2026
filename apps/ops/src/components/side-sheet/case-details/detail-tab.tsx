import { PolicyCarrierLogo } from "@deps/components/global-values/policy-info/policy-info";
import { Policy } from '@deps/models/policy/sor-policy';
import { DocumentData } from '@deps/models/case/document';

import { TFunction } from "next-i18next";
import { IconType, Icon } from "@zinnia/bloom/components";



type DetailTabProps = {
  carrierName: string,
  formattedApplicationDate: string,
  formattedCertifiedReceiveDate: string,
  policy: Policy,
  documentData: DocumentData
  t: TFunction
}



function DetailsTab({ carrierName, formattedApplicationDate, formattedCertifiedReceiveDate, policy, documentData, t }: DetailTabProps) {
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
      <div className="text-[--color-base-text-text-link] font-semibold text-md ">
        <span>View full details</span>
        <Icon type={IconType.EXTERNAL_LINK} width={20} height={20} />
      </div>
    </>
  )
}

export default DetailsTab
