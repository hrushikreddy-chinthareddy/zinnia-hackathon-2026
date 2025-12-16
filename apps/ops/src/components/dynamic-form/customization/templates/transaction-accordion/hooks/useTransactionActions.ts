import dayjs from 'dayjs';
import { useEffect, useRef } from 'react';

import { Action } from '@deps/constants/policy';
import { ActionDataItem } from '@deps/containers/task-container/task-handlers/types';
import { ZAHARA_API_DATE_FORMAT } from '@deps/types/constants';

interface Params {
    setCustomData: (v: any) => void;
    isSingleParty: boolean;
    formData: any;
}

export function useTransactionActions({
    setCustomData,
    isSingleParty,
    formData,
}: Params) {
    const formDataRef = useRef<ActionDataItem[]>(formData);

    useEffect(() => {
        formDataRef.current = formData;
    }, [formData]);

    const disableAddButton =
        isSingleParty &&
        Array.isArray(formData) &&
        formData.some((x: ActionDataItem) => x.action === Action.ADD);

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
