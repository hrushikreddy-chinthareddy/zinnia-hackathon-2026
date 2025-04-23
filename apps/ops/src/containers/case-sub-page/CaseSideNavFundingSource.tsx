import { useQuery } from '@tanstack/react-query';
import { TransactionModelResponse } from '@zinnia/api-types/types/transaction-store';
import { Tag, Tooltip, TooltipPlacement } from '@zinnia/bloom/components';
import { TFunction, useTranslation } from 'next-i18next';
import { HTMLAttributes } from 'react';

import ClickWrapper from '@deps/components/click-container/click-wrapper';
import Typography, { TypographyVariant } from '@deps/components/typography/typography';
import { useSideSheetContext } from '@deps/contexts/SideSheetContext';
import { numberFormatify } from '@deps/helpers/numbers.helper';
import { CaseAdditionalData } from '@deps/models/case/case';
import { Address, Country, State } from '@deps/models/policy/sor-policy';
import { getTransactionEntityQuery } from '@deps/queries/tanstack/transactions/transactionsQueries';
import { ReactComponent as InProgressIcon } from '@deps/styles/elements/icons/alert/in-progress.svg';
import { ReactComponent as CashIcon } from '@deps/styles/elements/icons/icons_outlined/cash.svg';
import { ReactComponent as ChevronRightIcon } from '@deps/styles/elements/icons/icons_outlined/chevron-right.svg';
import { DEFAULT_ERROR_STRING } from '@deps/types/constants';

import { FormattedAddress } from '../people-data-cards/address-card/address-card.helpers';

type FundingSource = CaseAdditionalData;

type TransactionEntitySideSheetValues = {
    companyName: string;
    sourceType: string;
    expectedAmount: string;
    receivedAmount: string;
    trackingNumber: string;
    fundingCompany: string;
    fundingContract: string;
    contractDetails: {
        mailingAddress: Address;
        phoneNumber: string;
        faxNumber: string;
    } | null;
};

const formatAddress = (address: { addressLines: string[]; city: string; state: string; zip: string; country: string }): Address => {
    const { addressLines, country, state, zip, ...rest } = address;
    return {
        ...rest,
        addressLine1: addressLines[0],
        addressLine2: addressLines[1],
        addressLine3: addressLines[2],
        country: country as Country,
        state: state as State,
        zipCode: zip,
    };
};

const SourceTypeTag = ({ sourceType }: { sourceType: string | undefined }) => {
    if (!sourceType) {
        return DEFAULT_ERROR_STRING;
    }
    return <Tag text={sourceType} />;
};

const getSideSheetValues = (transactionEntity: TransactionModelResponse, t: TFunction): TransactionEntitySideSheetValues => {
    const { entity } = transactionEntity;
    const { exchangeReplace, institutionName, moneySource } = entity?.payment || {};
    const values: TransactionEntitySideSheetValues = {
        companyName: exchangeReplace?.companyName || t('caseOverview.sidenav.tabs.fundingSourceSideSheet.fundingDetails'),
        sourceType: moneySource,
        expectedAmount: numberFormatify(exchangeReplace?.amountRequested),
        receivedAmount: numberFormatify(entity?.payment?.receivedAmount),
        trackingNumber: exchangeReplace?.trackingNumber ?? DEFAULT_ERROR_STRING,
        fundingCompany: institutionName ?? DEFAULT_ERROR_STRING,
        fundingContract: exchangeReplace?.sourcePolicyNumber ?? DEFAULT_ERROR_STRING,
        contractDetails: null,
    };
    if (exchangeReplace?.address || exchangeReplace?.phone || exchangeReplace?.faxId) {
        values.contractDetails = {
            mailingAddress: formatAddress(exchangeReplace?.address || {}),
            phoneNumber: exchangeReplace?.phone ?? DEFAULT_ERROR_STRING,
            faxNumber: exchangeReplace?.faxId ?? DEFAULT_ERROR_STRING,
        };
    }
    return values;
};

const FundingSourceSideSheetContent = ({ transactionEntity }: { transactionEntity: TransactionModelResponse | null }) => {
    const { t } = useTranslation();
    if (!transactionEntity) {
        return null;
    }
    const labelClassNames = 'text-gray-600 w-[144px]';
    const sideSheetValues = getSideSheetValues(transactionEntity, t);
    return (
        <div className="p-8">
            <Typography variant={TypographyVariant.H3}>{t('caseOverview.sidenav.tabs.fundingSourceSideSheet.fundingDetails')}</Typography>
            <div className="flex flex-col w-full gap-2 my-4">
                <div className="flex flex-row w-full gap-8">
                    <Typography variant={TypographyVariant.BodySm} className={labelClassNames}>
                        {t('caseOverview.sidenav.tabs.fundingSourceSideSheet.sourceType')}
                    </Typography>
                    <SourceTypeTag sourceType={sideSheetValues.sourceType} />
                </div>
                <div className="flex flex-row w-full gap-8">
                    <Typography variant={TypographyVariant.BodySm} className={labelClassNames}>
                        {t('caseOverview.sidenav.tabs.fundingSourceSideSheet.expectedAmount')}
                    </Typography>
                    <Typography variant={TypographyVariant.BodySm}>{sideSheetValues.expectedAmount}</Typography>
                </div>
                <div className="flex flex-row w-full gap-8">
                    <Typography variant={TypographyVariant.BodySm} className={labelClassNames}>
                        {t('caseOverview.sidenav.tabs.fundingSourceSideSheet.receivedAmount')}
                    </Typography>
                    <Typography variant={TypographyVariant.BodySm}>{sideSheetValues.receivedAmount}</Typography>
                </div>
                <div className="flex flex-row w-full gap-8">
                    <Typography variant={TypographyVariant.BodySm} className={labelClassNames}>
                        {t('caseOverview.sidenav.tabs.fundingSourceSideSheet.trackingNumber')}
                    </Typography>
                    <Typography variant={TypographyVariant.BodySm}>{sideSheetValues.trackingNumber}</Typography>
                </div>
                <div className="flex flex-row w-full gap-8">
                    <Typography variant={TypographyVariant.BodySm} className={labelClassNames}>
                        {t('caseOverview.sidenav.tabs.fundingSourceSideSheet.fundingCompany')}
                    </Typography>
                    <Typography variant={TypographyVariant.BodySm}>{sideSheetValues.fundingCompany}</Typography>
                </div>
                <div className="flex flex-row w-full gap-8">
                    <Typography variant={TypographyVariant.BodySm} className={labelClassNames}>
                        {t('caseOverview.sidenav.tabs.fundingSourceSideSheet.fundingContract')}
                    </Typography>
                    <Typography variant={TypographyVariant.BodySm}>{sideSheetValues.fundingContract}</Typography>
                </div>
            </div>
            {sideSheetValues.contractDetails && (
                <>
                    <Typography variant={TypographyVariant.H3}>
                        {t('caseOverview.sidenav.tabs.fundingSourceSideSheet.contractDetails')}
                    </Typography>
                    <div className="flex flex-col w-full gap-2 my-4">
                        <div className="flex flex-row w-full gap-8">
                            <Typography variant={TypographyVariant.BodySm} className={labelClassNames}>
                                {t('caseOverview.sidenav.tabs.fundingSourceSideSheet.mailingAddress')}
                            </Typography>
                            {sideSheetValues.contractDetails?.mailingAddress ? (
                                <FormattedAddress address={sideSheetValues.contractDetails?.mailingAddress as Address} />
                            ) : (
                                DEFAULT_ERROR_STRING
                            )}
                        </div>
                        <div className="flex flex-row w-full gap-8">
                            <Typography variant={TypographyVariant.BodySm} className={labelClassNames}>
                                {t('caseOverview.sidenav.tabs.fundingSourceSideSheet.phoneNumber')}
                            </Typography>
                            <Typography variant={TypographyVariant.BodySm}>{sideSheetValues.contractDetails?.phoneNumber}</Typography>
                        </div>
                        <div className="flex flex-row w-full gap-8">
                            <Typography variant={TypographyVariant.BodySm} className={labelClassNames}>
                                {t('caseOverview.sidenav.tabs.fundingSourceSideSheet.faxNumber')}
                            </Typography>
                            <Typography variant={TypographyVariant.BodySm}>{sideSheetValues.contractDetails?.faxNumber}</Typography>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

const FundingSourceItem = ({ fundingSource, ...rest }: { fundingSource: FundingSource } & HTMLAttributes<HTMLLIElement>) => {
    const { t } = useTranslation();

    const {
        data: transactionEntity,
        isLoading,
        isError,
    } = useQuery({
        queryKey: ['fundingSourceTransaction', fundingSource.value],
        queryFn: () => getTransactionEntityQuery(fundingSource.value),
    });

    const { changeSideSheetContent, handleOpen } = useSideSheetContext();

    const openSideSheet = (transactionEntity: TransactionModelResponse | null) => {
        if (!transactionEntity) {
            return;
        }

        const sideSheetValues = getSideSheetValues(transactionEntity, t);

        changeSideSheetContent(
            <Typography variant={TypographyVariant.H2}>{sideSheetValues.companyName}</Typography>,
            <FundingSourceSideSheetContent transactionEntity={transactionEntity} />
        );
        handleOpen(true);
    };

    if (isLoading) {
        return (
            <li className="flex gap-md rounded bg-white border-2 border-[#ededed] p-4 mb-2" {...rest}>
                <div className="mt-0.5">
                    <InProgressIcon
                        height={18}
                        width={18}
                        role="presentation"
                        className="shrink-0 text-gray-600 transform-origin-center duration-5000 animate-spin ease-linear"
                        aria-hidden={true}
                    />
                </div>
                <div>
                    <Typography variant={TypographyVariant.BodySmBold} className={'text-gray-600'}>
                        {t('caseOverview.sidenav.tabs.loadingFundingSource')}
                    </Typography>
                    <Typography variant={TypographyVariant.BodySm} className="text-gray-600">
                        {t('caseOverview.sidenav.tabs.loadingFundingSourceCopy')}
                    </Typography>
                </div>
            </li>
        );
    }

    if (isError) {
        return (
            <li className="flex flex-row gap-md rounded bg-white border-2 border-[#ededed] p-4 mb-2" {...rest}>
                <div className="mt-0.5">
                    <InProgressIcon height={18} width={18} role="presentation" aria-hidden={true} className="shrink-0 text-gray-600" />
                </div>
                <div>
                    <Typography variant={TypographyVariant.BodySmBold} className={'text-gray-600'}>
                        {t('caseOverview.sidenav.tabs.errorGettingFundingSourceInfo')}
                    </Typography>
                    <Typography variant={TypographyVariant.BodySm} className="text-gray-600">
                        {t('caseOverview.sidenav.tabs.errorGettingFundingSourceInfoCopy')}
                    </Typography>
                </div>
            </li>
        );
    }
    const fundingSourceLabel =
        transactionEntity?.entity?.payment?.exchangeReplace?.companyName ?? t(`caseOverview.sidenav.tabs.fundingSource`);
    return (
        <li className="flex gap-md rounded bg-white " {...rest}>
            <ClickWrapper
                onClick={() => openSideSheet(transactionEntity)}
                classes="w-full border-2 border-[#ededed]mb-2 !p-0 rounded border-gray-100"
                ariaLabel={`view more details for ${fundingSourceLabel}`}
            >
                <div className="flex flex-row justify-between gap-2 p-4 w-full">
                    <div className="flex flex-row justify-start items-center gap-2 w-full">
                        <CashIcon width={24} height={24} className="shrink-0" />
                        <div className="flex flex-row flex-wrap items-center gap-2 w-full">
                            <Typography className="flex-shrink" variant={TypographyVariant.BodySmBold}>
                                {fundingSourceLabel}
                            </Typography>
                            {transactionEntity?.entity?.payment?.moneySource ? (
                                <Tag className="w-auto flex-shrink-0" text={transactionEntity?.entity?.payment?.moneySource} />
                            ) : null}
                        </div>
                    </div>
                    <Tooltip
                        triggerClassName="h-6 self-center"
                        placement={TooltipPlacement.TopLeft}
                        tooltipClassName="!max-w-fit"
                        trigger={
                            <div className="shrink-0 flex items-center justify-center w-6 h-6 self-center">
                                <ChevronRightIcon
                                    data-testid="chevron"
                                    height={16}
                                    width={16}
                                    className="text-secondary hover:cursor-pointer hover:text-secondary-dark self-center shrink-0"
                                />
                            </div>
                        }
                    >
                        {t('caseOverview.tabs.viewDetails')}
                    </Tooltip>
                </div>
            </ClickWrapper>
        </li>
    );
};

export const FundingSources = ({ fundingSources, ...rest }: { fundingSources: FundingSource[] } & HTMLAttributes<HTMLDivElement>) => {
    const { t } = useTranslation();

    // Remove empty funding sources
    const fundingSourcesList = fundingSources.filter(fs => fs.value);

    return (
        <div className="flex w-full flex-col" {...rest}>
            {fundingSourcesList.length ? (
                <ul className="flex w-full flex-col">
                    {fundingSourcesList.map(fundingSource => (
                        <FundingSourceItem key={fundingSource.id} fundingSource={fundingSource} />
                    ))}
                </ul>
            ) : (
                <span>{t('caseOverview.sidenav.tabs.fundingSource.noFundingSource')}</span>
            )}
        </div>
    );
};
