import {
    Address,
    DisbursementPaymentForm,
    DisbursementType,
    PaymentForm,
} from '@zinnia/api-types/types/sor';
import {
    Label,
    Tag,
    TagVariant,
    TooltipPlacement,
} from '@zinnia/bloom/components';
import clsx from 'clsx';
import { TFunction, useTranslation } from 'next-i18next';

import Content, { ContentVariant } from '@deps/components/content/content';
import DotContainer from '@deps/components/dot-container/dot-container';
import { PiiWrapper } from '@deps/components/pii/PiiWrapper';
import PopoverOnTruncate from '@deps/components/popover-on-truncate/popover-on-truncate';
import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import { formatAddress } from '@deps/helpers/address.helpers';
import { negativeNumberFormatify } from '@deps/helpers/numbers.helpers';
import { formatAccountNumber } from '@deps/helpers/string.helpers';
import { getPaymentType } from '@deps/helpers/systematic-program.helpers';
import { DEFAULT_ERROR_STRING } from '@deps/types/constants';

import PayeeSummaryCardRow from './payee-summary-card-row/payee-summary-card-row';
import { getBeneficiaryColor } from '../people-card-container/people-card-container.helpers';

export interface Charges {
    chargeType: string;
    coverageId: string;
    chargeAmount: string;
    chargeAppliedRate?: string;
}

interface FinancialDataProps {
    beneficiaryColor?: boolean;
    federalTaxDollarAmount?: string;
    federalTaxPercentage?: string;
    requestedAmountDollarAmount?: string;
    requestedAmountPercentage?: string;
    stateTaxDollarAmount?: string;
    stateTaxPercentage?: string;
    totalAllocationAmount?: string;
    disbursementType?: DisbursementType;
    ownerTaxState?: string;
    charges?: Charges[];
}

interface PayeeNameProps {
    index?: number;
    payeeName: string;
    beneficiaryColor?: boolean;
}

interface PaymentProps {
    accountNumber?: string;
    address?: Address;
    branchName?: string;
    // TODO MG: allow PaymentForm or DisbursementPaymentForm?
    paymentType?: DisbursementPaymentForm | PaymentForm;
    fboFfc?: string;
}

interface TranslationProps {
    t: TFunction;
}

export interface PayeeSummaryCardProps
    extends FinancialDataProps,
        PayeeNameProps,
        PaymentProps {
    classNames?: string;
    showFinancialData?: boolean;
}

const FinancialData = ({
    federalTaxDollarAmount,
    federalTaxPercentage,
    requestedAmountDollarAmount,
    requestedAmountPercentage,
    stateTaxDollarAmount,
    stateTaxPercentage,
    totalAllocationAmount,
    disbursementType,
    t,
    ownerTaxState,
    charges,
}: FinancialDataProps & TranslationProps) => {
    return (
        <div className="mt-6">
            <div className="relative mb-4 inline-flex items-center justify-start gap-4 align-middle">
                <Typography variant={TypographyVariant.H4}>
                    {t('payeeSummaryCard.financial')}
                </Typography>
                {!!disbursementType && (
                    <span className="pointer-events-none inline-flex items-center uppercase">
                        <Tag
                            variant={TagVariant.White}
                            text={disbursementType}
                        />
                    </span>
                )}
            </div>

            <PayeeSummaryCardRow
                amount={requestedAmountDollarAmount}
                label={t('payeeSummaryCard.requestedAmount') as string}
                percentage={requestedAmountPercentage}
            />
            <hr className="my-4 h-0.5 border-none bg-gray-100" />
            {charges?.map((charge, index) => (
                <PayeeSummaryCardRow
                    key={index}
                    amount={negativeNumberFormatify(charge.chargeAmount)}
                    label={charge.chargeType}
                />
            ))}
            <PayeeSummaryCardRow
                amount={federalTaxDollarAmount}
                label={t('payeeSummaryCard.federalTax') as string}
                percentage={federalTaxPercentage}
            />
            <PayeeSummaryCardRow
                amount={stateTaxDollarAmount}
                label={
                    t('payeeSummaryCard.stateTax', {
                        state: ownerTaxState,
                    }) as string
                }
                percentage={stateTaxPercentage}
            />
            <PayeeSummaryCardRow
                amount={totalAllocationAmount}
                isSumTotalRow={true}
                label={t('payeeSummaryCard.totalPayment') as string}
            />
        </div>
    );
};

const PayeeName = ({ beneficiaryColor, index, payeeName }: PayeeNameProps) => {
    return (
        <div className="flex w-fit">
            {!!beneficiaryColor && !!index && (
                <div className="mr-2 flex flex-col">
                    <div
                        className={`${getBeneficiaryColor(
                            index
                        )} h-[24px] min-w-[24px] self-center rounded`}
                    ></div>
                </div>
            )}
            <PopoverOnTruncate
                title={payeeName}
                placement={TooltipPlacement.TopRight}
            >
                <span>
                    <Typography
                        className="text-left"
                        variant={TypographyVariant.H3}
                    >
                        <PiiWrapper>{payeeName}</PiiWrapper>
                    </Typography>
                </span>
            </PopoverOnTruncate>
        </div>
    );
};

const PaymentInfo = ({
    accountNumber,
    address,
    branchName,
    paymentType,
    t,
}: PaymentProps & TranslationProps) => {
    switch (paymentType) {
        case PaymentForm.WIRE:
        case PaymentForm.ACH:
        case DisbursementPaymentForm.WIRE:
        case DisbursementPaymentForm.EFT:
        case DisbursementPaymentForm.ACH:
            return (
                <div className="flex flex-col">
                    <div className="mr-4 pb-[5px] font-primary text-sm font-semibold leading-4.5">
                        <PiiWrapper>{branchName}</PiiWrapper>
                    </div>
                    <Content
                        pii={true}
                        details={
                            t('payeeSummaryCard.checkingEndingIn', {
                                accountNumber: formatAccountNumber(
                                    accountNumber,
                                    true
                                ),
                            }) as string
                        }
                        variant={ContentVariant.BodySm}
                    />
                </div>
            );
        case DisbursementPaymentForm.CHECK:
        case PaymentForm.CHECK:
            return (
                <div className="font-secondary text-md font-normal leading-[22px]">
                    {address ? (
                        <div className="flex flex-col">
                            {formatAddress(address).map((line) => (
                                <p key={line}>
                                    <PiiWrapper>{line}</PiiWrapper>
                                </p>
                            ))}
                        </div>
                    ) : (
                        DEFAULT_ERROR_STRING
                    )}
                </div>
            );
        case PaymentForm.CREDITCARD:
            return (
                <div className="flex flex-col">
                    <Content
                        pii={true}
                        details={
                            t('payeeSummaryCard.creditCardEndingIn', {
                                accountNumber: formatAccountNumber(
                                    accountNumber,
                                    true
                                ),
                            }) as string
                        }
                        variant={ContentVariant.BodySm}
                    />
                </div>
            );
        default:
            return null;
    }
};

const PaymentMethod = ({
    accountNumber,
    address,
    branchName,
    paymentType,
    t,
    fboFfc,
}: PaymentProps & TranslationProps) => {
    if (!paymentType) return;
    else {
        return (
            <>
                <Typography className="mb-4" variant={TypographyVariant.H4}>
                    {t('payeeSummaryCard.paymentMethod')}
                </Typography>
                <div className="flex flex-col gap-4">
                    {fboFfc && (
                        <DotContainer
                            dotLeftSide={
                                <Label>
                                    {t(
                                        'workflows.paymentStep.paymentMethod.fboFfc.tooltipTitle'
                                    )}
                                </Label>
                            }
                            dotRightSide={
                                <Typography variant={TypographyVariant.Body}>
                                    {fboFfc}
                                </Typography>
                            }
                        />
                    )}
                    <div className="flex gap-4">
                        <Tag
                            isSelected={false}
                            variant={TagVariant.White}
                            text={
                                getPaymentType(paymentType, t) ??
                                DEFAULT_ERROR_STRING
                            }
                        />
                        <PaymentInfo
                            t={t}
                            accountNumber={accountNumber}
                            address={address}
                            branchName={branchName}
                            paymentType={paymentType}
                        />
                    </div>
                </div>
            </>
        );
    }
};

const PayeeSummaryCard = ({
    accountNumber,
    address,
    beneficiaryColor,
    branchName,
    classNames,
    federalTaxDollarAmount,
    federalTaxPercentage,
    index,
    payeeName,
    paymentType,
    requestedAmountDollarAmount,
    requestedAmountPercentage,
    showFinancialData = true,
    stateTaxDollarAmount,
    stateTaxPercentage,
    totalAllocationAmount,
    disbursementType,
    ownerTaxState,
    fboFfc,
    charges,
}: PayeeSummaryCardProps) => {
    const { t } = useTranslation();

    const containerClasses = clsx(
        'flex flex-col',
        'w-full  min-w-[420px] max-w-[512px]',
        'rounded border-2 border-gray-100',
        'bg-gray-50',
        classNames
    );
    const sectionClasses = 'flex flex-col p-4 md:p-6 lg:p-8';
    return (
        <div className={containerClasses}>
            <div className={sectionClasses}>
                <PayeeName
                    index={index}
                    payeeName={payeeName}
                    beneficiaryColor={beneficiaryColor}
                />
                <div className="flex flex-col">
                    {showFinancialData && (
                        <FinancialData
                            t={t}
                            beneficiaryColor={beneficiaryColor}
                            federalTaxDollarAmount={federalTaxDollarAmount}
                            federalTaxPercentage={federalTaxPercentage}
                            requestedAmountDollarAmount={
                                requestedAmountDollarAmount
                            }
                            requestedAmountPercentage={
                                requestedAmountPercentage
                            }
                            stateTaxDollarAmount={stateTaxDollarAmount}
                            stateTaxPercentage={stateTaxPercentage}
                            totalAllocationAmount={totalAllocationAmount}
                            disbursementType={disbursementType}
                            ownerTaxState={ownerTaxState}
                            charges={charges}
                        />
                    )}
                </div>
            </div>

            <hr className="h-0.5 border-none bg-gray-100" />

            <div className={sectionClasses}>
                <PaymentMethod
                    accountNumber={accountNumber ?? DEFAULT_ERROR_STRING}
                    address={address}
                    t={t}
                    branchName={
                        branchName?.toLocaleUpperCase() ?? DEFAULT_ERROR_STRING
                    }
                    paymentType={paymentType}
                    fboFfc={fboFfc}
                />
            </div>
        </div>
    );
};

export default PayeeSummaryCard;
