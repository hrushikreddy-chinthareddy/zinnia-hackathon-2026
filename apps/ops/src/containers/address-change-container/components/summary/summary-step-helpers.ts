import { TFunction } from 'next-i18next';

import { ColumnType, TableColumn } from '@deps/components/table-v2/table.types';
import { toTitleCase } from '@deps/helpers/string.helpers';
import { Policy } from '@zinnia/api-types/types/sor';

import { ApplyToRolesState } from '../../types/address-change-types';
import { getRoleToLabelKeyMap } from '../../utils/address-change-helpers';

export enum TableColumnFields {
    PolicyNumber = 'policyNumber',
    PartyRole = 'partyRole',
}

export const getColDefinition = (
    t: TFunction,
    allowedFields: string[]
): TableColumn[] =>
    [
        {
            field: TableColumnFields.PolicyNumber,
            headerName: t('summary.contractNumber'),
            type: ColumnType.Text,
        },
        {
            field: TableColumnFields.PartyRole,
            headerName: t('summary.role'),
            type: ColumnType.Text,
        },
    ].filter((field) => allowedFields.includes(field.field));

export const getRolesRecordForCurrentContract = (
    t: TFunction,
    policy: Policy,
    applyToRoles: ApplyToRolesState[]
) => {
    return applyToRoles
        .filter((item) => item.policyNumber === policy.policyNumber)
        .map((item) => {
            const partyRole = t(`${getRoleToLabelKeyMap(item.partyRole)}`);
            return { ...item, partyRole: toTitleCase(partyRole) };
        });
};

export const getRolesRecordForOtherContract = (
    t: TFunction,
    policy: Policy,
    applyToRoles: ApplyToRolesState[]
) => {
    return applyToRoles
        .filter((item) => item.policyNumber !== policy.policyNumber)
        .map((item) => ({
            ...item,
            partyRole: t(`${getRoleToLabelKeyMap(item.partyRole)}`),
        }));
};
