import { useQueryClient } from '@tanstack/react-query';
import {
    Button,
    FieldData,
    Icon,
    IconType,
    Label,
    FieldSize as BloomFieldSize,
    FieldTypes,
} from '@zinnia/bloom/components';
import dayjs from 'dayjs';
import { useEffect, ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';

import { useDebounce } from '@deps/hooks/useDebounce';
import { usePolicyQuery } from '@deps/hooks/usePolicyQuery';
import { Expand, useTreeState } from '@deps/hooks/useTreeState';
import { NUMERIC_DATE_FORMAT } from '@deps/types/constants';
import useQueryStore from '@deps/utils/queryStore';
import { Transaction } from '@zinnia/api-types/types/sor';

import { DataNodeRenderer } from '../components/data-node-renderer';
import { convertNode } from '../data-node-helpers/mutations';
import { applyTransformationsToNodes } from '../data-node-helpers/traversal';
import styles from '../find-all-key-values-sidesheet.module.css';
import {
    excludeNodesByLabel,
    groupBasics,
    searchNodes,
    addToolTips,
    formatPartyIdLink,
} from '../transformations';
import { DocumentFormat } from '../types';

export const TransactionSidesheetContent = ({
    transaction,
}: {
    transaction: Transaction;
}) => {
    const { treeState, setTreeState, searchValue, setSearchValue } =
        useTreeState();
    const { t } = useTranslation();
    const queryClient = useQueryClient();
    const [params] = useQueryStore();
    const { planCode, id } = params;
    const {
        data: policy,
        isFetching,
        isError,
    } = usePolicyQuery(
        String(planCode),
        String(id),
        dayjs(new Date()).format(NUMERIC_DATE_FORMAT), // Don't know if this is right, but we don't filter transactions by date
        queryClient,
        true
    );

    const debouncedSearchValue = useDebounce(searchValue, 200);
    const nodes = applyTransformationsToNodes(
        (data) => convertNode(data, t),
        (data) => groupBasics(data, DocumentFormat.transaction),
        (data) =>
            formatPartyIdLink({
                data,
                t,
                planCode: String(planCode),
                policyNumber: String(id),
                policy,
            }),
        (data) => addToolTips(data, t, DocumentFormat.transaction),
        (data) => excludeNodesByLabel(data, t)
    )({
        ...transaction,
        taxWithholdingInstructions: [
            {
                partyId: 'Party_PI_1',
                taxWithholdingType: 'FEDERAL',
                taxRateToUse: 'NOWITHHOLDINGELECTED',
                filingStatus: 'SINGLE',
                dollar: 0,
                percentage: 0,
                exemptions: 0,
                taxJurisdiction: 'USA_WY',
                contribution: 'NOTAPPLICABLE',
                taxFormType: 'T1035COSTBASIS',
                w4p: {
                    totalAmountOfOtherIncomeAndOtherPensionsOrAnnuities: 12.12,
                    totalAmountOfClaimsAndOtherCredits: 213.73,
                    otherIncome: 144.53,
                    otherDeduction: 42.83,
                },
                partyRole: 'OWNER',
            },
            {
                partyId: 'Party_Agent_1',
                taxWithholdingType: 'STATE',
                taxRateToUse: 'NOWITHHOLDINGELECTED',
                filingStatus: 'SINGLE',
                dollar: 0,
                percentage: 0,
                exemptions: 0,
                taxJurisdiction: 'USA_WY',
                contribution: 'NOTAPPLICABLE',
                taxFormType: 'T1035COSTBASIS',
                w4p: {
                    totalAmountOfOtherIncomeAndOtherPensionsOrAnnuities: 12.12,
                    totalAmountOfClaimsAndOtherCredits: 213.73,
                    otherIncome: 144.53,
                    otherDeduction: 42.83,
                },
                partyRole: 'AGENT',
            },
            {
                partyId: 'Party_Agent_1',
                taxWithholdingType: 'STATE',
                taxRateToUse: 'NOWITHHOLDINGELECTED',
                filingStatus: 'SINGLE',
                dollar: 0,
                percentage: 0,
                exemptions: 0,
                taxJurisdiction: 'USA_NY',
                contribution: 'NOTAPPLICABLE',
                taxFormType: 'T1035COSTBASIS',
                w4p: {
                    totalAmountOfOtherIncomeAndOtherPensionsOrAnnuities: 12.12,
                    totalAmountOfClaimsAndOtherCredits: 213.73,
                    otherIncome: 144.53,
                    otherDeduction: 42.83,
                },
                partyRole: 'AGENT',
            },
        ],
        taxWithheldAmounts: [
            {
                partyRole: 'AGENT',
                partyId: 'Party_Agent_1',
                taxWithholdingType: 'FEDERAL',
                withheldAmount: 100,
                withheldTaxableAmount: 100,
                taxableFlag: true,
                appliedTaxRate: 100,
            },
            {
                partyRole: 'OWNER',
                partyId: 'Party_Annuitant_1',
                taxWithholdingType: 'STATE',
                withheldAmount: 100,
                withheldTaxableAmount: 100,
                taxableFlag: true,
                appliedTaxRate: 100,
            },
        ],
    });

    const matches = searchNodes(nodes, debouncedSearchValue);

    useEffect(() => {
        if (!debouncedSearchValue) return;
        setTreeState(Expand);
        setSearchValue(debouncedSearchValue);
    }, [debouncedSearchValue, setTreeState, setSearchValue]);

    if (policy == null) {
        // FIXME: loading state
        return null;
    }

    return (
        <div className={styles.keyValuesContainer}>
            <FieldData
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setSearchValue(e.target.value)
                }
                handleClear={() => setSearchValue('')}
                value={searchValue}
                fieldType={FieldTypes.Search}
                fieldSize={BloomFieldSize.Small}
                placeholder="Search"
            />

            <div className={styles.container}>
                <div className={styles.treeControl}>
                    <Button
                        mode="link"
                        size="small"
                        onClick={() => setTreeState((treeState) => !treeState)}
                        className={styles.treeControlButton}
                    >
                        <Icon
                            type={IconType.CHEVRON_DOUBLE}
                            width={18}
                            height={18}
                            className={styles.treeControlIcon}
                        />
                        {treeState === Expand ? 'Collapse all' : 'Expand all'}
                    </Button>
                </div>
                <DataNodeRenderer nodes={matches} />
                {!matches.length && (
                    <div className={styles.emptySearch}>
                        <Label>
                            <Icon
                                type={IconType.CIRCLE_INFO}
                                small={true}
                                className={styles.infoIcon}
                            />
                            {t('allFields.emptySearch')}
                        </Label>
                    </div>
                )}
            </div>
        </div>
    );
};
