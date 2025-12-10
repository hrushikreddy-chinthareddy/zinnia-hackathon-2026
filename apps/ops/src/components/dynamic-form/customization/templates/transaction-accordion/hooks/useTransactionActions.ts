import dayjs from 'dayjs';
import { useEffect, useMemo, useRef } from 'react';

import { Action } from '@deps/constants/policy';
import { ZAHARA_API_DATE_FORMAT } from '@deps/types/constants';

interface Params {
    templateId?: string;
    itemsLen: number;
    itemDefault: any;
    customData: any;
    setCustomData: (v: any) => void;
    isSingleParty: boolean;
}

export function useTransactionActions({
    templateId,
    itemsLen,
    itemDefault,
    customData,
    setCustomData,
    isSingleParty,
}: Params) {
    const actionData = useMemo(
        () => customData?.actionData || [],
        [customData?.actionData]
    );

    const actionDataRef = useRef<any[]>(actionData);

    useEffect(() => {
        actionDataRef.current = actionData;
    }, [actionData]);

    useEffect(() => {
        if (templateId !== 'actionData') return;

        if (actionData.length === itemsLen) return;

        if (itemsLen > actionData.length) {
            setCustomData({
                actionData: [
                    ...actionData,
                    { ...(itemDefault ?? {}), action: Action.ADD },
                ],
            });
            return;
        }

        setCustomData({
            actionData: actionData.slice(0, itemsLen),
        });
    }, [actionData, itemsLen, templateId, itemDefault, setCustomData]);

    const disableAddButton =
        isSingleParty &&
        Array.isArray(actionData) &&
        actionData.some((x: any) => x.action === Action.ADD);

    const onToggleDelete = (index: number, checked: boolean) => {
        let updatedList = [...actionDataRef.current];

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

        actionDataRef.current = updatedList;

        setCustomData({ actionData: updatedList });
    };

    return {
        actionData,
        disableAddButton,
        onToggleDelete,
    };
}
