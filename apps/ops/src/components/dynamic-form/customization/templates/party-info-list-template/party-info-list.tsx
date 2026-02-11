import { ArrayFieldTemplateProps, getUiOptions, RJSFSchema } from '@rjsf/utils';
import { Icon, IconType } from '@zinnia/bloom/components';
import { useRef, useEffect } from 'react';

import CheckboxText from '@deps/components/checkbox/checkbox-text/checkbox-text';
import { ActionDataItem } from '@deps/containers/task-container/task-handlers/types';

import styles from './party-info-list.module.css';

type PartyArrayKey = 'emails' | 'phones' | 'addresses';

const suffixToKey: Record<string, PartyArrayKey> = {
    _emails: 'emails',
    _phones: 'phones',
    _addresses: 'addresses',
};
export default function PartyInfoListTemplate(
    props: ArrayFieldTemplateProps<any, RJSFSchema, any>
) {
    const {
        canAdd,
        items,
        onAddClick,
        readonly,
        title,
        uiSchema,
        formContext,
        formData,
        idSchema,
    } = props;
    const { setCustomData } = formContext;

    const uiOptions = getUiOptions(uiSchema);
    const {
        addButtonCTA = 'Add',
        title: overrideTitle,
        showDeleteBtn = true,
        prefferedCTA = 'Preferred',
    } = uiOptions;

    const prevLengthRef = useRef(items.length);

    const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
    const contacts = Array.isArray(formData) ? formData : [];

    const updatedActionDataRef = useRef<ActionDataItem[]>(
        formContext.parentActionData
    );

    useEffect(() => {
        updatedActionDataRef.current = formContext.parentActionData;
    }, [formContext.parentActionData]);

    const safeStringify = (v: any) => JSON.stringify(v ?? []);

    const toggleIsPreferred = (index: number) => {
        const id = idSchema?.$id ?? '';
        const match = id.match(/actionData_(\d+)/);
        const partyIndex = match ? Number(match[1]) : 0;
        const updatedActionData = [...updatedActionDataRef.current];
        const entry = updatedActionData[partyIndex] ?? {};
        const party = entry.party ?? {};

        const suffix = Object.keys(suffixToKey).find((s) => id.endsWith(s));
        if (!suffix) return;

        const key = suffixToKey[suffix];
        const existingList = Array.isArray(party[key]) ? party[key] : [];
        const updatedList = existingList.map((item: any, idx: number) => ({
            ...item,
            isPreferred: idx === index,
        }));
        if (safeStringify(existingList) === safeStringify(updatedList)) return;

        updatedActionData[partyIndex] = {
            ...entry,
            party: {
                ...party,
                [key]: updatedList,
            },
        };

        updatedActionDataRef.current = updatedActionData;
        setCustomData({ actionData: updatedActionData });
    };

    useEffect(() => {
        const prevLen = prevLengthRef.current;
        const newLen = items.length;

        if (newLen > prevLen) {
            const addedIndex = newLen - 1;

            requestAnimationFrame(() => {
                const el = itemRefs.current[addedIndex];
                if (!el) return;

                el.scrollIntoView({ behavior: 'smooth', block: 'center' });

                el.classList.add(styles['animate-slide-up']);
                el.classList.add(styles['flash-highlight']);

                setTimeout(() => {
                    el.classList.remove(styles['flash-highlight']);
                }, 1200);
            });
        }

        prevLengthRef.current = newLen;
    }, [items.length]);

    return (
        <div className="w-full">
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-3">
                    <span className={styles.title}>
                        {overrideTitle || title}
                    </span>

                    {!readonly && canAdd && (
                        <button
                            type="button"
                            onClick={onAddClick}
                            className="text-cyan-800 text-sm font-bold hover:text-cyan-900"
                        >
                            <Icon type={IconType.ADD} small />
                            <>{addButtonCTA}</>
                        </button>
                    )}
                </div>
            </div>

            {items.map((element, index) => {
                const isPreferred = !!contacts[index]?.isPreferred;
                //allow all items to be removable except the first one
                const isRemovable = index > 0;

                return (
                    <>
                        <div
                            key={index}
                            ref={(el) => {
                                itemRefs.current[index] = el;
                            }}
                            className={`${styles.card} ${
                                isRemovable ? styles.animateSlideUp : ''
                            }`}
                            style={{ opacity: 1 }}
                        >
                            <div className="flex justify-between items-start gap-4 flex-wrap">
                                <div className={styles.container}>
                                    {element.children}
                                </div>
                                <div className="flex flex-col gap-3 items-end">
                                    {showDeleteBtn &&
                                        !readonly &&
                                        isRemovable && (
                                            <button
                                                type="button"
                                                onClick={element.onDropIndexClick(
                                                    element.index
                                                )}
                                            >
                                                <Icon type={IconType.CLOSE} />
                                            </button>
                                        )}
                                </div>
                            </div>
                            <CheckboxText
                                id={`preferred-${index}`}
                                label={prefferedCTA as string}
                                checked={isPreferred}
                                isDisabled={readonly || isPreferred}
                                onChange={() => toggleIsPreferred(index)}
                            />
                        </div>
                    </>
                );
            })}
        </div>
    );
}
