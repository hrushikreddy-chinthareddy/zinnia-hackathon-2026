import Image from 'next/image';
import { useTranslation } from 'next-i18next';
import { useEffect, useState } from 'react';

import NavElement, { NavElementSize, NavElementType, NavElementVariant } from '@deps/components/nav-element/nav-element';
import { PiiWrapper } from '@deps/components/pii/PiiWrapper';
import Typography, { TypographyVariant } from '@deps/components/typography/typography';
import { TranslationFiles } from '@deps/config/translations';
import { useCaseActivityContext } from '@deps/contexts/CaseActivityContext';
import { Case, Statuses } from '@deps/models/case/case';
import { LineOfBusiness } from '@deps/models/policy/sor-policy';
import { ReactComponent as InProgressIcon } from '@deps/styles/elements/icons/alert/in-progress.svg';
import { ReactComponent as TimeIcon } from '@deps/styles/elements/icons/icons_outlined/clock.svg';
import { DEFAULT_ERROR_STRING } from '@deps/types/constants';
import { getCarrierLogoByClientId, getCarrierNameByClientId } from '@deps/utils/carriers';

import { getSideNavData } from './case-helpers';
import { Parties, PartiesProps } from './CaseSideNavParties';
import Transactions from './CaseSideNavTransactions';

export interface CaseSideNavProps {
    data: {
        carrier: string;
        createdDate: string;
        parties?: PartiesProps;
        policyNumber: string;
        processType: string;
        productName: string;
        status: string;
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
    const { loadingPolicy, policy } = useCaseActivityContext();
    const [isAnnuity, setIsAnnuity] =  useState(policy?.product?.lineOfBusiness === LineOfBusiness.LIFE);
    const imageSrc = getCarrierLogoByClientId(data?.carrier);

    const missingDataClasses = 'flex flex-row items-center text-gray-600';

    useEffect(() => {
        setIsAnnuity(policy?.product?.lineOfBusiness === LineOfBusiness.ANNUITY)
    }, [loadingPolicy, policy]);

    return (
        <div className="w-full gap-2 border-b-2 border-gray-100 p-4 md:px-8">
            <div className="flex flex-row gap-2">
                <div className="h-12 w-12 shrink-0 rounded border-2 border-gray-200">
                    <Image src={imageSrc} alt={`${data?.carrier} icon`} width={48} height={48} role="presentation" aria-hidden="true" />
                </div>
                <div className="flex flex-col">
                    <Typography variant={TypographyVariant.Caption}>{getCarrierNameByClientId(data?.carrier)}</Typography>
                    <Typography variant={TypographyVariant.Body}>{data?.productName || policy?.product?.marketingName}</Typography>
                    {!loadingPolicy && policy && (
                        <div className="flex flex-row">
                            <Typography className="mr-1" variant={TypographyVariant.Body}>
                                {isAnnuity
                                    ? t(`caseOverview.sidenav.contractNumber`)
                                    : t(`caseOverview.sidenav.policyNumber`)
                                }
                            </Typography>
                            {policy.product?.planCode ? (
                                <NavElement
                                    href={`/policies/${policy.product.planCode}/${policy.policyNumber}/policy/policy-details`}
                                    size={NavElementSize.Small}
                                    type={NavElementType.Link}
                                    variant={NavElementVariant.Default}
                                >
                                    <Typography variant={TypographyVariant.Body}>
                                        <PiiWrapper>{policy.policyNumber}</PiiWrapper>
                                    </Typography>
                                </NavElement>
                            ) : (
                                <Typography variant={TypographyVariant.Body}>
                                    <PiiWrapper>{policy.policyNumber || DEFAULT_ERROR_STRING}</PiiWrapper>
                                </Typography>
                            )}
                        </div>
                    )}
                    {/* There are cases where there is a policy number on the case but policy details do not exist */}
                    {!loadingPolicy && !policy && (
                        <div className="flex flex-row">
                            <Typography className="mr-1" variant={TypographyVariant.Body}>{t(`caseOverview.sidenav.policyNumber`)}</Typography>
                            <Typography variant={TypographyVariant.Body}>
                                <PiiWrapper>{data.policyNumber || DEFAULT_ERROR_STRING}</PiiWrapper>
                            </Typography>
                        </div>
                    )}
                </div>
            </div>
            {loadingPolicy && (
                <div className="flex flex-row gap-2 mt-2 ">
                    <InProgressIcon
                        aria-hidden="true"
                        className="animate-spin ease-linear duration-5000 fill-gray-600 shrink-0 transform-origin-center"
                        height={18}
                        role="presentation"
                        width={18}
                    />
                    <div>
                        <Typography variant={TypographyVariant.BodySmBold} className={missingDataClasses}>
                            {t(`caseOverview.sidenav.getPolicyNumber`)}
                        </Typography>
                        <Typography variant={TypographyVariant.BodySm} className="text-gray-600">
                            {t(`caseOverview.sidenav.getDetailsSubtext`)}
                        </Typography>
                    </div>
                </div>
            )}
            {!loadingPolicy && (!policy?.policyNumber && !data.policyNumber) && (data.status === Statuses.Completed || data.status === Statuses.Canceled) && (
                <div className="mt-2">
                    <Typography variant={TypographyVariant.BodySmBold} className={missingDataClasses}>
                        {t(`caseOverview.sidenav.unavailablePolicyNumber`)}
                    </Typography>
                    <Typography variant={TypographyVariant.BodySm}>
                        {t(`caseOverview.sidenav.unavailableDetailsSubtext`, { status: data.status })}
                    </Typography>
                </div>
            )}
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
                    <Transactions caseDetails={caseDetails} />
                    <Parties parties={data.parties} caseStatus={caseDetails.caseStatus} />
                </div>
            </div>
        </div>
    );
};
// #endregion

export default CaseSideNav;
