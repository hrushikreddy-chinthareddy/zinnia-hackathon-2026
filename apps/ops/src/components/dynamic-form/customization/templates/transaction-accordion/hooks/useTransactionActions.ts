import dayjs from 'dayjs';
import { useEffect, useRef } from 'react';

import { Action } from '@deps/constants/policy';
import { ActionDataItem } from '@deps/containers/task-container/task-handlers/types';
import { ZAHARA_API_DATE_FORMAT } from '@deps/types/constants';

interface Params {
    setCustomData: (v: any) => void;
    isSingleParty: boolean;
    isMultiParty: boolean;
    formData: any;
    maxParties?: number;
}

export function useTransactionActions({
    setCustomData,
    isSingleParty,
    isMultiParty,
    formData,
    maxParties,
}: Params) {
    const formDataRef = useRef<ActionDataItem[]>(formData);

    useEffect(() => {
        formDataRef.current = formData;
    }, [formData]);

    const disableAddButton = (() => {
        if (!Array.isArray(formData)) return false;

        // Count active parties (excluding deleted ones)
        const activeParties = formData.filter(
            (x: ActionDataItem) => x.action !== Action.DELETE
        );

        if (isSingleParty) {
            return formData.some(
                (x: ActionDataItem) => x.action === Action.ADD
            );
        }

        if (isMultiParty && maxParties) {
            return activeParties.length >= maxParties;
        }

        return false;
    })();

    const updateItem = (item: ActionDataItem, shouldDelete: boolean) => ({
        ...item,
        action: shouldDelete
            ? Action.DELETE
            : item.action === Action.ADD
            ? Action.ADD
            : Action.NONE,
        party: {
            ...item.party,
            endDate: shouldDelete
                ? dayjs.utc().format(ZAHARA_API_DATE_FORMAT)
                : null,
        },
    });

    const onToggleDelete = (index: number, checked: boolean) => {
        let updatedList = [...formDataRef.current];

        if (isSingleParty) {
            updatedList = updatedList.map((item: ActionDataItem, i: number) =>
                i === index
                    ? updateItem(item, checked)
                    : updateItem(item, false)
            );
        } else {
            updatedList[index] = updateItem(updatedList[index], checked);
        }
        formDataRef.current = updatedList;
        setCustomData({ actionData: updatedList });
    };

    return {
        disableAddButton,
        onToggleDelete,
    };
}
