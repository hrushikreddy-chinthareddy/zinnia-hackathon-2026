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
import { AmountType } from '@deps/models/funds/enums';
import { Policy } from '@deps/models/policy/sor-policy';
import { TransactionResponse } from '@deps/queries/api/bpm';
import { ReactComponent as TrashIcon } from '@deps/styles/elements/icons/icons_outlined/trash.svg';
import { TransactionStep } from '@deps/types/segment-analytics';
import { browserLogError } from '@deps/utils/browser-logging';
import { parseErrorInformation } from '@deps/utils/server-logging';

interface TransferProps {
    policy: Policy;
    validateTransaction?: () => Promise<TransactionResponse>;
    title: string;
    subtitle?: string;
}

type Errors = {
    transferFromFund?: string;
    transferFromAmount?: string;
    transferToFund?: string;
    transferToAmount?: string;
    totalAmount?: string;
    totalPercent?: string;
    effectiveDate?: string;
};

type FundOption = {
    value: string;
    label: string;
};

const Transfer = ({ policy, validateTransaction, title, subtitle }: TransferProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, { keyPrefix: 'workflows.transferStep' });

    const { goToNext } = useWorkflow();
    const [errors, setErrors] = useState<Errors>({});

    const today = new Date();

    const { fundTransfer, setFundTransfer } = useFundTransfer();

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

    const updateTransferFrom = (key: string, fundVal: string) => {
        setFundTransfer(prev => {
            const updatedTransferFrom = prev.funds.transferFrom.map((item, index) => {
                if (index !== 0) return item;

                const updatedItem = { ...item, [key]: fundVal };

                if (key === 'fundId') {
                    delete errors.transferFromFund;
                    const fundName = transferFromFunds?.find(fund => fund.value === fundVal)?.label || '';
                    return {
                        ...updatedItem,
                        fundName,
                    };
                }
                if (fundIdToFind && transferType === 'AMOUNT' && Number(fundVal) > Number(availableValue)) {
                    setErrors(prev => ({
                        ...prev,
                        transferFromAmount: translate('greaterAmountError'),
                    }));
                } else {
                    if (Number(fundVal) > 0) {
                        delete errors.transferFromAmount;
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

            return {
                ...prev,
                funds: {
                    ...prev.funds,
                    transferFrom: updatedTransferFrom,
                },
            };
        });
    };

    const updateTransferToFund = (index: number, key: string, fundVal: string) => {
        setFundTransfer(prev => {
            const updatedTransferTo = prev.funds.transferTo.map((item, i) => {
                if (i !== index) return item;

                const updatedItem = { ...item, [key]: fundVal };

                if (key === 'fundId') {
                    delete errors.transferToFund;
                    const fundName = transferToFunds?.find(fund => fund.value === fundVal)?.label || '';
                    return {
                        ...updatedItem,
                        fundName,
                    };
                }

                if (index == 0 && key == 'requestedAmount') {
                    if (Number(fundVal) > 0) {
                        delete errors.transferToAmount;
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
                effectiveDate: 'Effective date is required.',
            }));
            return;
        } else {
            delete errors.effectiveDate;
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

        if (!transferFrom?.requestedAmount) {
            newErrors.transferFromAmount = transferType === AmountType.Percentage ? translate('percentageError') : translate('amountError');
        } else {
            delete newErrors.transferFromAmount;
        }

        if (!transferTo?.fundId) {
            newErrors.transferToFund = translate('fundIdRequired');
        } else {
            delete newErrors.transferToFund;
        }

        if (!transferTo?.requestedAmount) {
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
                    className="flex max-w-[155px]"
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
                                        onChange={e => updateTransferFrom('fundId', e)}
                                        size={FieldSize.Small}
                                        placeholder={translate('fundPlaceholder')}
                                        value={fundTransfer?.funds?.transferFrom[0]?.fundId}
                                        variant={errors.transferFromFund ? FieldVariant.Error : FieldVariant.Default}
                                        message={errors.transferFromFund}
                                        name="form-type"
                                    />
                                </div>
                                <div className="w-full">
                                    <Field
                                        key={`transferfrom-${transferType}`}
                                        size={FieldSize.Small}
                                        label=""
                                        leading={transferType == 'AMOUNT' ? '$' : ''}
                                        trailing={transferType == AmountType.Percentage ? '%' : ''}
                                        type={FieldType.BaseActive}
                                        value={fundTransfer?.funds?.transferFrom[0]?.requestedAmount as string}
                                        onChange={e => updateTransferFrom('requestedAmount', e.target.value)}
                                        formatOptions={{
                                            type: 'number',
                                            format: '',
                                            decimalPlaces: transferType == AmountType.Percentage ? 0 : 2,
                                        }}
                                        variant={errors.transferFromAmount ? FieldVariant.Error : FieldVariant.Default}
                                        message={errors.transferFromAmount}
                                        {...(transferType === AmountType.Percentage && { max: 100 })}
                                    />

                                    {transferType == 'AMOUNT' && (
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
                                                          { minimumFractionDigits: 2 }
                                                      )}`
                                                    : '$--.--'}
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
                                {fundTransfer?.funds?.transferTo.map((fund, index) => (
                                    <>
                                        <div className="w-full min-w-[100px] max-w-full">
                                            <SelectSimple
                                                className="placeholder:text-gray-400"
                                                label=""
                                                options={transferToFunds.filter(
                                                    option => !funds.transferTo.some((f, i) => f.fundId === option.value && i !== index)
                                                )}
                                                onChange={e => updateTransferToFund(index, 'fundId', e)}
                                                size={FieldSize.Small}
                                                placeholder={translate('fundPlaceholder')}
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
                                                        key={`transferto-${transferType}`}
                                                        size={FieldSize.Small}
                                                        label=""
                                                        leading={transferType == 'AMOUNT' ? '$' : ''}
                                                        trailing={transferType == AmountType.Percentage ? '%' : ''}
                                                        type={FieldType.BaseActive}
                                                        value={fund?.requestedAmount as string}
                                                        onChange={e => {
                                                            const val = e.target.value;
                                                            updateTransferToFund(index, 'requestedAmount', val);
                                                        }}
                                                        formatOptions={{
                                                            type: 'number',
                                                            format: '',
                                                            decimalPlaces: transferType == AmountType.Percentage ? 0 : 2,
                                                        }}
                                                        variant={
                                                            errors.transferToAmount && index == 0
                                                                ? FieldVariant.Error
                                                                : FieldVariant.Default
                                                        }
                                                        message={index == 0 ? errors.transferToAmount || '' : ''}
                                                        {...(transferType === AmountType.Percentage && { max: 100 })}
                                                    />
                                                    {index == funds.transferTo.length - 1 && (
                                                        <div className="font-bold mt-8 text-700 right-0 text-right">
                                                            {transferType == 'AMOUNT'
                                                                ? transferToValue
                                                                    ? `$${Number(transferToValue).toLocaleString(undefined, {
                                                                          minimumFractionDigits: 2,
                                                                      })}`
                                                                    : '$--.--'
                                                                : transferToValue
                                                                ? `${transferToValue || 0}%`
                                                                : '--%'}
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
                                ))}
                            </div>
                            {transferType == AmountType.Percentage && errors.totalPercent && (
                                <AssistiveText
                                    variant={AssistiveTextVariant.Error}
                                    className="text-red-500 right-0 text-right"
                                    text={errors.totalPercent}
                                ></AssistiveText>
                            )}
                            {transferType == 'AMOUNT' && errors.totalAmount && (
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
