import { PolicyCarrierLogo } from "@deps/components/global-values/policy-info/policy-info";
import { Policy } from '@deps/models/policy/sor-policy';
import { DocumentData } from '@deps/models/case/document';

import { useTranslation } from "next-i18next";
import { IconType, Icon } from "@zinnia/bloom/components";
import NavElement, { NavElementSize, NavElementType, NavElementVariant } from "@deps/components/nav-element/nav-element";
import dayjs from "dayjs";
import { DEFAULT_EXTENDED_DATE_FORMAT } from "@deps/types/constants";
import { TranslationFiles } from "@deps/config/translations";



type DetailTabProps = {
  carrierName: string,
  formattedApplicationDate: string,
  formattedCertifiedReceiveDate: string,
  policy: Policy,
  documentData: DocumentData

}



function DetailsTab({ carrierName, formattedApplicationDate, formattedCertifiedReceiveDate, policy, documentData }: DetailTabProps) {
  const { t } = useTranslation(TranslationFiles.COMMON, { keyPrefix: 'nigoEntry.CaseDetailsContent' });
  const url = `/policies/${policy.product?.planCode}/${policy.policyNumber}/policy/policy-details`
  const formattedIssueDate = dayjs(policy.policyDates?.issueDate).format(DEFAULT_EXTENDED_DATE_FORMAT);
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
          {t('qualificationType')}
        </div>
        <div className='col-span-1'>
          {policy.qualificationType}
        </div>
        <div className='col-span-1  text-[--color-base-text-text-secondary]'>
          {t('contractValue')}
        </div>
        <div className='col-span-1'>
          ${documentData.contractValue}
        </div>  <div className='col-span-1  text-[--color-base-text-text-secondary]'>
          {t('policyDate')}
        </div>
        <div className='col-span-1'>
          {formattedIssueDate}
        </div>

      </div>
      <div className="text-[--color-base-text-text-link] font-semibold text-md ">

        <NavElement
          className={'whitespace-normal break-words'}
          href={url}
          isNewPage={true}
          size={NavElementSize.Small}
          target="_blank"
          title={t('viewFullDeatils')?.toString()}
          type={NavElementType.Link}
          startIcon={<Icon type={IconType.EXTERNAL_LINK} width={20} height={20} />}

          variant={NavElementVariant.Secondary}
        >
          {t('viewFullDeatils')}
        </NavElement>


      </div>
    </>
  )
}

export default DetailsTab
