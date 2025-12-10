import dayjs from 'dayjs';
import { useEffect, useRef } from 'react';

import { Action } from '@deps/constants/policy';
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
    const formDataRef = useRef<any[]>(formData);

    useEffect(() => {
        formDataRef.current = formData;
    }, [formData]);

    const disableAddButton =
        isSingleParty &&
        Array.isArray(formData) &&
        formData.some((x: any) => x.action === Action.ADD);

    const onToggleDelete = (index: number, checked: boolean) => {
        let updatedList = [...formDataRef.current];

        if (isSingleParty) {
            updatedList = updatedList.map((item, i) => ({
                ...item,
                action:
                    i === index && checked
                        ? Action.DELETE
                        : item.action === Action.ADD
                        ? Action.ADD
                        : Action.NONE,
                party: {
                    ...item.party,
                    endDate:
                        i === index && checked
                            ? dayjs.utc().format(ZAHARA_API_DATE_FORMAT)
                            : null,
                },
            }));
        } else {
            updatedList[index] = {
                ...updatedList[index],
                action: checked
                    ? Action.DELETE
                    : updatedList[index].action === Action.ADD
                    ? Action.ADD
                    : Action.NONE,
                party: {
                    ...updatedList[index].party,
                    endDate: checked
                        ? dayjs.utc().format(ZAHARA_API_DATE_FORMAT)
                        : null,
                },
            };
        }
        formDataRef.current = updatedList;
        setCustomData({ actionData: updatedList });
    };

    return {
        disableAddButton,
        onToggleDelete,
    };
}
