import { TransactionType } from '@zinnia/api-types/types/sor';
import { AssistiveTextVariant, FieldSize } from '@zinnia/bloom/components';
import dayjs from 'dayjs';
import router from 'next/router';
import { ChangeEvent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import AssistiveText from '@deps/components/assistive-text/assistive-text';
import Field, { FieldType, FieldVariant } from '@deps/components/fields/field';
import FieldDateSelect, { DATE_PICKER_FORMAT } from '@deps/components/fields/field-date-select/field-date-select';
import IconButton from '@deps/components/icon-button/icon-button';
import NavElement, { NavElementSize, NavElementType, NavElementVariant } from '@deps/components/nav-element/nav-element';
import SelectSimple from '@deps/components/select/select';
import { SimpleOption } from '@deps/components/select/select.helpers';
import TransactionCta from '@deps/components/transaction-cta/transaction-cta';
import { ParentPage } from '@deps/components/transaction-navigation-buttons/transaction-navigation-buttons';
import WorkflowCard from '@deps/components/workflows/workflow-card/workflow-card';
import { TranslationFiles } from '@deps/config/translations';
import { getFundDetailsViewModel } from '@deps/containers/subpages/funds-sub-page/funds.helpers';
import { useFundTransfer } from '@deps/contexts/transactions/FundTransferContext';
import { useWorkflow } from '@deps/contexts/WorkflowContainerContext';
import { AmountType, FundKey } from '@deps/models/funds/enums';
import { Policy } from '@deps/models/policy/sor-policy';
import { TransactionResponse } from '@deps/queries/api/bpm';
import { ReactComponent as TrashIcon } from '@deps/styles/elements/icons/icons_outlined/trash.svg';
import { DefaultValue } from '@deps/types/constants';
import { TransactionStep } from '@deps/types/segment-analytics';
import { browserLogError } from '@deps/utils/browser-logging';
import { parseErrorInformation } from '@deps/utils/server-logging';

interface TransferProps {
    policy: Policy;
    validateTransaction?: () => Promise<TransactionResponse>;
    title: string;
    subtitle?: string;
}

type FundOption = {
    value: string;
    label: string;
};

const ErrorKeys = {
    transferFromFund: 'transferFromFund',
    transferFromAmount: 'transferFromAmount',
    transferToFund: 'transferToFund',
    transferToAmount: 'transferToAmount',
    totalAmount: 'totalAmount',
    totalPercent: 'totalPercent',
    effectiveDate: 'effectiveDate',
};

type Errors = Partial<Record<keyof typeof ErrorKeys, string>>;
type ErrorKey = (typeof ErrorKeys)[keyof typeof ErrorKeys];

const Transfer = ({ policy, validateTransaction, title, subtitle }: TransferProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, { keyPrefix: 'workflows.transferStep' });

    const { goToNext } = useWorkflow();
    const [errors, setErrors] = useState<Errors>({});

    const today = new Date();

    const { fundTransfer, setFundTransfer } = useFundTransfer();
    const [fetchingFunds, setFetchingFunds] = useState(false);

    const { policyNumber, product } = policy;
    const { funds, effectiveDate } = fundTransfer;

    const transferFromFunds: SimpleOption[] =
        policy?.allocation?.funds
            ?.filter(fund => fund.fundId && fund.totalFundValue && fund.totalFundValue > 0)
            .map(fund => ({
                value: fund.fundId || '',
                label: fund.fundName ? fund.fundName : fund.fundId ? fund.fundId : '',
                totalValue: fund.totalFundValue || '',
            })) ?? [];

    const [transferToFunds, setTransferToFunds] = useState<FundOption[]>([]);

    const transferType = fundTransfer?.transactionAmounts?.amountType;

    const transferOptions = [
        { value: AmountType.Amount, label: t('amountLabel') },
        { value: AmountType.Percentage, label: t('percentageLabel') },
    ];

    const fundIdToFind = funds.transferFrom[0].fundId;
    const fund = transferFromFunds?.find(fund => fund.value === fundIdToFind);
    const availableValue = fund ? fund.totalValue : 0;
    const fundTransferValue = funds.transferFrom[0].requestedAmount || 0;

    const transferToValue = funds.transferTo.reduce((sum, to) => sum + Number(to.requestedAmount || 0), 0);

    const lastTransferToFund = funds.transferTo[funds.transferTo.length - 1];
    const isDisabled =
        lastTransferToFund?.fundId === '' || lastTransferToFund?.requestedAmount === '' || lastTransferToFund?.requestedAmount === 0;

    const translate = (key: string) => t(key, { defaultValue: key });
    const selectedfundId = fundTransfer?.funds?.transferFrom[0]?.fundId;

    const removeError = (key: ErrorKey) => {
        setErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[key as keyof typeof newErrors];
            return newErrors;
        });
    };

    const updateTransferFrom = (key: string, fundVal: string) => {
        setFundTransfer(prev => {
            const updatedTransferFrom = prev.funds.transferFrom.map((item, index) => {
                if (index !== 0) return item;

                const updatedItem = { ...item, [key]: fundVal };

                if (key === FundKey.FundId) {
                    setErrors(prevErrors => {
                        const { effectiveDate } = prevErrors;
                        return effectiveDate ? { effectiveDate } : {};
                    });
                    const fundName = transferFromFunds?.find(fund => fund.value === fundVal)?.label || '';
                    return {
                        ...updatedItem,
                        fundName,
                    };
                }
                if (fundIdToFind && transferType === AmountType.Amount && Number(fundVal) > Number(availableValue)) {
                    setErrors(prev => ({
                        ...prev,
                        transferFromAmount: translate('greaterAmountError'),
                    }));
                } else {
                    if (Number(fundVal) > 0) {
                        removeError(ErrorKeys.transferFromAmount);
                    } else {
                        setErrors(prev => ({
                            ...prev,
                            transferFromAmount:
                                transferType === AmountType.Percentage ? translate('percentageError') : translate('amountError'),
                        }));
                    }
                }
                return updatedItem;
            });

            const baseUpdate = {
                ...prev,
                funds: {
                    ...prev.funds,
                    transferFrom: updatedTransferFrom,
                },
            };
            if (key === FundKey.FundId) {
                baseUpdate.funds.transferTo = [
                    {
                        fundId: '',
                        fundName: '',
                        requestedAmount: '',
                    },
                ];
            }
            return baseUpdate;
        });
    };

    const updateTransferToFund = (index: number, key: string, fundVal: string) => {
        setFundTransfer(prev => {
            const updatedTransferTo = prev.funds.transferTo.map((item, i) => {
                if (i !== index) return item;

                const updatedItem = { ...item, [key]: fundVal };

                if (key === FundKey.FundId) {
                    removeError(ErrorKeys.transferToFund);
                    const fundName = transferToFunds?.find(fund => fund.value === fundVal)?.label || '';
                    return {
                        ...updatedItem,
                        fundName,
                    };
                }

                if (index == 0 && key == FundKey.RequestedAmount) {
                    if (Number(fundVal) > 0) {
                        removeError(ErrorKeys.transferToAmount);
                    } else {
                        setErrors(prev => ({
                            ...prev,
                            transferToAmount: transferType === AmountType.Percentage ? t('percentageError') || '' : t('amountError') || '',
                        }));
                    }
                }
                return updatedItem;
            });

            return {
                ...prev,
                funds: {
                    ...prev.funds,
                    transferTo: updatedTransferTo,
                },
            };
        });
    };

    const handleDateChange = ({ target: { value: dateValue } }: ChangeEvent<HTMLInputElement>) => {
        const formattedDate = dayjs(dateValue, DATE_PICKER_FORMAT);

        if (!formattedDate.isValid()) {
            setErrors(prev => ({
                ...prev,
                effectiveDate: translate('effectiveDateError'),
            }));
            return;
        } else {
            removeError(ErrorKeys.effectiveDate);
        }

        const isReverseInitiator = formattedDate.isBefore(dayjs(today));

        setFundTransfer(oldFundTransfer => ({
            ...oldFundTransfer,
            effectiveDate: dateValue,
            reverseInitiator: isReverseInitiator,
        }));
    };

    const addTransferToRow = () => {
        setFundTransfer(prev => ({
            ...prev,
            funds: {
                ...prev.funds,
                transferTo: [
                    ...prev.funds.transferTo,
                    {
                        fundId: '',
                        fundName: '',
                        requestedAmount: '',
                    },
                ],
            },
        }));
    };

    const validateFields = () => {
        const newErrors = { ...errors };
        const formattedDate = dayjs(effectiveDate, DATE_PICKER_FORMAT);

        if (!formattedDate.isValid()) {
            newErrors.effectiveDate = translate('effectiveDateError');
        }

        if (transferType === AmountType.Percentage) {
            if (transferToValue != 100) {
                newErrors.totalPercent = translate('totalPercentError');
            } else {
                delete newErrors.totalPercent;
            }
        } else {
            if (transferToValue != fundTransferValue) {
                newErrors.totalAmount = translate('totalAmountError');
            } else {
                delete newErrors.totalAmount;
            }
        }

        const transferFrom = funds?.transferFrom?.[0];
        const transferTo = funds?.transferTo?.[0];

        if (!transferFrom?.fundId) {
            newErrors.transferFromFund = translate('fundIdRequired');
        } else {
            delete newErrors.transferFromFund;
        }

        if (!(Number(transferFrom?.requestedAmount) > 0)) {
            newErrors.transferFromAmount = transferType === AmountType.Percentage ? translate('percentageError') : translate('amountError');
        } else {
            delete newErrors.transferFromAmount;
        }

        if (Number(transferFrom?.requestedAmount) > Number(availableValue)) {
            newErrors.transferFromAmount = translate('greaterAmountError');
        }

        if (!transferTo?.fundId) {
            newErrors.transferToFund = translate('fundIdRequired');
        } else {
            delete newErrors.transferToFund;
        }

        if (!(Number(transferTo?.requestedAmount) > 0)) {
            newErrors.transferToAmount = transferType === AmountType.Percentage ? translate('percentageError') : translate('amountError');
        } else {
            delete newErrors.transferToAmount;
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleContinue = async () => {
        if (!validateFields()) {
            return;
        }

        if (!validateTransaction) {
            goToNext();
            return;
        }
        const response = await validateTransaction();

        setFundTransfer(prev => ({
            ...prev,
            validationResponse: response,
        }));
        goToNext();
    };

    const handleTransferType = (transferType: AmountType) => {
        setErrors({});
        setFundTransfer(prev => ({
            ...prev,
            transactionAmounts: {
                amountType: transferType,
            },
            funds: {
                transferFrom: [
                    {
                        fundId: '',
                        fundName: '',
                        requestedAmount: '',
                    },
                ],
                transferTo: [
                    {
                        fundId: '',
                        fundName: '',
                        requestedAmount: '',
                    },
                ],
            },
        }));
    };

    useEffect(() => {
        const fetchFundsInfo = async () => {
            setFetchingFunds(true);
            try {
                const data = await getFundDetailsViewModel(policy as any);
                const result = [...(data.electedFunds || []), ...(data.notElectedFunds || [])].map(fund => ({
                    value: fund.fundId,
                    label: fund.fundName || fund.fundId,
                }));

                setTransferToFunds(result as any);
            } catch (error) {
                browserLogError('Error fetching fund info', {
                    ...parseErrorInformation(error),
                });
            } finally {
                setFetchingFunds(false);
            }
        };

        fetchFundsInfo();
    }, [policy?.policyNumber, policy?.product?.planCode]);

    const mainCta = {
        text: t('continue'),
        onClick: handleContinue,
    };

    const secondaryCta = {
        text: t('leaveTransaction'),
        onClick: () => {
            router.push(`/policies/${product?.planCode}/${policyNumber}/policy/${ParentPage.Funds}`);
        },
    };

    const deleteTransferToFund = (index: number) => {
        setFundTransfer(prev => ({
            ...prev,
            funds: {
                ...prev.funds,
                transferTo: prev.funds.transferTo.filter((_, i) => i !== index),
            },
        }));
    };

    const noAvailableDestinationFunds =
        (!fetchingFunds && transferToFunds.length === 0) ||
        (transferToFunds.length === 1 && transferToFunds[0]?.value === transferFromFunds[0]?.value);

    const noAvailableSourceFunds = transferFromFunds.length === 0;

    return (
        <>
            <WorkflowCard
                title={title}
                subtitle={subtitle}
                footerContent={
                    <TransactionCta
                        mainCta={mainCta}
                        secondaryCta={secondaryCta}
                        stopLoading={Object.keys(errors).length != 0}
                        trackEventProps={{ type: TransactionType.FUND_TRANSFER, step: TransactionStep.Transfer }}
                    />
                }
            >
                <FieldDateSelect
                    formatOptions={{ format: '##/##/####' }}
                    className="flex max-w-[160px]"
                    label={t('dateLabel') as string}
                    value={dayjs(fundTransfer?.effectiveDate, DATE_PICKER_FORMAT).format(DATE_PICKER_FORMAT)}
                    onChange={handleDateChange}
                    size={FieldSize.Small}
                    type={FieldType.BaseActive}
                    isFutureDateDisabled={false}
                    variant={errors.effectiveDate ? FieldVariant.Error : FieldVariant.Default}
                    message={errors.effectiveDate}
                />

                <SelectSimple
                    className="flex max-w-[300px] placeholder:text-gray-400 mt-8"
                    label={t('tranferType') as string}
                    options={transferOptions}
                    onChange={value => handleTransferType(value as AmountType)}
                    size={FieldSize.Small}
                    placeholder={'Select Transfer Type'}
                    value={fundTransfer?.transactionAmounts?.amountType}
                    name="form-type"
                />

                <div className="py-10">
                    <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-gray-50 p-8 rounded-lg">
                            <div className="grid grid-cols-[2fr_1fr] gap-4 text-sm font-semibold  mb-6">
                                <div>{t('transferFrom')}</div>
                                <div>{transferType == 'AMOUNT' ? t('amount') : t('percentage')}</div>
                            </div>
                            <div className="grid grid-cols-[2fr_1fr] gap-4">
                                <div className="w-full min-w-[100px] max-w-full">
                                    <SelectSimple
                                        className="w-full placeholder:text-gray-400"
                                        label=""
                                        options={transferFromFunds}
                                        onChange={e => updateTransferFrom(FundKey.FundId, e)}
                                        size={FieldSize.Small}
                                        placeholder={
                                            noAvailableSourceFunds ? translate('noAvailableSourceFunds') : translate('fundPlaceholder')
                                        }
                                        value={fundTransfer?.funds?.transferFrom[0]?.fundId}
                                        variant={errors.transferFromFund ? FieldVariant.Error : FieldVariant.Default}
                                        message={errors.transferFromFund}
                                        name="form-type"
                                        disabled={noAvailableSourceFunds}
                                    />
                                </div>
                                <div className="w-full">
                                    <Field
                                        key={`transferfrom-${transferType}`}
                                        size={FieldSize.Small}
                                        label=""
                                        leading={transferType == AmountType.Amount ? '$' : ''}
                                        trailing={transferType == AmountType.Percentage ? '%' : ''}
                                        type={FieldType.BaseActive}
                                        value={fundTransfer?.funds?.transferFrom[0]?.requestedAmount as string}
                                        onChange={e => updateTransferFrom(FundKey.RequestedAmount, e.target.value)}
                                        formatOptions={{
                                            type: 'number',
                                            format: '',
                                            decimalPlaces: transferType == AmountType.Percentage ? 0 : 2,
                                        }}
                                        variant={errors.transferFromAmount ? FieldVariant.Error : FieldVariant.Default}
                                        message={errors.transferFromAmount || ''}
                                        {...(transferType === AmountType.Percentage && { max: DefaultValue.maxPercentage })}
                                    />

                                    {transferType == AmountType.Amount && (
                                        <div className="right-0 mt-1  text-right">
                                            {availableValue !== 0 && (
                                                <div className="text-xs text-gray-600">
                                                    {' '}
                                                    {`$${Number(availableValue).toLocaleString(undefined, {
                                                        minimumFractionDigits: 2,
                                                    })}`}{' '}
                                                    {t('available')}
                                                </div>
                                            )}
                                            <div className="font-bold mt-8 text-700">
                                                {funds.transferFrom[0]?.requestedAmount !== ''
                                                    ? `$${Number(fundTransfer.funds.transferFrom[0]?.requestedAmount || 0).toLocaleString(
                                                          undefined,
                                                          { minimumFractionDigits: DefaultValue.minFractionDigit }
                                                      )}`
                                                    : DefaultValue.nullAmount}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-50 p-8 rounded-lg">
                            <div className="grid grid-cols-[7fr_4fr] gap-4 text-sm font-semibold mb-6">
                                <div>{t('transferTo')}</div>
                                <div>{transferType == 'AMOUNT' ? t('amount') : t('percentage')}</div>
                            </div>
                            <div className="grid grid-cols-[7fr_4fr] gap-4 mb-2">
                                {fundTransfer?.funds?.transferTo.map((fund, index) => {
                                    const filteredTransferToFunds = transferToFunds.filter(
                                        option =>
                                            !funds.transferTo.some((f, i) => f.fundId === option.value && i !== index) &&
                                            option.value !== fundTransfer?.funds?.transferFrom?.[0]?.fundId
                                    );

                                    const disableCondition =
                                        !fetchingFunds && (noAvailableDestinationFunds || filteredTransferToFunds.length === 0);

                                    return (
                                        <>
                                            <div className="w-full min-w-[100px] max-w-full">
                                                <SelectSimple
                                                    className="placeholder:text-gray-400"
                                                    label=""
                                                    options={filteredTransferToFunds}
                                                    onChange={e => updateTransferToFund(index, FundKey.FundId, e)}
                                                    size={FieldSize.Small}
                                                    placeholder={
                                                        disableCondition
                                                            ? translate('noAvailableDestinationFunds')
                                                            : translate('fundPlaceholder')
                                                    }
                                                    disabled={disableCondition}
                                                    value={fund?.fundId}
                                                    name={`transfer-to-fund-${index}`}
                                                    variant={errors.transferToFund ? FieldVariant.Error : FieldVariant.Default}
                                                    trailing="%"
                                                    message={errors.transferToFund}
                                                />
                                                {index == funds.transferTo.length - 1 && (
                                                    <NavElement
                                                        aria-label={translate('addNewFund')}
                                                        onClick={!isDisabled ? addTransferToRow : undefined}
                                                        size={NavElementSize.Small}
                                                        type={NavElementType.Button}
                                                        variant={NavElementVariant.Default}
                                                        disabled={isDisabled ? true : false}
                                                        className={'mt-8'}
                                                    >
                                                        {translate('addNewFund')}
                                                    </NavElement>
                                                )}
                                            </div>
                                            <div>
                                                <div className="flex items-start gap-4 ">
                                                    <div>
                                                        <Field
                                                            key={`transferto-${transferType}-${selectedfundId}`}
                                                            size={FieldSize.Small}
                                                            label=""
                                                            leading={transferType == AmountType.Amount ? '$' : ''}
                                                            trailing={transferType == AmountType.Percentage ? '%' : ''}
                                                            type={FieldType.BaseActive}
                                                            value={fund?.requestedAmount as string}
                                                            onChange={e => {
                                                                const val = e.target.value;
                                                                updateTransferToFund(index, FundKey.RequestedAmount, val);
                                                            }}
                                                            formatOptions={{
                                                                type: 'number',
                                                                format: '',
                                                                decimalPlaces: transferType == AmountType.Percentage ? 0 : 2,
                                                            }}
                                                            variant={
                                                                errors.transferToAmount && index == 0
                                                                    ? FieldVariant.Error
                                                                    : disableCondition
                                                                    ? FieldVariant.Inactive
                                                                    : FieldVariant.Default
                                                            }
                                                            message={index == 0 ? errors.transferToAmount || '' : ''}
                                                            {...(transferType === AmountType.Percentage && {
                                                                max: DefaultValue.maxPercentage,
                                                            })}
                                                        />
                                                        {index == funds.transferTo.length - 1 && (
                                                            <div className="font-bold mt-8 text-700 right-0 text-right">
                                                                {transferType == AmountType.Amount
                                                                    ? transferToValue
                                                                        ? `$${Number(transferToValue).toLocaleString(undefined, {
                                                                              minimumFractionDigits: DefaultValue.minFractionDigit,
                                                                          })}`
                                                                        : DefaultValue.nullAmount
                                                                    : transferToValue
                                                                    ? `${transferToValue || 0}%`
                                                                    : DefaultValue.nullPercentage}
                                                            </div>
                                                        )}
                                                    </div>
                                                    {index !== 0 ? (
                                                        <IconButton
                                                            className="mt-[6px]"
                                                            aria-label={'remove fund'}
                                                            onClick={() => deleteTransferToFund(index)}
                                                        >
                                                            <TrashIcon height={20} width={20} />
                                                        </IconButton>
                                                    ) : (
                                                        <div className="w-[32px] mt-[6px]"></div>
                                                    )}
                                                </div>
                                            </div>
                                        </>
                                    );
                                })}
                            </div>
                            {transferType == AmountType.Percentage && errors.totalPercent && (
                                <AssistiveText
                                    variant={AssistiveTextVariant.Error}
                                    className="text-red-500 right-0 text-right"
                                    text={errors.totalPercent}
                                ></AssistiveText>
                            )}
                            {transferType == AmountType.Amount && errors.totalAmount && (
                                <AssistiveText
                                    variant={AssistiveTextVariant.Error}
                                    className="text-red-500 right-0 text-right"
                                    text={errors.totalAmount}
                                ></AssistiveText>
                            )}
                        </div>
                    </div>
                </div>
            </WorkflowCard>
        </>
    );
};

export default Transfer;
