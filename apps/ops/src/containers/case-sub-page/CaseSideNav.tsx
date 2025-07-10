import { LineOfBusiness } from '@zinnia/api-types/types/sor';
import Image from 'next/image';
import { useTranslation } from 'next-i18next';
import { useEffect, useState } from 'react';

import NavElement, {
    NavElementSize,
    NavElementType,
    NavElementVariant,
} from '@deps/components/nav-element/nav-element';
import { PiiWrapper } from '@deps/components/pii/PiiWrapper';
import Title, { TitleVariant } from '@deps/components/title/title';
import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import { TranslationFiles } from '@deps/config/translations';
import { useCaseActivityContext } from '@deps/contexts/CaseActivityContext';
import useCaseInsightsPermission from '@deps/hooks/useCaseInsights';
import { Case, Processes, Statuses } from '@deps/models/case/case';
import { getCaseInsights } from '@deps/queries/api/openai';
import { ReactComponent as InProgressIcon } from '@deps/styles/elements/icons/alert/in-progress.svg';
import { ReactComponent as TimeIcon } from '@deps/styles/elements/icons/icons_outlined/clock.svg';
import { ReactComponent as LighBulb } from '@deps/styles/elements/icons/icons_outlined/light-bulb.svg';
import { DEFAULT_ERROR_STRING } from '@deps/types/constants';
import {
    getCarrierLogoByClientId,
    getCarrierNameByClientId,
} from '@deps/utils/carriers';

import CaseDetailsSideNav from './case-details-side-nav';
import { getSideNavData } from './case-helpers';
import { PartiesProps } from './CaseSideNavParties';
import CaseSideNavTabs from './CaseSideNavTabs';
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
            statusText = `${t(
                'caseOverview.processDate.canceled'
            )} ${updatedDate}`;
            break;
        case Statuses.Completed:
            statusText = `${t(
                'caseOverview.processDate.completed'
            )} ${updatedDate}`;
            break;
        default:
            statusText = `${t(
                'caseOverview.processDate.started'
            )} ${createdDate}`;
            break;
    }

    return (
        <div className="flex w-full flex-row items-center gap-2 rounded bg-white p-4 border-1 border-gray-200">
            <TimeIcon height={20} width={20} role="presentation" />
            <Typography variant={TypographyVariant.Body}>
                {statusText}
            </Typography>
        </div>
    );
};
// #endregion

// #region Contract Details
const ContractDetails = ({ data }: CaseSideNavProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON);
    const { loadingPolicy, policy } = useCaseActivityContext();
    const [isAnnuity, setIsAnnuity] = useState(
        policy?.product?.lineOfBusiness === LineOfBusiness.LIFE
    );
    const imageSrc = getCarrierLogoByClientId(data?.carrier);

    const missingDataClasses = 'flex flex-row items-center text-gray-600';

    useEffect(() => {
        setIsAnnuity(
            policy?.product?.lineOfBusiness === LineOfBusiness.ANNUITY
        );
    }, [loadingPolicy, policy]);

    return (
        <div className="w-full gap-2 border-gray-100 p-4">
            <div className="flex flex-row gap-2">
                <div className="h-12 w-12 shrink-0 rounded border-2 border-gray-200">
                    <Image
                        src={imageSrc}
                        alt={`${data?.carrier} icon`}
                        width={48}
                        height={48}
                        role="presentation"
                        aria-hidden="true"
                    />
                </div>
                <div className="flex flex-col">
                    <Typography variant={TypographyVariant.Caption}>
                        {getCarrierNameByClientId(data?.carrier)}
                    </Typography>
                    <Typography variant={TypographyVariant.Body}>
                        {data?.productName || policy?.product?.marketingName}
                    </Typography>
                    {!loadingPolicy && policy && (
                        <div className="flex flex-row">
                            <Typography
                                className="mr-1"
                                variant={TypographyVariant.Body}
                            >
                                {isAnnuity
                                    ? t(`caseOverview.sidenav.contractNumber`)
                                    : t(`caseOverview.sidenav.policyNumber`)}
                            </Typography>
                            {policy.product?.planCode ? (
                                <NavElement
                                    href={`/policies/${policy.product.planCode}/${policy.policyNumber}/policy/policy-details`}
                                    size={NavElementSize.Small}
                                    type={NavElementType.Link}
                                    variant={NavElementVariant.Default}
                                >
                                    <Typography
                                        variant={TypographyVariant.Body}
                                    >
                                        <PiiWrapper>
                                            {policy.policyNumber}
                                        </PiiWrapper>
                                    </Typography>
                                </NavElement>
                            ) : (
                                <Typography variant={TypographyVariant.Body}>
                                    <PiiWrapper>
                                        {policy.policyNumber ||
                                            DEFAULT_ERROR_STRING}
                                    </PiiWrapper>
                                </Typography>
                            )}
                        </div>
                    )}
                    {/* There are cases where there is a policy number on the case but policy details do not exist */}
                    {!loadingPolicy && !policy && (
                        <div className="flex flex-row">
                            <Typography
                                className="mr-1"
                                variant={TypographyVariant.Body}
                            >
                                {t(`caseOverview.sidenav.policyNumber`)}
                            </Typography>
                            <Typography variant={TypographyVariant.Body}>
                                <PiiWrapper>
                                    {data.policyNumber || DEFAULT_ERROR_STRING}
                                </PiiWrapper>
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
                        <Typography
                            variant={TypographyVariant.BodySmBold}
                            className={missingDataClasses}
                        >
                            {t(`caseOverview.sidenav.getPolicyNumber`)}
                        </Typography>
                        <Typography
                            variant={TypographyVariant.BodySm}
                            className="text-gray-600"
                        >
                            {t(`caseOverview.sidenav.getDetailsSubtext`)}
                        </Typography>
                    </div>
                </div>
            )}
            {!loadingPolicy &&
                !policy?.policyNumber &&
                !data.policyNumber &&
                (data.status === Statuses.Completed ||
                    data.status === Statuses.Canceled) && (
                    <div className="mt-2">
                        <Typography
                            variant={TypographyVariant.BodySmBold}
                            className={missingDataClasses}
                        >
                            {t(`caseOverview.sidenav.unavailablePolicyNumber`)}
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
    const [aiSummary, setAiSummary] = useState<string | null>(null);
    const data = getSideNavData(caseDetails, caseActivityContext, t);
    const shouldShowCaseInsights = useCaseInsightsPermission();

    const getOpenAiSummary = async (caseDetails: Case) => {
        if (!caseDetails) {
            return '';
        }
        try {
            const summary = await getCaseInsights({
                content: JSON.stringify(caseDetails),
                prompt: `You are an expert in all things case data. Your job is to summarize the data for business and executive users.
                          They want simple and insightful information about the data provided to you. The cases provided to you here are open cases delineated by insurance carrier. Avoid using phrases such as "the data".
                          Your responses should be insightful and will be displayed on a UI as a summary for a module related to a pie chart. Use percentages and real data where it makes sense. Keep it conscise and to the point. Format number values to U.S.`,
            });
            return summary;
        } catch (error) {
            return '';
        }
    };

    useEffect(() => {
        if (!shouldShowCaseInsights) {
            return;
        }
        if (caseDetails && !aiSummary) {
            getOpenAiSummary(caseDetails).then((summary) => {
                if (summary) {
                    setAiSummary(summary);
                }
            });
        }
    }, [caseDetails, aiSummary, shouldShowCaseInsights]);

    const loadingClasses =
        'transform-origin-center duration-5000 animate-spin ease-linear';

    return (
        <div className="flex-column flex w-full gap-2 lg:w-[456px]">
            <div className="flex w-full flex-col gap-2 rounded">
                <ProcessingTimeStamp data={data} />
                <div className="flex w-full flex-col rounded bg-white border-gray-200 border-1">
                    <ContractDetails data={data} />
                    <CaseDetailsSideNav
                        CaseAdditionalDetails={caseDetails?.additionalData}
                        carrier={caseDetails?.carrier}
                        process={caseDetails.process}
                        applicationType={caseDetails.applicationType}
                    />
                    {shouldShowCaseInsights && (
                        <div className="flex w-full flex-col p-4 border-t-2 border-gray-100">
                            <Title
                                className="mb-2 flex items-center gap-2"
                                variant={TitleVariant.SubTitle}
                            >
                                <LighBulb height={24} width={24} />
                                Insight
                            </Title>
                            <div className="flex flex-row gap-2">
                                {!aiSummary && (
                                    <InProgressIcon
                                        height={18}
                                        width={18}
                                        role="presentation"
                                        aria-hidden="true"
                                        className={`shrink-0 fill-gray-600 ${loadingClasses}`}
                                    />
                                )}
                                <Typography variant={TypographyVariant.BodySm}>
                                    {aiSummary ?? 'Generating AI Summary...'}
                                </Typography>
                            </div>
                        </div>
                    )}
                    <Transactions caseDetails={caseDetails} />
                </div>
                {caseDetails.process !== Processes.AgentOnboarding && (
                    <CaseSideNavTabs
                        caseDetails={caseDetails}
                        sideNavData={data}
                    />
                )}
            </div>
        </div>
    );
};
// #endregion

export default CaseSideNav;
