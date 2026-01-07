import { TFunction } from 'i18next';

import {
    AnnuityDetailsViewInfo,
    AnnuityViewDetailsDto,
} from '@deps/data/annuity-details-view';
import {
    generatePolicyAnnuityDetailsDto,
    isTermLifeProduct,
} from '@deps/data/details-view';
import {
    PolicyDetailsViewInfo,
    PolicyViewDetailsDto,
    TermLifeDetailsViewInfo,
} from '@deps/data/policy-details-view';
import { fillColDefs } from '@deps/helpers/data-transform.helpers';
import { DataDefinition } from '@deps/types/data';
import {
    Policy,
    LineOfBusiness,
    Transaction,
    TransactionType,
    TransactionStatus,
} from '@zinnia/api-types/types/sor';

import {
    DataField,
    DataGroup,
    DataNode,
    DataSection,
    FieldType,
} from './types';

export const TransactionSidesheetViews = {
    surrender: 'surrender',
    cancel: 'cancel',
    default: 'default',
    reverse: 'reverse',
    loading: 'loading',
    reverseInitiator: 'reverseInitiator',
};

export const TRANSACTION_TYPES_ELIGIBLE_FOR_REVERSAL = [
    TransactionType.ONE_TIME_PREMIUM,
    TransactionType.PAYMENT_ONE_TIME_PREMIUM,
    TransactionType.SUBSEQUENT_PAYMENT,
    TransactionType.SUBSEQUENT_PREMIUM,
];

export const TRANSACTION_TYPES_ELIGIBLE_FOR_CANCEL = [
    TransactionType.FULL_SURRENDER,
    TransactionType.NEW_LOAN,
    TransactionType.ONE_TIME_PREMIUM,
    TransactionType.PAYMENT_ONE_TIME_PREMIUM,
];

/**
 * Gets the Transaction ID of the Transaction to be reversed
 * NOTE - Reversals are only supported for 4 transaction types for now
 * defaulting to transactionId for the other transaction types
 * @param transaction - the Transaction to be reversed
 * @returns
 */
export const getReversalTransactionId = (
    transaction: Transaction | undefined
): string | undefined => {
    if (!transaction || !transaction?.transactionType) {
        return undefined;
    }

    switch (transaction.transactionType) {
        case TransactionType.ONE_TIME_PREMIUM:
        case TransactionType.SUBSEQUENT_PREMIUM:
            return transaction.parentId;
        case TransactionType.PAYMENT_ONE_TIME_PREMIUM:
        case TransactionType.SUBSEQUENT_PAYMENT:
        default:
            return transaction.transactionId;
    }
};

/**
 * Gets the "proper" display amount of the transaction using pre-existing business logic
 * @param transaction
 * @returns
 */
export const getTransactionAmount = (
    transaction: Transaction | undefined
): number | undefined => {
    if (!transaction) {
        return undefined;
    }

    const { appliedAmount, paymentAmount, requestedAmount } =
        transaction?.transactionAmounts ?? {};
    switch (transaction?.transactionType) {
        case TransactionType.NEW_LOAN:
            return transaction?.transactionAmounts?.requestedAmount;
        case TransactionType.PAYMENT_ONE_TIME_PREMIUM:
            return paymentAmount || requestedAmount;
        case TransactionType.ONE_TIME_PREMIUM:
            return appliedAmount || requestedAmount;
        case TransactionType.SUBSEQUENT_PAYMENT:
        case TransactionType.SUBSEQUENT_PREMIUM:
            return transaction?.status === TransactionStatus.PENDING
                ? paymentAmount
                : appliedAmount;
        case TransactionType.FULL_SURRENDER:
            return undefined;
        default:
            return appliedAmount || requestedAmount;
    }
};

/**
 * Takes in a policy and generates the key values search fields for that policy
 */
export const prepareSearchableData = (policy: Policy, t: TFunction) => {
    const dto = generatePolicyAnnuityDetailsDto(policy);
    const isLifePolicy = policy.product?.lineOfBusiness === LineOfBusiness.LIFE;
    const isTermLife = isLifePolicy && isTermLifeProduct(policy);
    const colDefs = isLifePolicy
        ? isTermLife
            ? TermLifeDetailsViewInfo()
            : PolicyDetailsViewInfo()
        : AnnuityDetailsViewInfo();

    return fillColDefs(dto, colDefs, t, 'colDefs:policyDetails');
};

/**
 * Takes in an array of key values and groups them into an array of objects by group label
 */
export const generateKeyValueGroups = (
    keyValues: DataDefinition<PolicyViewDetailsDto | AnnuityViewDetailsDto>[]
) => {
    const groupedObj = keyValues.reduce(
        (acc: Record<string, any[]>, keyValue) => {
            if (keyValue.groupLabel !== undefined && keyValue.group !== null) {
                if (acc[keyValue.groupLabel]) {
                    acc[keyValue.groupLabel].push(keyValue);
                } else {
                    acc[keyValue.groupLabel] = [keyValue];
                }
            }
            return acc;
        },
        {}
    );

    // Then transform the object into an array of the desired structure
    return Object.entries(groupedObj).map(([groupLabel, items]) => {
        // Find the group value from the first item in the array
        const group = items[0]?.group || '';

        return {
            group,
            groupLabel,
            items,
        };
    });
};

// TEST HELPERS
export const makeField = (label: string, value: string): DataField => ({
    type: FieldType.field,
    label,
    value,
});

export const makeSection = (
    label: string,
    children: DataNode[]
): DataSection => ({
    type: FieldType.section,
    label,
    children,
});

export const makeGroup = (children: DataNode[][]): DataGroup => ({
    type: FieldType.group,
    children,
});

export const buildSearchTree = (): DataNode[] => {
    const nameField = makeField('name', 'Alice');
    const cityField = makeField('city', 'Metropolis');
    const ageField = makeField('age', '30');

    const personSection = makeSection('person', [nameField, ageField]);

    const group = makeGroup([[nameField], [cityField], []]);

    return [personSection, group];
};
