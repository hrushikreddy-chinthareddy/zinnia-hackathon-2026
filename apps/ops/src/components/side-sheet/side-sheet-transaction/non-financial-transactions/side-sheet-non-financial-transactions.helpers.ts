import { Policy, Transaction } from '@zinnia/api-types/types/sor';
import dayjs from 'dayjs';
import { TFunction } from 'next-i18next';

import { convertToChipText } from '@deps/containers/people-sub-page/people-sub-page.helpers';
import { getFullName } from '@deps/helpers/party-info-helpers';
import { orderObjectsByString } from '@deps/helpers/sort.helpers';
import { convertKebabedDateString } from '@deps/helpers/string.helpers';
import { NonFinancialTransactionActions } from '@deps/queries/api/bpm-non-financial';
import { ZAHARA_API_DATE_FORMAT } from '@deps/types/constants';

import { LooseIdObject, NonFinancialTransactionSideSheetValues, UpdateOptimistically } from './types';

export const getNonFinancialTransactionSideSheetValues = (
    policy: Policy,
    transaction: Transaction,
    t: TFunction
): NonFinancialTransactionSideSheetValues => {
    const { effectiveDate, partyId } = transaction;
    const party = policy.parties?.find(p => p.partyId === partyId);
    const roleTags = orderObjectsByString(
        (policy?.partyRoles || [])?.filter(partyRole => {
            if (partyRole.partyId !== partyId) return false;
            const today = dayjs();

            if (partyRole.endDate) {
                const endDate = dayjs(partyRole.endDate, ZAHARA_API_DATE_FORMAT);
                if (today.isAfter(endDate)) return false;
            }
            return true;
        }),
        (t('colDefs:people.orderedRoles', { returnObjects: true }) as string[]).map(role => role.toUpperCase()),
        'partyRole'
    ).map(partyRole => convertToChipText(partyRole.partyRole, t));

    return {
        effectiveDate: convertKebabedDateString(effectiveDate),
        name: getFullName(party),
        roleTags,
    };
};

export const updateOptimistically = ({ action, idKey, newItem, setState }: UpdateOptimistically) => {
    switch (action) {
        case NonFinancialTransactionActions.Add: {
            setState(prevState => [...prevState, { ...newItem, isPending: true }]);

            break;
        }
        case NonFinancialTransactionActions.Edit: {
            setState(prevState => [
                ...prevState.filter(item => (item as LooseIdObject)[idKey] !== (newItem as LooseIdObject)[idKey]),
                { ...newItem, isPending: true },
            ]);

            break;
        }
        case NonFinancialTransactionActions.Delete: {
            setState(prevState => prevState.filter(item => (item as LooseIdObject)[idKey] !== (newItem as LooseIdObject)[idKey]));

            break;
        }
    }
};
