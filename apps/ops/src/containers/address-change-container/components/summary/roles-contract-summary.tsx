import { Policy } from '@zinnia/api-types/types/sor';
import { useTranslation } from 'next-i18next';
import * as React from 'react';

import Table from '@deps/components/table-v2/table';
import Typography, { TypographyVariant } from '@deps/components/typography/typography';
import { TranslationFiles } from '@deps/config/translations';

import {
    getColDefinition,
    getRolesRecordForCurrentContract,
    getRolesRecordForOtherContract,
    TableColumnFields,
} from './summary-step-helpers';
import { useAddressChange } from '../../address-change-provider';

type ApplicableRolesContractSummaryProps = {
    policy: Policy;
};

export const ApplicableRolesContractSummary = ({ policy }: ApplicableRolesContractSummaryProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, { keyPrefix: 'addressChange' });
    const { applyToRoles } = useAddressChange();

    const tableData = React.useMemo(
        () => [getRolesRecordForCurrentContract(t, policy, applyToRoles), getRolesRecordForOtherContract(t, policy, applyToRoles)],
        [t, policy, applyToRoles]
    );

    return (
        <div className="mb-10 flex w-3/5 flex-col gap-4">
            <Typography variant={TypographyVariant.H2}>{t('summary.rolesAndContracts')}</Typography>
            {tableData[0].length ? (
                <div>
                    <Typography variant={TypographyVariant.Label}>{t('summary.updatedRoles')}</Typography>
                    <Table
                        bodyCellClass="py-2"
                        columns={getColDefinition(t, [TableColumnFields.PartyRole])}
                        data={tableData[0] || []}
                    ></Table>
                </div>
            ) : null}

            {/*applyToRoles.length ? (
                <div>
                    <Typography variant={TypographyVariant.Label}>{t('summary.updatedContracts')}</Typography>
                    <Table
                        bodyCellClass="py-2"
                        columns={getColDefinition(t, [TableColumnFields.PolicyNumber, TableColumnFields.PartyRole])}
                        data={applyToRoles || []}
                    ></Table>
                </div>
            ) : null*/}
        </div>
    );
};
