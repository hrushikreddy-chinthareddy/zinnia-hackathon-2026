import { FieldTemplateProps, ObjectFieldTemplateProps } from '@rjsf/utils';
import { useEffect, useRef } from 'react';

import { Action } from '@deps/constants/policy';
import { ActionDataItem } from '@deps/containers/task-container/task-handlers/types';

type PartyCardFieldTemplateProps = FieldTemplateProps & {
    properties: NonNullable<ObjectFieldTemplateProps['properties']>;
};

export function PartyCardFieldTemplate(props: PartyCardFieldTemplateProps) {
    const { properties, formContext } = props;
    const { setCustomData } = formContext;
    const updatedActionData = [...(formContext.parentActionData || [])];
    const prevActionDataRef = useRef<ActionDataItem[]>(undefined);

    const updateItem = (item: ActionDataItem) => ({
        ...item,
        action: item.action === Action.NONE ? Action.UPDATE : item.action,
    });

    const onItemChange = (index: number) => {
        const updatedList = [...updatedActionData];

        updatedList[index] = updateItem(updatedList[index]);

        setCustomData({ actionData: updatedList });
    };

    useEffect(() => {
        const prev = prevActionDataRef.current ?? [];
        const next = (formContext?.parentActionData ?? []) as any[];
        const max = Math.max(prev.length, next.length);
        for (let i = 0; i < max; i++) {
            const prevItem = prev[i];
            const nextItem = next[i];

            if (!prevItem || !nextItem) continue;

            const changed =
                JSON.stringify(prevItem) !== JSON.stringify(nextItem);
            if (changed && prevItem.action === Action.NONE) {
                onItemChange(i);
            }
        }
        prevActionDataRef.current = next;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [formContext?.parentActionData]);

    return (
        <>
            <div className="p-2">
                {properties
                    .filter((p: any) => !p.hidden)
                    .map((p: any) => (
                        <div key={p.name}>{p.content}</div>
                    ))}
            </div>
        </>
    );
}
