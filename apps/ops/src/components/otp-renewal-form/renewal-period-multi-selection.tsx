import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { useContext, useEffect, useState } from 'react';
import xss from 'xss';

import Field, {
    FieldSize,
    FieldType,
    FieldVariant,
} from '@deps/components/fields/field';
import SelectSimple from '@deps/components/select/select';
import { RenewalFormDataContext } from '@deps/contexts/OtpRenewalFormContext';
import {
    TransactionOption,
    TransactionTypes,
} from '@deps/helpers/transaction-options.helpers';
import { TargetFundAllocation } from '@deps/models/case/task';
import { ERROR_CODES } from '@deps/pages/create-case/error';
import { getProductFunds } from '@deps/queries/api/integration';
import { browserLogInfo } from '@deps/utils/browser-logging';
import { parseErrorInformation } from '@deps/utils/server-logging';

import { Loader } from '../page-loader';
import Typography, { TypographyVariant } from '../typography/typography';

interface RenewalPeriodMultiSectionProps {
    options: TransactionOption[];
    isFormStateReadOnly: boolean;
    planCode: string;
}

export default function RenewalPeriodMultiSection({
    options,
    isFormStateReadOnly,
    planCode,
}: RenewalPeriodMultiSectionProps) {
    const { setSubsequentTargetFunds, transOption, formErrors, document, subsequentTargetFunds } =
        useContext(RenewalFormDataContext);
    const { t } = useTranslation(undefined, {
        keyPrefix: 'caseRenewal.request',
    });
    const router = useRouter();

    const [fundAllocations, setFundAllocations] = useState<
        TargetFundAllocation[]
    >(subsequentTargetFunds || []);
    const [loader, setLoader] = useState(false);
    const [transOptions, setTransOptions] = useState<TransactionTypes>(
        (transOption || TransactionTypes.Percentage) as TransactionTypes
    );
    const [selectedTransaction, setSelectedTransaction] =
        useState<TransactionOption>({} as TransactionOption);

    useEffect(() => {
        const getFundsList = async () => {
            try {
                setLoader(true);
                setFundAllocations([]);

                const fundsList = await getProductFunds({
                    contractNumber: document?.contract,
                    clientCode: document?.processCompanyCode,
                    planCode: planCode,
                });

                if (!fundsList?.length) {
                    throw new Error('No funds returned from getProductFunds');
                }
                subsequentTargetFunds
                // filtering out duplicate funds coming back from the funds list
                const uniqueFunds = fundsList.map((fund) => {
                    return {
                        fundName: fund.fundName,
                        fundCode: fund.fundCode,
                        sourceFundName: fund.sourceFundName,
                        divisionCode: fund.divisionCode,
                        value: null,
                    };
                });
                browserLogInfo(
                    'RenewalPeriodMultiSelection::Fund allocations retrieved and set from API',
                    {
                        contractNumber: document?.contract,
                        clientCode: document?.processCompanyCode,
                        planCode: planCode,
                    }
                );
                setFundAllocations(uniqueFunds);

                setLoader(false);
            } catch (e) {
                browserLogInfo(
                    'RenewalPeriodMultiSelection::Error retrieving funds list',
                    {
                        ...parseErrorInformation(e)
                    }
                );
                setLoader(false);
                router.push(
                    `/create-case/error?errorCode=${ERROR_CODES.RENEWAL_FORM_FUNDS_LIST}`
                );
            }
        };
        const subsequentTargetFundsCount = subsequentTargetFunds?.length || 0;
        if (subsequentTargetFundsCount === 0) {
              browserLogInfo('Set fund allocation with received one', {
                contractNumber: document?.contract,
                clientCode: document?.processCompanyCode,
                planCode: planCode,
                subsequentTargetFundsCount: subsequentTargetFundsCount,
                function: 'RenewalPeriodMultiSelection',
            });
            getFundsList();
        }
    }, []);

    const setFundAllocation = (fundName: string, val: string) => {
        setFundAllocations((allocations) => {
            return allocations.map((allocation) => {
                if (allocation.fundName === fundName) {
                    return {
                        ...allocation,
                        value: val || null,
                    };
                }
                return allocation;
            });
        });
    };

    useEffect(() => {
        const funds = fundAllocations.filter(
            (fund) => fund.value !== '' && fund.value !== null
        );
        setSubsequentTargetFunds(funds);
    }, [fundAllocations]);

    useEffect(() => {
        const selectedOption =
            options.find((item) => item.value === transOptions) ||
            ({} as TransactionOption);
        setSelectedTransaction(selectedOption);
    }, [transOptions]);

    const validationError = formErrors?.period
        ? 'border-2 border-solid border-semantic-error p-2'
        : 'p2';
    return (
        <>
            <Typography
                variant={TypographyVariant.H3}
                className="mb-2 flex flex-wrap gap-5"
            >
                {t(`period`)}
            </Typography>

            <SelectSimple
                label={t(`transactionOption`) as string}
                className="my-4 w-full max-w-[200px]"
                options={options}
                onChange={(val) => setTransOptions(val as TransactionTypes)}
                size={FieldSize.Small}
                value={transOptions}
                disabled={isFormStateReadOnly}
            />
            {loader && <Loader />}
            <div
                className={`flex flex-col gap-x-12 sm:grid sm:grid-cols-1 md:grid md:grid-cols-2 lg:grid lg:grid-cols-2 ${validationError}`}
            >
                {fundAllocations.map((fundAlloc, index) => (
                    <div key={index} className="my-2 grid grid-cols-2 gap-4">
                        <Typography variant={TypographyVariant.LabelMd}>
                            {fundAlloc?.sourceFundName || fundAlloc?.fundName}
                        </Typography>

                        <Field
                            aria-labelledby={`fund-code-${fundAlloc?.fundCode}`}
                            onChange={(e) => {
                                setFundAllocation(
                                    fundAlloc.fundName,
                                    xss(e?.target?.value)
                                );
                            }}
                            value={fundAlloc?.value || ''}
                            size={FieldSize.Small}
                            trailing={
                                selectedTransaction?.trailing && (
                                    <div>{selectedTransaction?.trailing}</div>
                                )
                            }
                            leading={
                                selectedTransaction?.leading && (
                                    <div>{selectedTransaction?.leading}</div>
                                )
                            }
                            type={FieldType.BaseActive}
                            variant={
                                isFormStateReadOnly
                                    ? FieldVariant.Inactive
                                    : FieldVariant.Default
                            }
                        />
                    </div>
                ))}
            </div>
        </>
    );
}
