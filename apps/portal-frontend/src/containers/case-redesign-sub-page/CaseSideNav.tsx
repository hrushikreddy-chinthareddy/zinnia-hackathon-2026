import Image from 'next/image';
import { useTranslation } from 'next-i18next';

import NavElement, { NavElementSize, NavElementType, NavElementVariant } from '@deps/components/nav-element/nav-element';
import { PiiWrapper } from '@deps/components/pii/PiiWrapper';
import Typography, { TypographyVariant } from '@deps/components/typography/typography';
import { TranslationFiles } from '@deps/config/translations';
import { useCaseActivityContext } from '@deps/contexts/CaseActivityContext';
import { Case, Statuses } from '@deps/models/case/case';
import { ReactComponent as InProgressIcon } from '@deps/styles/elements/icons/alert/in-progress.svg';
import { ReactComponent as TimeIcon } from '@deps/styles/elements/icons/icons_outlined/clock.svg';
import { getCarrierLogoByClientId, getCarrierNameByClientId } from '@deps/utils/carriers';

import { getSideNavData } from './case-helpers';
import { Parties, PartiesProps } from './CaseSideNavParties';

export interface CaseSideNavProps {
    data: {
        carrier: string;
        status: string;
        productName: string;
        processType: string;
        policyNumber: string;
        parties?: PartiesProps;
        createdDate: string;
        updatedDate: string;
    };
}

// #region Process Timestamp
const ProcessingTimeStamp = ({ data }: CaseSideNavProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON);

    const updatedDate = data.updatedDate;
    const createdDate = data.createdDate.toLowerCase();

    let statusText = '';

    switch (data.status) {
        case Statuses.Canceled:
            statusText = `${t('caseOverview.processDate.canceled')} ${updatedDate}`;
            break;
        case Statuses.Completed:
            statusText = `${t('caseOverview.processDate.completed')} ${updatedDate}`;
            break;
        default:
            statusText = `${t('caseOverview.processDate.started')} ${createdDate}`;
            break;
    }

    return (
        <div className="flex w-full flex-row items-center gap-2 rounded bg-white p-4 shadow-elevation-light-04 md:px-8">
            <TimeIcon height={20} width={20} role="presentation" />
            <Typography variant={TypographyVariant.Body}>{statusText}</Typography>
        </div>
    );
};
// #endregion

// #region Contract Details
const ContractDetails = ({ data }: CaseSideNavProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON);
    const { policy } = useCaseActivityContext();
    const imageSrc = getCarrierLogoByClientId(data?.carrier);
    const policyNumber = data?.policyNumber;
    const status = data?.status;

    const missingDataClasses = 'flex flex-row items-center text-gray-600';

    let contractContent;

    if (!policyNumber && status !== Statuses.Completed && status !== Statuses.Canceled) {
        contractContent = () => (
            <div className="mt-2 flex flex-row gap-2">
                <InProgressIcon height={18} width={18} role="presentation" aria-hidden="true" className="shrink-0 fill-gray-600" />
                <div>
                    <Typography variant={TypographyVariant.BodySmBold} className={missingDataClasses}>
                        {t(`caseOverview.sidenav.getPolicyNumber`)}
                    </Typography>
                    <Typography variant={TypographyVariant.BodySm} className="text-gray-600">
                        {t(`caseOverview.sidenav.getDetailsSubtext`)}
                    </Typography>
                </div>
            </div>
        );
    } else if (!policyNumber && (status === Statuses.Completed || status === Statuses.Canceled)) {
        contractContent = () => (
            <div className="mt-2">
                <Typography variant={TypographyVariant.BodySmBold} className={missingDataClasses}>
                    {t(`caseOverview.sidenav.unavailablePolicyNumber`)}
                </Typography>
                <Typography variant={TypographyVariant.BodySm} className="">
                    {t(`caseOverview.sidenav.unavailableDetailsSubtext`, { status: status })}
                </Typography>
            </div>
        );
    } else {
        contractContent = () => <Typography variant={TypographyVariant.LabelMdAlt}>{policyNumber}</Typography>;
    }

    return (
        <div className="w-full gap-2 border-b-2 border-gray-100 p-4 md:px-8">
            <div className="flex flex-row gap-2">
                <div className="h-12 w-12 shrink-0 rounded border-2 border-gray-200">
                    <Image src={imageSrc} alt={`${data?.carrier} icon`} width={48} height={48} role="presentation" aria-hidden="true" />
                </div>
                <div className="flex flex-col">
                    <Typography variant={TypographyVariant.Caption}>{getCarrierNameByClientId(data?.carrier)}</Typography>
                    <Typography variant={TypographyVariant.Body}>{data?.productName}</Typography>
                    {policy?.product?.planCode ? (
                        <NavElement
                            href={`/policies/${policy.product.planCode}/${policy.policyNumber}/policy/policy-details`}
                            size={NavElementSize.Small}
                            type={NavElementType.Link}
                            variant={NavElementVariant.Default}
                        >
                            <Typography variant={TypographyVariant.Body}>
                                <PiiWrapper>{policyNumber}</PiiWrapper>
                            </Typography>
                        </NavElement>
                    ) : (
                        <Typography variant={TypographyVariant.Body}>
                            <PiiWrapper>{policyNumber}</PiiWrapper>
                        </Typography>
                    )}
                </div>
            </div>
            {!policyNumber && contractContent()}
        </div>
    );
};
// #endregion

// #region Case Side Nav
const CaseSideNav = ({ caseDetails }: { caseDetails: Case }) => {
    const { t } = useTranslation();
    const caseActivityContext = useCaseActivityContext();
    const data = getSideNavData(caseDetails, caseActivityContext, t);
    return (
        <div className="flex-column flex w-full gap-2 lg:w-[354px]">
            <div className="flex w-full flex-col gap-2 rounded">
                <ProcessingTimeStamp data={data} />
                <div className="flex w-full flex-col rounded bg-white shadow-elevation-light-04">
                    <ContractDetails data={data} />
                    <Parties parties={data.parties} caseStatus={caseDetails.caseStatus} />
                </div>
            </div>
        </div>
    );
};
// #endregion

export default CaseSideNav;
