import { Address, AddressProps, Tag } from '@zinnia/bloom/components';
import dayjs from 'dayjs';
import { TFunction, useTranslation } from 'next-i18next';
import { ReactNode } from 'react';

import FieldData from '@deps/components/fields/field-data/field-data';
import {
    getChangedParty,
    getPeopleChangeType,
} from '@deps/components/history-event-card/history-event-card.helpers';
import { PeopleChangeType } from '@deps/components/history-event-card/types';
import Title, { TitleVariant } from '@deps/components/title/title';
import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import { numberFormatify } from '@deps/helpers/numbers.helpers';
import { formatPhoneNumberWithExtension } from '@deps/helpers/phone.helpers';
import { formatAccountNumber } from '@deps/helpers/string.helpers';
import {
    mapAccountTypeToTranslation,
    mapAddressTypeToTranslation,
    mapEmailTypeToTranslation,
    mapPhoneTypeToTranslation,
} from '@deps/helpers/translation.helpers';
import { DEFAULT_EXTENDED_DAY_DATE_FORMAT } from '@deps/types/constants';
import { DEFAULT_ERROR_STRING } from '@deps/utils/strings';
import {
    Address as PolicyAddress,
    Policy,
    Transaction,
    TransactionType,
    FeatureType,
} from '@zinnia/api-types/types/sor';

import { SideSheetTransactionProps } from '../types';
import { getNonFinancialTransactionSideSheetValues } from './side-sheet-non-financial-transactions.helpers';

const changeTable = (
    vals: { updated: ReactNode; original: ReactNode; label: string }[],
    t: TFunction
) => {
    return (
        <table className="w-full table-fixed border-separate border-spacing-0 rounded-lg border border-gray-200">
            <thead>
                <tr>
                    <th className="sr-only" scope="row"></th>
                    <th className="w-1/2 rounded-tl-lg border-b border-gray-200 bg-gray-50 px-4 py-2.5 text-left">
                        <Typography variant={TypographyVariant.BodySmBold}>
                            {t('policy.history.sidesheet.updated')}
                        </Typography>
                    </th>
                    <th className="w-1/2 border-b border-gray-200 px-4 py-2.5 text-left">
                        <Typography variant={TypographyVariant.BodySmBold}>
                            {t('policy.history.sidesheet.original')}
                        </Typography>
                    </th>
                </tr>
            </thead>
            <tbody>
                {vals.map(({ updated, original, label }, index) => (
                    <tr key={label}>
                        <th className="sr-only" scope="row">
                            {label}
                        </th>
                        <td
                            className={`w-1/2 px-4 py-2 align-bottom ${
                                index + 1 === vals.length ? 'rounded-bl-lg' : ''
                            } bg-gray-50`}
                        >
                            <Typography variant={TypographyVariant.Label}>
                                {label}
                            </Typography>
                            <Typography
                                className="text-wrap !block break-words"
                                variant={TypographyVariant.BodySm}
                            >
                                {updated}
                            </Typography>
                        </td>
                        <td className="w-1/2 px-4 py-2 align-bottom">
                            <Typography
                                className="text-wrap !block w-full break-words"
                                variant={TypographyVariant.BodySm}
                            >
                                {original}
                            </Typography>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

const getAddressChanges = (
    policy: Policy,
    transaction: Transaction,
    t: TFunction
): ReactNode => {
    if (!policy || !transaction) {
        return null;
    }

    const changeType = getPeopleChangeType(transaction);
    const party = getChangedParty(policy, transaction);
    if (!party?.addresses?.length || !changeType) {
        return null;
    }

    const newAddress = party.addresses.find(
        (a) => a.addressId === transaction.partyPolicyNewReferenceId
    );
    const oldAddress = party.addresses.find(
        (a) => a.addressId === transaction.partyPolicyChangeReferenceId
    );

    const makeAddress = (address: PolicyAddress | undefined) => {
        if (!address) {
            return DEFAULT_ERROR_STRING;
        }
        return Address({
            ...(address as AddressProps),
            addrLine1: address?.addressLine1,
            addrLine2: address?.addressLine2,
            addrLine3: address?.addressLine3,
        });
    };

    // change
    if (changeType === PeopleChangeType.Update) {
        const tableArgs = [
            {
                updated: newAddress?.addressType
                    ? mapAddressTypeToTranslation({
                          addressType: newAddress.addressType,
                          t,
                      })
                    : DEFAULT_ERROR_STRING,
                original: oldAddress?.addressType
                    ? mapAddressTypeToTranslation({
                          addressType: oldAddress?.addressType,
                          t,
                      })
                    : DEFAULT_ERROR_STRING,
                label: t('policy.history.sidesheet.type'),
            },
            {
                updated: makeAddress(newAddress),
                original: makeAddress(oldAddress),
                label: t('policy.history.sidesheet.address'),
            },
        ];
        return changeTable(tableArgs, t);
    }
    // new
    if (changeType === PeopleChangeType.Add) {
        return (
            <div className="grid w-full grid-cols-2 gap-8">
                <FieldData label={t('policy.history.sidesheet.type')}>
                    {newAddress?.addressType
                        ? mapAddressTypeToTranslation({
                              addressType: newAddress.addressType,
                              t,
                          })
                        : DEFAULT_ERROR_STRING}
                </FieldData>
                <FieldData label={t('policy.history.sidesheet.address')}>
                    {makeAddress(newAddress)}
                </FieldData>
            </div>
        );
    }

    if (changeType === PeopleChangeType.Remove) {
        return (
            <div className="grid w-full grid-cols-2 gap-8">
                <FieldData label={t('policy.history.sidesheet.address')}>
                    {makeAddress(oldAddress)}
                </FieldData>
            </div>
        );
    }
    return null;
};

const getBankAccountChanges = (
    policy: Policy,
    transaction: Transaction,
    t: TFunction
): ReactNode => {
    if (!policy || !transaction) {
        return null;
    }

    const changeType = getPeopleChangeType(transaction);
    const party = getChangedParty(policy, transaction);
    if (!party?.bankDetails?.length || !changeType) {
        return null;
    }

    const displayAccountNumber = (
        accountNumber: string | undefined
    ): string => {
        if (!accountNumber) {
            return DEFAULT_ERROR_STRING;
        }
        return t('policy.history.sidesheet.endingIn', {
            accountNumber: formatAccountNumber(accountNumber, true),
        });
    };

    const newBank = party.bankDetails.find(
        (a) => a.bankId === transaction.partyPolicyNewReferenceId
    );
    const oldBank = party.bankDetails.find(
        (a) => a.bankId === transaction.partyPolicyChangeReferenceId
    );

    // change
    if (changeType === PeopleChangeType.Update) {
        const tableArgs = [
            {
                updated:
                    newBank?.branchName?.toUpperCase() ?? DEFAULT_ERROR_STRING,
                original:
                    oldBank?.branchName?.toUpperCase() ?? DEFAULT_ERROR_STRING,
                label: t('policy.history.sidesheet.bankName'),
            },
            {
                updated: displayAccountNumber(newBank?.accountNumber),
                original: displayAccountNumber(oldBank?.accountNumber),
                label: t('policy.history.sidesheet.accountNumber'),
            },
            {
                updated: newBank?.routingNumber ?? DEFAULT_ERROR_STRING,
                original: oldBank?.routingNumber ?? DEFAULT_ERROR_STRING,
                label: t('policy.history.sidesheet.routingNumber'),
            },
            {
                updated: newBank?.accountType
                    ? mapAccountTypeToTranslation(newBank.accountType, t)
                    : DEFAULT_ERROR_STRING,
                original: oldBank?.accountType
                    ? mapAccountTypeToTranslation(oldBank.accountType, t)
                    : DEFAULT_ERROR_STRING,
                label: t('policy.history.sidesheet.accountType'),
            },
        ];
        return changeTable(tableArgs, t);
    }
    // new
    if (changeType === PeopleChangeType.Add) {
        return (
            <div className="grid w-full grid-cols-2 gap-8">
                <FieldData label={t('policy.history.sidesheet.bankName')}>
                    {newBank?.branchName?.toUpperCase() ?? DEFAULT_ERROR_STRING}
                </FieldData>
                <FieldData label={t('policy.history.sidesheet.accountType')}>
                    {newBank?.accountType
                        ? mapAccountTypeToTranslation(newBank.accountType, t)
                        : DEFAULT_ERROR_STRING}
                </FieldData>
                <FieldData label={t('policy.history.sidesheet.routingNumber')}>
                    {newBank?.routingNumber ?? DEFAULT_ERROR_STRING}
                </FieldData>
                <FieldData label={t('policy.history.sidesheet.accountNumber')}>
                    {displayAccountNumber(newBank?.accountNumber)}
                </FieldData>
            </div>
        );
    }

    if (changeType === PeopleChangeType.Remove) {
        return (
            <div className="grid w-full grid-cols-2 gap-8">
                <FieldData label={t('policy.history.sidesheet.bankName')}>
                    {oldBank?.branchName?.toUpperCase() ?? DEFAULT_ERROR_STRING}
                </FieldData>
                <FieldData label={t('policy.history.sidesheet.accountType')}>
                    {oldBank?.accountType
                        ? mapAccountTypeToTranslation(oldBank.accountType, t)
                        : DEFAULT_ERROR_STRING}
                </FieldData>
                <FieldData label={t('policy.history.sidesheet.routingNumber')}>
                    {oldBank?.routingNumber ?? DEFAULT_ERROR_STRING}
                </FieldData>
                <FieldData label={t('policy.history.sidesheet.accountNumber')}>
                    {displayAccountNumber(oldBank?.accountNumber)}
                </FieldData>
            </div>
        );
    }
    return null;
};

const getEmailChanges = (
    policy: Policy,
    transaction: Transaction,
    t: TFunction
): ReactNode => {
    if (!policy || !transaction) {
        return null;
    }

    const changeType = getPeopleChangeType(transaction);
    const party = getChangedParty(policy, transaction);
    if (!party?.emails?.length || !changeType) {
        return null;
    }

    const newEmail = party.emails.find(
        (a) => a.emailId === transaction.partyPolicyNewReferenceId
    );
    const oldEmail = party.emails.find(
        (a) => a.emailId === transaction.partyPolicyChangeReferenceId
    );

    // change
    if (changeType === PeopleChangeType.Update) {
        const tableArgs = [
            {
                updated: newEmail?.emailAddress ?? DEFAULT_ERROR_STRING,
                original: oldEmail?.emailAddress ?? DEFAULT_ERROR_STRING,
                label: t('policy.history.sidesheet.email'),
            },
        ];
        return changeTable(tableArgs, t);
    }
    // new
    if (changeType === PeopleChangeType.Add) {
        return (
            <div className="grid w-full grid-cols-2 gap-8">
                <FieldData label={t('policy.history.sidesheet.type')}>
                    {newEmail?.emailType
                        ? mapEmailTypeToTranslation(newEmail.emailType, t)
                        : DEFAULT_ERROR_STRING}
                </FieldData>
                <FieldData label={t('policy.history.sidesheet.email')}>
                    {newEmail?.emailAddress ?? DEFAULT_ERROR_STRING}
                </FieldData>
            </div>
        );
    }

    if (changeType === PeopleChangeType.Remove) {
        return (
            <div className="grid w-full grid-cols-2 gap-8">
                <FieldData label={t('policy.history.sidesheet.type')}>
                    {oldEmail?.emailType
                        ? mapEmailTypeToTranslation(oldEmail.emailType, t)
                        : DEFAULT_ERROR_STRING}
                </FieldData>
                <FieldData label={t('policy.history.sidesheet.email')}>
                    {oldEmail?.emailAddress ?? DEFAULT_ERROR_STRING}
                </FieldData>
            </div>
        );
    }
    return null;
};

const getPhoneChanges = (
    policy: Policy,
    transaction: Transaction,
    t: TFunction
): ReactNode => {
    if (!policy || !transaction) {
        return null;
    }

    const changeType = getPeopleChangeType(transaction);
    const party = getChangedParty(policy, transaction);
    if (!party?.phones?.length || !changeType) {
        return null;
    }

    const newPhone = party.phones?.find(
        (a) => a.phoneId === transaction.partyPolicyNewReferenceId
    );
    const oldPhone = party.phones?.find(
        (a) => a.phoneId === transaction.partyPolicyChangeReferenceId
    );

    // change
    if (changeType === PeopleChangeType.Update) {
        const tableArgs = [
            {
                updated: newPhone
                    ? formatPhoneNumberWithExtension(newPhone)
                    : DEFAULT_ERROR_STRING,
                original: oldPhone
                    ? formatPhoneNumberWithExtension(oldPhone)
                    : DEFAULT_ERROR_STRING,
                label: t('policy.history.sidesheet.phone'),
            },
            {
                updated: newPhone?.bestTime ?? DEFAULT_ERROR_STRING,
                original: oldPhone?.bestTime ?? DEFAULT_ERROR_STRING,
                label: t('policy.history.sidesheet.bestTime'),
            },
            {
                updated: newPhone?.timezone ?? DEFAULT_ERROR_STRING,
                original: oldPhone?.timezone ?? DEFAULT_ERROR_STRING,
                label: t('policy.history.sidesheet.timeZone'),
            },
        ];
        return changeTable(tableArgs, t);
    }
    // new
    if (changeType === PeopleChangeType.Add) {
        return (
            <div className="grid w-full grid-cols-2 gap-8">
                <FieldData label={t('policy.history.sidesheet.type')}>
                    {newPhone?.phoneType
                        ? mapPhoneTypeToTranslation(newPhone.phoneType, t)
                        : DEFAULT_ERROR_STRING}
                </FieldData>
                <FieldData label={t('policy.history.sidesheet.number')}>
                    {newPhone
                        ? formatPhoneNumberWithExtension(newPhone)
                        : DEFAULT_ERROR_STRING}
                </FieldData>
                <FieldData
                    label={t('policy.history.sidesheet.bestTimeToContact')}
                >
                    {newPhone?.bestTime ?? DEFAULT_ERROR_STRING}
                </FieldData>
                <FieldData label={t('policy.history.sidesheet.timeZone')}>
                    {newPhone?.timezone ?? DEFAULT_ERROR_STRING}
                </FieldData>
            </div>
        );
    }

    if (changeType === PeopleChangeType.Remove) {
        return (
            <div className="grid w-full grid-cols-2 gap-8">
                <FieldData label={t('policy.history.sidesheet.number')}>
                    {oldPhone
                        ? formatPhoneNumberWithExtension(oldPhone)
                        : DEFAULT_ERROR_STRING}
                </FieldData>
            </div>
        );
    }
    return null;
};

const getPolicyLapse = (
    policy: Policy,
    transaction: Transaction,
    t: TFunction
): ReactNode => {
    const { policyFeatures } = policy;
    const reinstatement = policyFeatures?.find(
        (pf) => pf.featureType === FeatureType.REINSTATEMENT
    );
    const pendingLapse = policyFeatures?.find(
        (pf) => pf.featureType === FeatureType.LAPSEASSESSMENT
    );

    const gracePeriodText = t(
        'policy.history.sidesheet.lapseGracePeriodValue',
        {
            startDate: dayjs(pendingLapse?.startDate).format(
                DEFAULT_EXTENDED_DAY_DATE_FORMAT
            ),
            endDate: dayjs(pendingLapse?.endDate).format(
                DEFAULT_EXTENDED_DAY_DATE_FORMAT
            ),
        }
    );

    let reinstatementPeriodText;

    switch (Number(reinstatement?.period)) {
        case 0:
            reinstatementPeriodText = 'None';
            break;
        case 1:
            reinstatementPeriodText = t('common:temporal.oneYear');
            break;
        default:
            reinstatementPeriodText = t('common:temporal.nYears', {
                n: reinstatement?.period,
            });
            break;
    }

    return (
        <div className="grid w-full grid-cols-2 gap-8">
            <FieldData
                label={t('policy.history.sidesheet.lapseProcessDate')}
                tooltipTitle={t('policy.history.sidesheet.lapseProcessDate')}
                tooltipBody={t(
                    'policy.history.sidesheet.lapseProcessDateTooltip'
                )}
            >
                {dayjs(transaction.processDate).format(
                    DEFAULT_EXTENDED_DAY_DATE_FORMAT
                ) || DEFAULT_ERROR_STRING}
            </FieldData>

            <FieldData
                label={t('policy.history.sidesheet.lapseDate')}
                tooltipTitle={t('policy.history.sidesheet.lapseDate')}
                tooltipBody={t('policy.history.sidesheet.lapseDateTooltip')}
            >
                {dayjs(transaction.effectiveDate).format(
                    DEFAULT_EXTENDED_DAY_DATE_FORMAT
                ) || DEFAULT_ERROR_STRING}
            </FieldData>
            <FieldData
                label={t('policy.history.sidesheet.lapseGracePeriod')}
                tooltipTitle={t('policy.history.sidesheet.lapseGracePeriod')}
                tooltipBody={t(
                    'policy.history.sidesheet.lapseGracePeriodTooltip'
                )}
            >
                {gracePeriodText || DEFAULT_ERROR_STRING}
            </FieldData>
            <FieldData
                label={t('policy.history.sidesheet.lapseGracePeriodMinPayment')}
                tooltipTitle={t(
                    'policy.history.sidesheet.lapseGracePeriodMinPayment'
                )}
                tooltipBody={t(
                    'policy.history.sidesheet.lapseGracePeriodMinPaymentTooltip'
                )}
            >
                {numberFormatify(
                    pendingLapse?.totalMinimumRequiredAmount ||
                        DEFAULT_ERROR_STRING
                )}
            </FieldData>
            <FieldData
                label={t('policy.history.sidesheet.lapseReinstatementPeriod')}
                tooltipTitle={t(
                    'policy.history.sidesheet.lapseReinstatementPeriod'
                )}
                tooltipBody={t(
                    'policy.history.sidesheet.lapseReinstatementPeriodTooltip'
                )}
            >
                {reinstatementPeriodText || DEFAULT_ERROR_STRING}
            </FieldData>
        </div>
    );
};

const getChanges = (
    policy: Policy,
    transaction: Transaction,
    t: TFunction
): ReactNode => {
    if (!policy || !transaction?.transactionType) {
        return null;
    }

    switch (transaction.transactionType) {
        case TransactionType.ADDRESS_CHANGE:
            return getAddressChanges(policy, transaction, t);
        case TransactionType.BANK_ACCOUNT_CHANGE:
            return getBankAccountChanges(policy, transaction, t);
        case TransactionType.EMAIL_CHANGE:
            return getEmailChanges(policy, transaction, t);
        case TransactionType.PHONE_NUMBER_CHANGE:
            return getPhoneChanges(policy, transaction, t);
        case TransactionType.LAPSE:
            return getPolicyLapse(policy, transaction, t);
        default:
            return null;
    }
};

const SideSheetNonFinancialTransaction = ({
    policy,
    transaction,
}: SideSheetTransactionProps) => {
    const { t } = useTranslation();
    const { effectiveDate, name, roleTags } =
        getNonFinancialTransactionSideSheetValues(policy, transaction, t);

    return (
        <div className="p-8">
            <div className="flex flex-col gap-8">
                {!TransactionType.LAPSE && (
                    <>
                        <FieldData
                            label={t('policy.history.sidesheet.effectiveDate')}
                        >
                            {effectiveDate}
                        </FieldData>
                        <div className="flex flex-col gap-1">
                            <Title
                                variant={TitleVariant.SubTitleAlt}
                                className="text-start leading-[27px]"
                            >
                                {name}
                            </Title>
                            <div className="flex flex-wrap gap-1">
                                {roleTags?.map((tag) => (
                                    <Tag key={tag} text={tag} />
                                ))}
                            </div>
                        </div>
                    </>
                )}
                {getChanges(policy, transaction, t)}
            </div>
        </div>
    );
};

export default SideSheetNonFinancialTransaction;
