import { useQuery } from '@tanstack/react-query';
import { Tag, Tooltip, TooltipPlacement } from '@zinnia/bloom/components';
import * as changeCase from 'change-case';
import dayjs from 'dayjs';
import { TFunction, useTranslation } from 'next-i18next';
import { HTMLAttributes } from 'react';

import ClickWrapper from '@deps/components/click-container/click-wrapper';
import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
/**
 * @deprecated Use standard Sidesheet from Bloom component library
 */
import { useSideSheetContextLegacy } from '@deps/contexts/SideSheetContext';
import { numberFormatify } from '@deps/helpers/numbers.helpers';
import { CaseAdditionalData } from '@deps/models/case/case';
import { getTransactionEntityQuery } from '@deps/queries/tanstack/transactions/transactionsQueries';
import { ReactComponent as InProgressIcon } from '@deps/styles/elements/icons/alert/in-progress.svg';
import { ReactComponent as CashIcon } from '@deps/styles/elements/icons/icons_outlined/cash.svg';
import { ReactComponent as ChevronRightIcon } from '@deps/styles/elements/icons/icons_outlined/chevron-right.svg';
import { DEFAULT_DATE_FORMAT } from '@deps/utils/dates';
import { DEFAULT_ERROR_STRING } from '@deps/utils/strings';
import { Address, Country, State } from '@zinnia/api-types/types/sor';
import { TransactionModelResponse } from '@zinnia/api-types/types/transaction-store';

import { FormattedAddress } from '../people-data-cards/address-card/address-card.helpers';

type FundingSource = CaseAdditionalData;

type TransactionEntitySideSheetValues = {
    companyName: string;
    sourceType: string;
    expectedAmount: string;
    receivedAmount: string;
    fundingCompany: string;
    fundingContract: string;
    paymentMethod: string;
    grossAmount: string;
    netAmount: string;
    rateLockEndDate: string;
    rateLockStartDate: string;
    premiumStatus: string;
    contactDetails: {
        mailingAddress: Address;
        phoneNumber: string;
        faxNumber: string;
    } | null;
    transferDetails: {
        trackingNumber: string;
        documentSentDate: string;
        deliveryMethod: string;
    } | null;
};

const formatAddress = (address: {
    addressLines: string[];
    city: string;
    state: string;
    zip: string;
    zipSuffix?: string;
    country: string;
}): Address => {
    const { addressLines, country, state, zip, zipSuffix, ...rest } = address;
    return {
        ...rest,
        addressLine1: addressLines[0],
        addressLine2: addressLines[1],
        addressLine3: addressLines[2],
        country: country as Country,
        state: state as State,
        zipCode: zip,
        zipCodeExtension: zipSuffix,
    };
};

const SourceTypeTag = ({ sourceType }: { sourceType: string | undefined }) => {
    if (!sourceType) {
        return DEFAULT_ERROR_STRING;
    }
    return <Tag text={sourceType} />;
};

const getSideSheetValues = (
    transactionEntity: TransactionModelResponse,
    t: TFunction
): TransactionEntitySideSheetValues => {
    const { entity } = transactionEntity;
    const {
        exchangeReplace,
        institutionName,
        moneySource,
        receivedAmount,
        documentSentDate,
    } = entity?.payment || {};
    const { deliveryMethod } = entity?.payment?.exchangeReplace ?? null;
    const trackingNumber = entity?.trackingNumber ?? null;
    const rateLockEndDate = exchangeReplace?.rateLockEndDate;
    const rateLockStartDate = exchangeReplace?.rateLockStartDate;
    const values: TransactionEntitySideSheetValues = {
        companyName:
            exchangeReplace?.companyName ||
            t('caseOverview.sidenav.tabs.fundingSourceSideSheet.fundingSource'),
        sourceType: moneySource ?? null,
        expectedAmount: numberFormatify(exchangeReplace?.amountRequested),
        premiumStatus:
            receivedAmount === null || receivedAmount === undefined
                ? t(
                      'caseOverview.sidenav.tabs.fundingSourceSideSheet.awaitingFunds'
                  )
                : t(
                      'caseOverview.sidenav.tabs.fundingSourceSideSheet.received'
                  ),
        receivedAmount: numberFormatify(receivedAmount),
        fundingCompany: institutionName ?? null,
        fundingContract: exchangeReplace?.sourcePolicyNumber ?? null,
        contactDetails: null,
        paymentMethod: entity?.payment?.paymentMethod
            ? entity?.payment?.paymentMethod
            : null,
        grossAmount: numberFormatify(entity?.payment?.grossAmount) ?? null,
        netAmount: numberFormatify(entity?.payment?.netAmount) ?? null,
        rateLockEndDate: rateLockEndDate
            ? dayjs(exchangeReplace?.rateLockEndDate).format(
                  DEFAULT_DATE_FORMAT
              )
            : DEFAULT_ERROR_STRING,
        rateLockStartDate: rateLockStartDate
            ? dayjs(exchangeReplace?.rateLockStartDate).format(
                  DEFAULT_DATE_FORMAT
              )
            : DEFAULT_ERROR_STRING,
        transferDetails: null,
    };
    if (
        exchangeReplace?.address ||
        exchangeReplace?.phone ||
        exchangeReplace?.faxId
    ) {
        values.contactDetails = {
            mailingAddress:
                formatAddress(exchangeReplace?.address || {}) ?? null,
            phoneNumber: exchangeReplace?.phone ?? null,
            faxNumber: exchangeReplace?.faxId ?? null,
        };
    }
    if (documentSentDate || deliveryMethod || trackingNumber) {
        values.transferDetails = {
            documentSentDate: documentSentDate
                ? dayjs(documentSentDate).format(DEFAULT_DATE_FORMAT)
                : DEFAULT_ERROR_STRING,
            deliveryMethod: deliveryMethod ?? DEFAULT_ERROR_STRING,
            trackingNumber: trackingNumber ?? DEFAULT_ERROR_STRING,
        };
    }
    return values;
};

const FundingSourceSideSheetContent = ({
    transactionEntity,
}: {
    transactionEntity: TransactionModelResponse | null;
}) => {
    const { t } = useTranslation();
    if (!transactionEntity) {
        return null;
    }
    const labelClassNames = 'text-gray-600 w-[144px]';
    const sideSheetValues = getSideSheetValues(transactionEntity, t);
    const hasTransferDetails = !!(
        sideSheetValues.transferDetails?.documentSentDate ||
        sideSheetValues.transferDetails?.deliveryMethod ||
        sideSheetValues.transferDetails?.trackingNumber
    );

    const hasContactDetails = !!(
        sideSheetValues.contactDetails?.mailingAddress ||
        sideSheetValues.contactDetails?.phoneNumber ||
        sideSheetValues.contactDetails?.faxNumber
    );
    return (
        <div className="p-8">
            <Typography variant={TypographyVariant.H3}>
                {t(
                    'caseOverview.sidenav.tabs.fundingSourceSideSheet.fundingDetails'
                )}
            </Typography>
            <div className="flex flex-col w-full gap-2 my-4">
                {!!sideSheetValues.sourceType && (
                    <div className="flex flex-row w-full gap-8">
                        <Typography
                            variant={TypographyVariant.BodySm}
                            className={labelClassNames}
                        >
                            {t(
                                'caseOverview.sidenav.tabs.fundingSourceSideSheet.sourceType'
                            )}
                        </Typography>
                        <SourceTypeTag
                            sourceType={sideSheetValues.sourceType}
                        />
                    </div>
                )}
                <div className="flex flex-row w-full gap-8">
                    <Typography
                        variant={TypographyVariant.BodySm}
                        className={labelClassNames}
                    >
                        {t(
                            'caseOverview.sidenav.tabs.fundingSourceSideSheet.premiumStatus'
                        )}
                    </Typography>
                    <Typography variant={TypographyVariant.BodySm}>
                        {sideSheetValues.premiumStatus}
                    </Typography>
                </div>
                {!!sideSheetValues.fundingCompany && (
                    <div className="flex flex-row w-full gap-8">
                        <Typography
                            variant={TypographyVariant.BodySm}
                            className={labelClassNames}
                        >
                            {t(
                                'caseOverview.sidenav.tabs.fundingSourceSideSheet.fundingCompany'
                            )}
                        </Typography>
                        <Typography variant={TypographyVariant.BodySm}>
                            {sideSheetValues.fundingCompany}
                        </Typography>
                    </div>
                )}
                {!!sideSheetValues.fundingContract && (
                    <div className="flex flex-row w-full gap-8">
                        <Typography
                            variant={TypographyVariant.BodySm}
                            className={labelClassNames}
                        >
                            {t(
                                'caseOverview.sidenav.tabs.fundingSourceSideSheet.fundingContract'
                            )}
                        </Typography>
                        <Typography variant={TypographyVariant.BodySm}>
                            {sideSheetValues.fundingContract}
                        </Typography>
                    </div>
                )}
                <div className="flex flex-row w-full gap-8">
                    <Typography
                        variant={TypographyVariant.BodySm}
                        className={labelClassNames}
                    >
                        {t(
                            'caseOverview.sidenav.tabs.fundingSourceSideSheet.expectedAmount'
                        )}
                    </Typography>
                    <Typography variant={TypographyVariant.BodySm}>
                        {sideSheetValues.expectedAmount}
                    </Typography>
                </div>
                {!!sideSheetValues.paymentMethod && (
                    <div className="flex flex-row w-full gap-8">
                        <Typography
                            variant={TypographyVariant.BodySm}
                            className={labelClassNames}
                        >
                            {t(
                                'caseOverview.sidenav.tabs.fundingSourceSideSheet.paymentMethod'
                            )}
                        </Typography>
                        <Typography variant={TypographyVariant.BodySm}>
                            {changeCase.capitalCase(
                                sideSheetValues.paymentMethod
                            )}
                        </Typography>
                    </div>
                )}
                {!!sideSheetValues.grossAmount &&
                    sideSheetValues.grossAmount !== DEFAULT_ERROR_STRING && (
                        <div className="flex flex-row w-full gap-8">
                            <Typography
                                variant={TypographyVariant.BodySm}
                                className={labelClassNames}
                            >
                                {t(
                                    'caseOverview.sidenav.tabs.fundingSourceSideSheet.grossAmount'
                                )}
                            </Typography>
                            <Typography variant={TypographyVariant.BodySm}>
                                {sideSheetValues.grossAmount}
                            </Typography>
                        </div>
                    )}
                {!!sideSheetValues.netAmount &&
                    sideSheetValues.netAmount !== DEFAULT_ERROR_STRING && (
                        <div className="flex flex-row w-full gap-8">
                            <Typography
                                variant={TypographyVariant.BodySm}
                                className={labelClassNames}
                            >
                                {t(
                                    'caseOverview.sidenav.tabs.fundingSourceSideSheet.netAmount'
                                )}
                            </Typography>
                            <Typography variant={TypographyVariant.BodySm}>
                                {sideSheetValues.netAmount}
                            </Typography>
                        </div>
                    )}
                <div className="flex flex-row w-full gap-8">
                    <Typography
                        variant={TypographyVariant.BodySm}
                        className={labelClassNames}
                    >
                        {t(
                            'caseOverview.sidenav.tabs.fundingSourceSideSheet.receivedAmount'
                        )}
                    </Typography>
                    <Typography variant={TypographyVariant.BodySm}>
                        {sideSheetValues.receivedAmount}
                    </Typography>
                </div>
                <div className="flex flex-row w-full gap-8">
                    <Typography
                        variant={TypographyVariant.BodySm}
                        className={labelClassNames}
                    >
                        {t(
                            'caseOverview.sidenav.tabs.fundingSourceSideSheet.rateLockStartDate'
                        )}
                    </Typography>
                    <Typography variant={TypographyVariant.BodySm}>
                        {sideSheetValues.rateLockStartDate}
                    </Typography>
                </div>
                <div className="flex flex-row w-full gap-8">
                    <Typography
                        variant={TypographyVariant.BodySm}
                        className={labelClassNames}
                    >
                        {t(
                            'caseOverview.sidenav.tabs.fundingSourceSideSheet.rateLockEndDate'
                        )}
                    </Typography>
                    <Typography variant={TypographyVariant.BodySm}>
                        {sideSheetValues.rateLockEndDate}
                    </Typography>
                </div>
            </div>
            {hasTransferDetails && (
                <div>
                    <Typography variant={TypographyVariant.H3}>
                        {t(
                            'caseOverview.sidenav.tabs.fundingSourceSideSheet.transferDetails'
                        )}
                    </Typography>
                    <div className="flex flex-col w-full gap-2 my-4">
                        <div className="flex flex-row w-full gap-8">
                            <Typography
                                variant={TypographyVariant.BodySm}
                                className={labelClassNames}
                            >
                                {t(
                                    'caseOverview.sidenav.tabs.fundingSourceSideSheet.documentSentDate'
                                )}
                            </Typography>
                            <Typography variant={TypographyVariant.BodySm}>
                                {
                                    sideSheetValues.transferDetails
                                        ?.documentSentDate
                                }
                            </Typography>
                        </div>
                        <div className="flex flex-row w-full gap-8">
                            <Typography
                                variant={TypographyVariant.BodySm}
                                className={labelClassNames}
                            >
                                {t(
                                    'caseOverview.sidenav.tabs.fundingSourceSideSheet.deliveryMethod'
                                )}
                            </Typography>
                            <Typography variant={TypographyVariant.BodySm}>
                                {
                                    sideSheetValues.transferDetails
                                        ?.deliveryMethod
                                }
                            </Typography>
                        </div>
                        <div className="flex flex-row w-full gap-8">
                            <Typography
                                variant={TypographyVariant.BodySm}
                                className={labelClassNames}
                            >
                                {t(
                                    'caseOverview.sidenav.tabs.fundingSourceSideSheet.trackingNumber'
                                )}
                            </Typography>
                            <Typography variant={TypographyVariant.BodySm}>
                                {
                                    sideSheetValues.transferDetails
                                        ?.trackingNumber
                                }
                            </Typography>
                        </div>
                    </div>
                </div>
            )}
            {hasContactDetails && (
                <>
                    <Typography variant={TypographyVariant.H3}>
                        {t(
                            'caseOverview.sidenav.tabs.fundingSourceSideSheet.contactDetails'
                        )}
                    </Typography>
                    <div className="flex flex-col w-full gap-2 my-4">
                        {sideSheetValues.contactDetails?.mailingAddress !==
                            null && (
                            <div className="flex flex-row w-full gap-8">
                                <Typography
                                    variant={TypographyVariant.BodySm}
                                    className={labelClassNames}
                                >
                                    {t(
                                        'caseOverview.sidenav.tabs.fundingSourceSideSheet.mailingAddress'
                                    )}
                                </Typography>
                                <FormattedAddress
                                    address={
                                        sideSheetValues.contactDetails
                                            ?.mailingAddress as Address
                                    }
                                />
                            </div>
                        )}
                        {sideSheetValues.contactDetails?.phoneNumber !==
                            null && (
                            <div className="flex flex-row w-full gap-8">
                                <Typography
                                    variant={TypographyVariant.BodySm}
                                    className={labelClassNames}
                                >
                                    {t(
                                        'caseOverview.sidenav.tabs.fundingSourceSideSheet.phoneNumber'
                                    )}
                                </Typography>
                                <Typography variant={TypographyVariant.BodySm}>
                                    {
                                        sideSheetValues.contactDetails
                                            ?.phoneNumber
                                    }
                                </Typography>
                            </div>
                        )}
                        {sideSheetValues.contactDetails?.faxNumber !== null && (
                            <div className="flex flex-row w-full gap-8">
                                <Typography
                                    variant={TypographyVariant.BodySm}
                                    className={labelClassNames}
                                >
                                    {t(
                                        'caseOverview.sidenav.tabs.fundingSourceSideSheet.faxNumber'
                                    )}
                                </Typography>
                                <Typography variant={TypographyVariant.BodySm}>
                                    {sideSheetValues.contactDetails?.faxNumber}
                                </Typography>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

const FundingSourceItem = ({
    fundingSource,
    ...rest
}: { fundingSource: FundingSource } & HTMLAttributes<HTMLLIElement>) => {
    const { t } = useTranslation();

    const {
        data: transactionEntity,
        isLoading,
        isError,
    } = useQuery({
        queryKey: ['fundingSourceTransaction', fundingSource.value],
        queryFn: () => getTransactionEntityQuery(fundingSource.value),
    });

    const { changeSideSheetContent, handleOpen } = useSideSheetContextLegacy();

    const openSideSheet = (
        transactionEntity: TransactionModelResponse | null
    ) => {
        if (!transactionEntity) {
            return;
        }

        const sideSheetValues = getSideSheetValues(transactionEntity, t);

        changeSideSheetContent(
            <Typography variant={TypographyVariant.H2}>
                {sideSheetValues.companyName}
            </Typography>,
            <FundingSourceSideSheetContent
                transactionEntity={transactionEntity}
            />
        );
        handleOpen(true);
    };

    if (isLoading) {
        return (
            <li
                className="flex gap-md rounded bg-white border-2 border-[#ededed] p-4 mb-2"
                {...rest}
            >
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
                    <Typography
                        variant={TypographyVariant.BodySmBold}
                        className={'text-gray-600'}
                    >
                        {t('caseOverview.sidenav.tabs.loadingFundingSource')}
                    </Typography>
                    <Typography
                        variant={TypographyVariant.BodySm}
                        className="text-gray-600"
                    >
                        {t(
                            'caseOverview.sidenav.tabs.loadingFundingSourceCopy'
                        )}
                    </Typography>
                </div>
            </li>
        );
    }

    if (isError) {
        return (
            <li
                className="flex flex-row gap-md rounded bg-white border-2 border-[#ededed] p-4 mb-2"
                {...rest}
            >
                <div className="mt-0.5">
                    <InProgressIcon
                        height={18}
                        width={18}
                        role="presentation"
                        aria-hidden={true}
                        className="shrink-0 text-gray-600"
                    />
                </div>
                <div>
                    <Typography
                        variant={TypographyVariant.BodySmBold}
                        className={'text-gray-600'}
                    >
                        {t(
                            'caseOverview.sidenav.tabs.errorGettingFundingSourceInfo'
                        )}
                    </Typography>
                    <Typography
                        variant={TypographyVariant.BodySm}
                        className="text-gray-600"
                    >
                        {t(
                            'caseOverview.sidenav.tabs.errorGettingFundingSourceInfoCopy'
                        )}
                    </Typography>
                </div>
            </li>
        );
    }
    const fundingSourceLabel =
        transactionEntity?.entity?.payment?.exchangeReplace?.companyName ??
        t(`caseOverview.sidenav.tabs.fundingSource`);
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
                            <Typography
                                className="flex-shrink"
                                variant={TypographyVariant.BodySmBold}
                            >
                                {fundingSourceLabel}
                            </Typography>
                            {transactionEntity?.entity?.payment?.moneySource ? (
                                <Tag
                                    className="w-auto flex-shrink-0"
                                    text={
                                        transactionEntity?.entity?.payment
                                            ?.moneySource
                                    }
                                />
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

export const FundingSources = ({
    fundingSources,
    ...rest
}: { fundingSources: FundingSource[] } & HTMLAttributes<HTMLDivElement>) => {
    const { t } = useTranslation();

    // Remove empty funding sources
    const fundingSourcesList = fundingSources.filter((fs) => fs.value);

    return (
        <div className="flex w-full flex-col" {...rest}>
            {fundingSourcesList.length ? (
                <ul className="flex w-full flex-col">
                    {fundingSourcesList.map((fundingSource) => (
                        <FundingSourceItem
                            key={fundingSource.id}
                            fundingSource={fundingSource}
                        />
                    ))}
                </ul>
            ) : (
                <span>
                    {t(
                        'caseOverview.sidenav.tabs.fundingSource.noFundingSource'
                    )}
                </span>
            )}
        </div>
    );
};
