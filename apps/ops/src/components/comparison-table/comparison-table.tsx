import { Address, PaymentForm } from '@zinnia/api-types/types/sor';
import { Tag, TagVariant } from '@zinnia/bloom/components';
import clsx from 'clsx';
import { useTranslation } from 'next-i18next';
import React from 'react';

import Content, { ContentVariant } from '@deps/components/content/content';
import { formatAddress } from '@deps/helpers/address.helpers';
import { formatAccountNumber } from '@deps/helpers/string.helpers';
import { DEFAULT_ERROR_STRING } from '@deps/types/constants';

import { PiiWrapper } from '../pii/PiiWrapper';

export interface ComparisonTableProps {
    comparisonData?: any;
}

interface BankData {
    paymentType?: string;
    branchName?: string;
    accountNumber?: string;
    paymentAddress?: Address;
}

interface RowData {
    header: string;
    new: string | BankData[];
    current: string | BankData[];
}

interface TableRowsProps {
    rowData: RowData[];
}

const leftCellClasses =
    'align-top border-t-2 border-l-2 border-gray-100 py-2 px-4 sm:px-6 text-left sm:w-[calc(500px/3)] md:w-fit ';
const centerCellClasses =
    'align-top border-t-2 border-l-2 border-r-2 border-gray-100 bg-gray-50 py-2 px-4 sm:px-6 h-inherit text-left gap-2 items-center max-w-[325px] sm:w-[calc(500px/3)] md:w-auto';
const rightCellClasses =
    'align-top border-t-2 border-r-2 border-gray-100 py-2 px-4 sm:px-6 text-left max-w-[325px] sm:w-[calc(500px/3)] md:w-fit';

const getRowDataDetails = (rowData?: string | BankData[]): string => {
    if (!rowData) {
        return '';
    }
    if (typeof rowData === 'string') {
        return rowData;
    } else if (
        Array.isArray(rowData) &&
        rowData.length > 0 &&
        typeof rowData[0] === 'object'
    ) {
        return rowData[0].branchName || '';
    } else {
        return '';
    }
};

const isRowDataDifferent = (newData: string, currentData: string): boolean => {
    if (typeof newData === 'string' && typeof currentData === 'string') {
        return newData !== currentData;
    }
    return false;
};

const isBankDataDifferent = (newData: any, currentData: any): boolean => {
    if (
        newData.branchName !== currentData.branchName ||
        newData.accountNumber !== currentData.accountNumber ||
        newData.paymentType !== currentData.paymentType
    ) {
        return true;
    }
    return false;
};

const TableHeaders: React.FC<TableRowsProps> = ({ rowData }) => {
    const headers = rowData[0];

    return (
        <tr>
            <th scope="col">
                <p className="sr-only">Empty table header</p>
            </th>
            <th scope="col" className={`rounded-t ${centerCellClasses}`}>
                <Content
                    variant={ContentVariant.BodySmBold}
                    details={headers.new as string}
                />
            </th>
            <th scope="col" className="px-6 py-2 text-left">
                <Content
                    variant={ContentVariant.BodySmBold}
                    details={headers.current as string}
                />
            </th>
        </tr>
    );
};

const TableRows: React.FC<TableRowsProps> = ({ rowData }) => {
    const { t } = useTranslation();
    const bodyData = rowData.filter(
        (item) =>
            item.header !== '' &&
            item.header !== 'Banking details' &&
            item.header != 'Payment method'
    );

    return (
        <>
            {bodyData.map((rowData, index) => {
                const pii = rowData.header.toLowerCase() === 'payor';
                return (
                    <tr key={index}>
                        <th
                            key={`header_${index}`}
                            className={`${leftCellClasses} ${
                                index === 0 ? 'rounded-tl' : ''
                            }`}
                            scope="row"
                        >
                            <Content
                                variant={ContentVariant.BodySm}
                                details={rowData.header}
                                className="md:whitespace-nowrap"
                            />
                        </th>
                        <td
                            key={`new_${index}`}
                            className={clsx(centerCellClasses, 'flex')}
                        >
                            <Content
                                pii={pii}
                                variant={ContentVariant.BodySmBold}
                                details={getRowDataDetails(rowData.new)}
                            />
                            {isRowDataDifferent(
                                rowData.new as string,
                                rowData.current as string
                            ) && (
                                <Tag
                                    text={t('comparisonTable.new')}
                                    variant={TagVariant.Information}
                                />
                            )}
                        </td>
                        <td
                            key={`current_${index}`}
                            className={`${rightCellClasses} ${
                                index === 0 ? 'rounded-tr' : ''
                            }`}
                        >
                            <Content
                                pii={pii}
                                variant={ContentVariant.BodySmBold}
                                details={getRowDataDetails(rowData.current)}
                            />
                        </td>
                    </tr>
                );
            })}
        </>
    );
};

const BankDetailsTableRow: React.FC<TableRowsProps> = ({ rowData }) => {
    const { t } = useTranslation();

    const bankingDetails = rowData.find(
        (item) =>
            item.header === 'Banking details' ||
            item.header === 'Payment method'
    );
    const newBankDetails = bankingDetails?.new as BankData;
    const currentBankDetails = bankingDetails?.current as BankData;

    const isDifferent =
        newBankDetails && currentBankDetails
            ? isBankDataDifferent(
                  newBankDetails as BankData[],
                  currentBankDetails as BankData[]
              )
            : false;

    return (
        <tr>
            <th
                className={`rounded-bl border-b-2 ${leftCellClasses}`}
                scope="row"
            >
                <Content
                    variant={ContentVariant.BodySm}
                    details={
                        bankingDetails?.header == 'Payment method'
                            ? (t('comparisonTable.paymentMethod') as string)
                            : (t('comparisonTable.bankDetails') as string)
                    }
                />
            </th>
            <td className={`border-2  ${centerCellClasses}`}>
                <div className="flex gap-2 items-center">
                    <div className="flex flex-col">
                        <span className="pointer-events-none uppercase">
                            <Tag
                                isSelected={false}
                                text={`${newBankDetails.paymentType}`}
                                variant={TagVariant.White}
                            />
                        </span>
                        {![
                            PaymentForm.CHECK as string,
                            PaymentForm.CREDITCARD as string,
                        ].includes(newBankDetails?.paymentType ?? '') && (
                            <>
                                <Content
                                    pii={true}
                                    variant={ContentVariant.BodySmBold}
                                    details={newBankDetails?.branchName?.toUpperCase()}
                                />
                                <Content
                                    pii={true}
                                    variant={ContentVariant.BodySm}
                                    details={`${t(
                                        'comparisonTable.checkingEndingIn'
                                    )} ${
                                        formatAccountNumber(
                                            newBankDetails?.accountNumber,
                                            true
                                        ) ?? DEFAULT_ERROR_STRING
                                    }`}
                                />
                            </>
                        )}
                        {newBankDetails?.paymentType ===
                            PaymentForm.CREDITCARD && (
                            <Content
                                pii={true}
                                variant={ContentVariant.BodySm}
                                details={`${t(
                                    'comparisonTable.creditCardEndingIn'
                                )} ${
                                    formatAccountNumber(
                                        newBankDetails?.accountNumber,
                                        true
                                    ) ?? DEFAULT_ERROR_STRING
                                }`}
                            />
                        )}
                        {newBankDetails?.paymentType === PaymentForm.CHECK && (
                            <>
                                {newBankDetails.paymentAddress ? (
                                    <div className="flex flex-col">
                                        {formatAddress(
                                            newBankDetails.paymentAddress
                                        ).map((line) => (
                                            <p key={line}>
                                                <PiiWrapper>{line}</PiiWrapper>
                                            </p>
                                        ))}
                                    </div>
                                ) : (
                                    DEFAULT_ERROR_STRING
                                )}
                            </>
                        )}
                    </div>
                    {isDifferent && (
                        <Tag
                            className="w-fit h-fit"
                            text={t('comparisonTable.new')}
                            variant={TagVariant.Information}
                        />
                    )}
                </div>
            </td>
            <td className={`rounded-br border-b-2 ${rightCellClasses}`}>
                <div className="flex flex-col">
                    <span className="pointer-events-none uppercase">
                        <Tag
                            isSelected={false}
                            text={`${currentBankDetails.paymentType}`}
                            variant={TagVariant.White}
                        />
                    </span>
                    {![
                        PaymentForm.CHECK as string,
                        PaymentForm.CREDITCARD as string,
                    ].includes(currentBankDetails?.paymentType ?? '') && (
                        <>
                            <Content
                                pii={true}
                                variant={ContentVariant.BodySmBold}
                                details={currentBankDetails?.branchName?.toUpperCase()}
                            />
                            <Content
                                pii={true}
                                variant={ContentVariant.BodySm}
                                details={`${t(
                                    'comparisonTable.checkingEndingIn'
                                )} ${
                                    formatAccountNumber(
                                        currentBankDetails?.accountNumber,
                                        true
                                    ) ?? DEFAULT_ERROR_STRING
                                }`}
                            />
                        </>
                    )}
                    {currentBankDetails?.paymentType ===
                        PaymentForm.CREDITCARD && (
                        <Content
                            pii={true}
                            variant={ContentVariant.BodySm}
                            details={`${t(
                                'comparisonTable.creditCardEndingIn'
                            )} ${
                                formatAccountNumber(
                                    currentBankDetails?.accountNumber,
                                    true
                                ) ?? DEFAULT_ERROR_STRING
                            }`}
                        />
                    )}
                    {currentBankDetails?.paymentType === PaymentForm.CHECK && (
                        <>
                            {currentBankDetails.paymentAddress ? (
                                <div className="flex flex-col">
                                    {formatAddress(
                                        currentBankDetails.paymentAddress
                                    ).map((line) => (
                                        <p key={line}>
                                            <PiiWrapper>{line}</PiiWrapper>
                                        </p>
                                    ))}
                                </div>
                            ) : (
                                DEFAULT_ERROR_STRING
                            )}
                        </>
                    )}
                </div>
            </td>
        </tr>
    );
};

const ComparisonTable = ({ comparisonData }: ComparisonTableProps) => {
    return (
        <table className="contents">
            <thead>
                <TableHeaders rowData={comparisonData} />
            </thead>
            <tbody>
                <TableRows rowData={comparisonData} />
                <BankDetailsTableRow rowData={comparisonData} />
            </tbody>
        </table>
    );
};

export default ComparisonTable;
