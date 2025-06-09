import { Policy } from '@zinnia/api-types/types/sor';
import { IconType, Icon } from '@zinnia/bloom/components';
import dayjs from 'dayjs';
import { useTranslation } from 'next-i18next';

import { PolicyCarrierLogo } from '@deps/components/global-values/policy-info/policy-info';
import NavElement, { NavElementSize, NavElementType } from '@deps/components/nav-element/nav-element';
import { TranslationFiles } from '@deps/config/translations';
import { DocumentData } from '@deps/models/case/document';
import { DEFAULT_EXTENDED_DATE_FORMAT } from '@deps/types/constants';

import { formatCurrencyLocal } from '../../../../../../packages/utils/src/strings';

export const DEFAULT_ERROR_STRING = '--';

type DetailTabProps = {
    carrierName: string;
    policy?: Policy;
    documentData: DocumentData;
    policyNumber: string;
    clientCode: string;
};

function DetailsTab({ carrierName, policy, documentData, policyNumber, clientCode }: DetailTabProps) {
    const { t } = useTranslation(TranslationFiles.COMMON, { keyPrefix: 'sideSheet.caseDetailsContent' });
    const url = policy ? `/policies/${policy?.product?.planCode}/${policy?.policyNumber}/policy/policy-details` : null;
    const formattedIssueDate = policy?.policyDates?.issueDate
        ? dayjs(policy?.policyDates?.issueDate).format(DEFAULT_EXTENDED_DATE_FORMAT)
        : DEFAULT_ERROR_STRING;
    const formattedApplicationDate = policy?.policyDates?.applicationDate
        ? dayjs(policy?.policyDates?.applicationDate).format(DEFAULT_EXTENDED_DATE_FORMAT)
        : DEFAULT_ERROR_STRING;
    const formattedContractValue = formatCurrencyLocal(documentData.contractValue as string);

    return (
        <>
            <div className="flex float-start">
                <PolicyCarrierLogo carrierId={clientCode} />
                <div>
                    <div className="text-md text-[--color-base-text-text-secondary]">{carrierName}</div>
                    <div className="text-md">{documentData?.productName || DEFAULT_ERROR_STRING}</div>
                    <div className="text-md">Contract #: {policyNumber || DEFAULT_ERROR_STRING}</div>
                </div>
            </div>
            <div className=" grid grid-cols-2 gap-2 text-md">
                <div className="col-span-1  text-[--color-base-text-text-secondary]">{t('applicationSignedDate')}</div>
                <div className="col-span-1">{formattedApplicationDate}</div>
                <div className="col-span-1  text-[--color-base-text-text-secondary]">{t('issueState')}</div>
                <div className="col-span-1">{policy?.issueState || DEFAULT_ERROR_STRING}</div>
                <div className="col-span-1  text-[--color-base-text-text-secondary]">{t('qualificationType')}</div>
                <div className="col-span-1">{policy?.qualificationType || DEFAULT_ERROR_STRING}</div>
                <div className="col-span-1  text-[--color-base-text-text-secondary]">{t('contractValue')}</div>
                <div className="col-span-1">{formattedContractValue}</div>{' '}
                <div className="col-span-1  text-[--color-base-text-text-secondary]">{t('policyDate')}</div>
                <div className="col-span-1">{formattedIssueDate}</div>
            </div>
            {url && (
                <div className="text-[--color-base-text-text-link] font-semibold text-md ">
                    <NavElement
                        className={'whitespace-normal break-words'}
                        href={url}
                        isNewPage={true}
                        size={NavElementSize.Small}
                        target="_blank"
                        title={t('viewFullDeatils') as string}
                        type={NavElementType.Link}
                        startIcon={<Icon type={IconType.EXTERNAL_LINK} width={20} height={20} />}
                    >
                        {t('viewFullDeatils')}
                    </NavElement>
                </div>
            )}
        </>
    );
}

export default DetailsTab;
