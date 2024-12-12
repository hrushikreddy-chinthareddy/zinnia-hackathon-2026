import * as React from 'react';
import { useTranslation } from 'next-18next';

import Radio, { RadioVariant } from '@deps/components/radio/radio';
import Table from '@deps/components/table-v2/table';
import { TypedRow } from '@deps/components/table-v2/table.types';
import Typography, { TypographyVariant } from '@deps/components/typography/typography';
import { TranslationFiles } from '@deps/config/translations';
import { useAddressChange } from '@deps/containers/address-change-container/address-change-provider';
import { ApplyToRolesState, ContractUpdateOptions } from '@deps/containers/address-change-container/types/address-change-types';
import { useFetchAssociatedAddresses } from '@deps/hooks/useFetchAssociatedAddress';
import { Policy, PolicyParties } from '@deps/models/policy/sor-policy';

import { EmptyAssociatedAddress } from './empty-associated-address';
import { AssociatedAddressTableColumns } from '../utils/roles-contract-constants';
import { getAssociatedTableData, getContractSelectionRadioConfig, isRowAlreadySelected } from '../utils/roles-contract-helper';
import { mapRoleItemToRoleState } from '../utils/roles-contract-mappers';
import { AssociateAddressTableRow } from '../utils/roles-contract-types';

interface AssociatedAddressTableProps {
    policy: Policy;
    extractedPartyRoles?: PolicyParties[];
}

export const AssociatedAddressTable = ({ policy }: AssociatedAddressTableProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, { keyPrefix: 'addressChange' });
    const { applyToRoles, setApplyToRoles, roleIdentifier, contractUpdateOption, setContractUpdateOption } = useAddressChange();

    const [tableData, setTableData] = React.useState<AssociateAddressTableRow[]>([]);
    const [loading, fetchAssociatedAddresses, addressesResponse] = useFetchAssociatedAddresses(
        policy.product?.planCode || '',
        policy?.policyNumber || ''
    );

    React.useEffect(() => {
        if (addressesResponse) {
            const tableData = getAssociatedTableData(addressesResponse, applyToRoles, t);
            setTableData(tableData);
        }
    }, [addressesResponse, applyToRoles, t]);

    React.useEffect(() => {
        if (contractUpdateOption === ContractUpdateOptions.otherContract && roleIdentifier?.partyId) {
            fetchAssociatedAddresses(roleIdentifier?.partyId);
        }
    }, [contractUpdateOption, fetchAssociatedAddresses, roleIdentifier]);

    const onContractSelectionChange = (selection: ContractUpdateOptions) => {
        if (selection === ContractUpdateOptions.currentContract) {
            setApplyToRoles([]);
        }
        setContractUpdateOption(selection);
    };

    const handleCellChange = React.useCallback(
        (rowData: TypedRow<AssociateAddressTableRow>) => {
            setApplyToRoles((fs: ApplyToRolesState[]) => {
                if (fs) {
                    if (fs.some(item => isRowAlreadySelected(rowData, item))) {
                        return [...fs.filter(item => !isRowAlreadySelected(rowData, item))];
                    }
                }
                const roleOption = mapRoleItemToRoleState(rowData);
                return [...fs, roleOption];
            });
        },
        [setApplyToRoles]
    );

    const handleAllRowSelected = React.useCallback(
        (isRowAlreadySelected: boolean) => {
            setApplyToRoles(() => {
                return isRowAlreadySelected ? tableData.map(item => mapRoleItemToRoleState(item)) : [];
            });
        },
        [tableData, setApplyToRoles]
    );

    const contractRadioOptions = getContractSelectionRadioConfig(policy, t);
    return (
        <div>
            <Typography variant={TypographyVariant.LabelLg}>{t('rolesAndContracts.contractUpdateTitle')}</Typography>
            <div className="w-fulls mt-4">
                <div className="mb-4 max-w-xs">
                    <Radio
                        items={contractRadioOptions.selectOptions}
                        onChange={e => onContractSelectionChange(e.target.value as ContractUpdateOptions)}
                        value={contractUpdateOption}
                        required={contractRadioOptions.isRequired}
                        name={'contractRadioOptions.selectOptions'}
                        disabled={false}
                        variant={RadioVariant.Default}
                    />
                </div>
                {!loading && contractUpdateOption == ContractUpdateOptions.otherContract && (
                    <div>
                        {addressesResponse && tableData.length > 0 && (
                            <Table
                                data={tableData}
                                bodyCellClass="py-2"
                                columns={AssociatedAddressTableColumns}
                                onCellChange={handleCellChange}
                                onAllRowsSelected={handleAllRowSelected}
                            />
                        )}
                        {!addressesResponse && tableData.length === 0 && <EmptyAssociatedAddress />}
                    </div>
                )}
            </div>
        </div>
    );
};
