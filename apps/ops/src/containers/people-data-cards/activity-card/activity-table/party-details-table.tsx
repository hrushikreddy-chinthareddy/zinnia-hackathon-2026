import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableHeaderCell,
    TableRow,
    TableStickyColumn,
} from '@zinnia/bloom/components';
import clsx from 'clsx';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { PiiWrapper } from '@deps/components/pii/PiiWrapper';
import { BankAccountWithPending } from '@deps/components/side-sheet/side-sheet-transaction/non-financial-transactions/types';
import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import { convertToChipText } from '@deps/containers/people-sub-page/people-sub-page.helpers';
import { formatAddress } from '@deps/helpers/address.helpers';
import { isEndDated } from '@deps/helpers/date.helpers';
import { getBankAccountType } from '@deps/helpers/party-info-helpers';
import AgentParty from '@deps/helpers/policy-sor/AgentParty';
import { PolicyParty } from '@deps/helpers/policy-sor/Parties';
import {
    convertKebabedDateString,
    formatAccountNumber,
    formatCardExpirationDate,
    formatPhone,
    toTitleCase,
} from '@deps/helpers/string.helpers';
import { mapAddressTypeToTranslation } from '@deps/helpers/translation.helpers';
import { Party } from '@deps/models/policy-sor-touchups/Party';
import { PeopleActivityTabValues } from '@deps/types/constants';
import { DEFAULT_ERROR_STRING } from '@deps/utils/strings';
import {
    AccountType,
    PartyRole,
    PolicyPartyRoles,
} from '@zinnia/api-types/types/sor';

import styles from '../activity-card.module.css';

export type TabKeys =
    | 'roles'
    | 'identification'
    | 'phone'
    | 'email'
    | 'address'
    | 'bankAccounts';

interface Column {
    key: string;
    label: string;
}

const COMMON_DATES: Column[] = [
    { key: 'effectiveDate', label: 'allFields.dateAdded' },
    { key: 'endDate', label: 'allFields.dateRemoved' },
];

const COMMON_ID: Column[] = [{ key: 'id', label: 'allFields.id' }];

const COMMON_TYPE: Column[] = [{ key: 'type', label: 'allFields.type' }];

const TAB_COLUMNS: Record<TabKeys, Column[]> = {
    roles: [
        { key: 'role', label: 'allFields.role' },
        { key: 'relationship', label: 'allFields.relationship' },
        ...COMMON_DATES,
    ],
    identification: [
        { key: 'idType', label: 'allFields.idType' },
        { key: 'idData', label: 'allFields.idData' },
        ...COMMON_DATES,
        ...COMMON_ID,
    ],
    phone: [
        ...COMMON_TYPE,
        { key: 'phone', label: 'allFields.phoneNumber' },
        ...COMMON_DATES,
        ...COMMON_ID,
    ],
    email: [
        ...COMMON_TYPE,
        { key: 'email', label: 'allFields.email' },
        ...COMMON_DATES,
        ...COMMON_ID,
    ],
    address: [
        ...COMMON_TYPE,
        { key: 'address', label: 'allFields.addressId' },
        ...COMMON_DATES,
        ...COMMON_ID,
    ],
    bankAccounts: [
        { key: 'name', label: 'allFields.nameOnAccount' },
        { key: 'type', label: 'allFields.accountType' },
        { key: 'number', label: 'allFields.accountNumber' },
        { key: 'routing', label: 'allFields.routingNumber' },
        { key: 'bank', label: 'Bank name' },
        ...COMMON_DATES,
        ...COMMON_ID,
    ],
};

interface PartyDetailsTableProps {
    tabVal: TabKeys;
    selectedPolicyPartyRoles?: PolicyPartyRoles[];
    newSelectedPolicyParty?: PolicyParty | AgentParty;
    selectedPolicyParty?: Party;
    onlyShowInactive: boolean;
}

const filterByInactive = <T extends { endDate?: string | null }>(
    items: T[] | undefined = [],
    onlyShowInactive: boolean
): T[] => {
    if (!onlyShowInactive) return items;
    return items.filter((item) => {
        return isEndDated(item.endDate);
    });
};

const renderEmptyRow = (message: string, colSpan: number) => (
    <TableRow className="disabled-tr w-full">
        <TableCell className="!text-left md:!text-center" colSpan={colSpan}>
            {message}
        </TableCell>
    </TableRow>
);

const renderTableRows = (
    activeTab: TabKeys,
    {
        selectedPolicyPartyRoles,
        newSelectedPolicyParty,
        selectedPolicyParty,
        isBeneficiary,
        onlyShowInactive,
        t,
    }: {
        selectedPolicyPartyRoles?: PolicyPartyRoles[];
        newSelectedPolicyParty?: PolicyParty | AgentParty;
        selectedPolicyParty?: Party;
        isBeneficiary?: boolean;
        onlyShowInactive: boolean;
        t: any;
    }
) => {
    const { identifications } = newSelectedPolicyParty ?? {};
    const { phones, emails, addresses, bankDetails } =
        selectedPolicyParty ?? {};
    const validPhones = phones?.filter((phone) => phone?.dialNumber !== null);
    const columns = TAB_COLUMNS[activeTab];

    switch (activeTab) {
        case PeopleActivityTabValues.roles: {
            const filteredRoles = filterByInactive(
                selectedPolicyPartyRoles,
                onlyShowInactive
            );

            return filteredRoles.length
                ? filteredRoles.map((roleObject) => (
                      <TableRow key={roleObject?.partyRoleId}>
                          <TableCell>
                              {convertToChipText(
                                  roleObject?.partyRole?.toLowerCase(),
                                  t
                              )}
                          </TableCell>
                          <TableCell>
                              {isBeneficiary
                                  ? toTitleCase(
                                        roleObject?.relationshipToInsured
                                    )
                                  : DEFAULT_ERROR_STRING}
                          </TableCell>
                          <TableCell>
                              {convertKebabedDateString(roleObject?.startDate)}
                          </TableCell>
                          <TableCell>
                              {convertKebabedDateString(roleObject?.endDate)}
                          </TableCell>
                      </TableRow>
                  ))
                : renderEmptyRow(t('allFields.noRoles'), columns.length);
        }

        case PeopleActivityTabValues.identification: {
            const filteredIdentifications = filterByInactive(
                identifications,
                onlyShowInactive
            );

            return filteredIdentifications.length
                ? filteredIdentifications.map((identification, idx) => (
                      <TableRow key={idx}>
                          <TableCell>
                              {t(`enums.${identification?.identificationType}`)}
                          </TableCell>
                          <TableCell>
                              <PiiWrapper>
                                  {identification?.identificationValue}
                              </PiiWrapper>
                          </TableCell>
                          <TableCell>
                              {convertKebabedDateString(
                                  identification?.startDate
                              )}
                          </TableCell>
                          <TableCell>
                              {convertKebabedDateString(
                                  identification?.endDate
                              )}
                          </TableCell>
                          <TableCell>
                              {identification?.identificationId}
                          </TableCell>
                      </TableRow>
                  ))
                : renderEmptyRow(
                      t('allFields.noIdentificationSaved'),
                      columns.length
                  );
        }

        case PeopleActivityTabValues.phone: {
            const filteredPhones = filterByInactive(
                validPhones,
                onlyShowInactive
            );

            return filteredPhones.length
                ? filteredPhones.map((phone, idx) => (
                      <TableRow key={idx}>
                          <TableCell>
                              {phone?.phoneType
                                  ? t(
                                        `allFields.${phone.phoneType.toLowerCase()}`
                                    )
                                  : t('allFields.homePhone')}
                          </TableCell>
                          <TableCell>
                              <PiiWrapper>{formatPhone(phone)}</PiiWrapper>
                          </TableCell>
                          <TableCell>
                              {convertKebabedDateString(phone?.startDate)}
                          </TableCell>
                          <TableCell>
                              {convertKebabedDateString(phone?.endDate)}
                          </TableCell>
                          <TableCell>{phone?.phoneId}</TableCell>
                      </TableRow>
                  ))
                : renderEmptyRow(
                      t('allFields.noContactNumbersSaved'),
                      columns.length
                  );
        }

        case PeopleActivityTabValues.email: {
            const filteredEmails = filterByInactive(emails, onlyShowInactive);

            return filteredEmails.length
                ? filteredEmails.map((email, idx) => (
                      <TableRow key={idx}>
                          <TableCell>
                              {t(
                                  `allFields.${email?.emailType?.toLowerCase()}`
                              )}
                          </TableCell>
                          <TableCell>
                              <PiiWrapper>
                                  {email?.emailAddress?.toLowerCase()}
                              </PiiWrapper>
                          </TableCell>
                          <TableCell>
                              {convertKebabedDateString(email?.startDate)}
                          </TableCell>
                          <TableCell>
                              {convertKebabedDateString(email?.endDate)}
                          </TableCell>
                          <TableCell>{email?.emailId}</TableCell>
                      </TableRow>
                  ))
                : renderEmptyRow(t('allFields.noEmailSaved'), columns.length);
        }

        case PeopleActivityTabValues.address: {
            const filteredAddresses = filterByInactive(
                addresses,
                onlyShowInactive
            );

            return filteredAddresses.length
                ? filteredAddresses.map((address, idx) => {
                      const { addressType, startDate, endDate } = address;

                      return (
                          <TableRow key={idx}>
                              <TableCell>
                                  {t(
                                      mapAddressTypeToTranslation({
                                          addressType,
                                          t,
                                      })
                                  )}
                              </TableCell>
                              <TableCell>
                                  <PiiWrapper>
                                      {formatAddress(address).join(', ')}
                                  </PiiWrapper>
                              </TableCell>
                              <TableCell>
                                  {convertKebabedDateString(startDate)}
                              </TableCell>
                              <TableCell>
                                  {convertKebabedDateString(endDate)}
                              </TableCell>
                              <TableCell>{address?.addressId}</TableCell>
                          </TableRow>
                      );
                  })
                : renderEmptyRow(t('allFields.noAddressSaved'), columns.length);
        }

        case PeopleActivityTabValues.bankAccounts: {
            const filteredBankDetails = filterByInactive(
                bankDetails,
                onlyShowInactive
            );

            return filteredBankDetails.length
                ? filteredBankDetails.map((bankDetail, idx) => {
                      const {
                          accountType,
                          accountNumber,
                          branchName,
                          internationalBankAccountNumber,
                          nameOnAccount,
                          routingNumber,
                          endDate,
                          startDate,
                      } = bankDetail as BankAccountWithPending;

                      const isBankAccount =
                          accountType !== AccountType.CREDITCARD &&
                          accountType !== AccountType.DEBITCARD;

                      return (
                          <TableRow key={idx}>
                              <TableCell>
                                  <PiiWrapper>
                                      {toTitleCase(nameOnAccount)}
                                  </PiiWrapper>
                              </TableCell>
                              <TableCell>
                                  <PiiWrapper>
                                      {getBankAccountType(accountType, t)}
                                  </PiiWrapper>
                              </TableCell>
                              <TableCell>
                                  <PiiWrapper>
                                      {t('people.card.bank.general.endingIn', {
                                          accountNumber:
                                              formatAccountNumber(
                                                  internationalBankAccountNumber ??
                                                      accountNumber,
                                                  true
                                              ) ?? DEFAULT_ERROR_STRING,
                                      })}
                                  </PiiWrapper>
                              </TableCell>
                              <TableCell>
                                  <PiiWrapper>
                                      {isBankAccount
                                          ? routingNumber ??
                                            DEFAULT_ERROR_STRING
                                          : formatCardExpirationDate(endDate) ??
                                            DEFAULT_ERROR_STRING}
                                  </PiiWrapper>
                              </TableCell>
                              <TableCell>
                                  <PiiWrapper>
                                      {toTitleCase(
                                          branchName ?? DEFAULT_ERROR_STRING
                                      )}
                                  </PiiWrapper>
                              </TableCell>
                              <TableCell>
                                  <PiiWrapper>
                                      {convertKebabedDateString(startDate)}
                                  </PiiWrapper>
                              </TableCell>
                              <TableCell>
                                  <PiiWrapper>
                                      {convertKebabedDateString(endDate)}
                                  </PiiWrapper>
                              </TableCell>
                              <TableCell>{bankDetail?.bankId}</TableCell>
                          </TableRow>
                      );
                  })
                : renderEmptyRow(
                      t('allFields.noBankingDetailsSaved'),
                      columns.length
                  );
        }

        default:
            return null;
    }
};

const PartyDetailsTable = ({
    tabVal,
    selectedPolicyPartyRoles,
    newSelectedPolicyParty,
    selectedPolicyParty,
    onlyShowInactive,
}: PartyDetailsTableProps) => {
    const { t } = useTranslation();
    const [activeTab] = useState(tabVal);
    const columns = TAB_COLUMNS[activeTab];
    const selectedPartyRoles = selectedPolicyPartyRoles?.map((roleObject) => {
        return roleObject.partyRole?.toLowerCase();
    });
    const BENEFICIARY_ROLES = [
        PartyRole.PRIMARYBENEFICIARY.toLowerCase(),
        PartyRole.CONTINGENTBENEFICIARY.toLowerCase(),
    ];
    const isBeneficiary = selectedPartyRoles?.some(
        (role) => role && BENEFICIARY_ROLES.includes(role.toLowerCase())
    );

    const tableClass = (() => {
        switch (activeTab) {
            case PeopleActivityTabValues.roles:
                return styles.rolesTab;
            case PeopleActivityTabValues.address:
            case PeopleActivityTabValues.phone:
            case PeopleActivityTabValues.email:
                return styles.phoneTab;
            case PeopleActivityTabValues.identification:
                return styles.identificationTab;
            case PeopleActivityTabValues.bankAccounts:
            default:
                return styles.defaultTab;
        }
    })();

    return (
        <Table
            className={clsx(styles.table, tableClass)}
            stickyColumn={TableStickyColumn.End}
        >
            <TableHeader className="typography-content-body-sm-bold">
                <TableRow>
                    {columns?.map((column) => (
                        <TableHeaderCell
                            key={column.key}
                            className={styles.headerCell}
                        >
                            <Typography
                                variant={TypographyVariant.BodySmBold}
                                asTag="h3"
                            >
                                {t(column.label)}
                            </Typography>
                        </TableHeaderCell>
                    ))}
                </TableRow>
            </TableHeader>
            <TableBody className="typography-content-body-sm">
                {renderTableRows(activeTab, {
                    selectedPolicyPartyRoles,
                    newSelectedPolicyParty,
                    selectedPolicyParty,
                    isBeneficiary,
                    onlyShowInactive,
                    t,
                })}
            </TableBody>
        </Table>
    );
};

export default PartyDetailsTable;
