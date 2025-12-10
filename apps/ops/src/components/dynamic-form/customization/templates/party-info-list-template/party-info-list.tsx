import { ArrayFieldTemplateProps, getUiOptions, RJSFSchema } from '@rjsf/utils';
import { Icon, IconType } from '@zinnia/bloom/components';
import { useState, useRef, useEffect } from 'react';

import CheckboxText from '@deps/components/checkbox/checkbox-text/checkbox-text';

import styles from './party-info-list.module.css';

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
    const { customData, setCustomData } = formContext;
    const { actionData } = customData;
    // the commented code in this file is for future use and is intentionally left there
    const uiOptions = getUiOptions(uiSchema);
    const {
        addButtonCTA = 'Add',
        title: overrideTitle,
        // showRemoveItemBtn = true,
        showDeleteBtn = true,
        prefferedCTA = 'Preferred',
    } = uiOptions;

    // const [disabledSet, setDisabledSet] = useState(new Set<number>());
    const prevLengthRef = useRef(items.length);
    const [newlyAddedSet, setNewlyAddedSet] = useState(new Set<number>());

    const [preferredIndex, setPreferredIndex] = useState(0);

    const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

    // const { t } = useTranslation(TranslationFiles.COMMON, {
    //     keyPrefix: 'transactionAccordion',
    // });

    // const toggleDisable = (index: number) => {
    //     setDisabledSet((prev) => {
    //         const copy = new Set(prev);
    //         copy.has(index) ? copy.delete(index) : copy.add(index);
    //         return copy;
    //     });
    // };

    const toggleIsPreferred = (index: number, checked: boolean) => {
        let newPreferredIndex = preferredIndex;

        if (checked) {
            newPreferredIndex = index;
        } else if (preferredIndex === index) {
            newPreferredIndex = -1;
        }

        setPreferredIndex(newPreferredIndex);
    };

    const handleAddClick = () => {
        const id = idSchema?.$id ?? '';

        const match = id.match(/actionData_(\d+)/);
        const partyIndex = match ? Number(match[1]) : 0;

        const contacts = Array.isArray(formData) ? formData : [];

        const sample = contacts[0] ?? {};

        const updatedActionData = [...(actionData ?? [])];
        const existingEntry = updatedActionData[partyIndex] ?? {};
        const existingParty = existingEntry.party ?? {};

        let emails = existingParty.emails ?? [];
        let phones = existingParty.phones ?? [];
        let addresses = existingParty.addresses ?? [];

        if ('emailType' in sample || id.endsWith('_emails')) {
            emails = contacts;
        } else if ('phoneType' in sample || id.endsWith('_phones')) {
            phones = contacts;
        } else if ('addressType' in sample || id.endsWith('_addresses')) {
            addresses = contacts;
        }

        updatedActionData[partyIndex] = {
            ...existingEntry,
            party: {
                ...existingParty,
                emails,
                phones,
                addresses,
            },
        };

        setCustomData({
            actionData: updatedActionData,
        });

        onAddClick();
    };

    useEffect(() => {
        const prevLen = prevLengthRef.current;
        const newLen = items.length;

        if (newLen > prevLen) {
            const addedIndex = newLen - 1;

            setNewlyAddedSet((prev) => {
                const copy = new Set(prev);
                copy.add(addedIndex);
                return copy;
            });

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
                            onClick={handleAddClick}
                            className="text-cyan-800 text-sm font-bold hover:text-cyan-900"
                        >
                            <Icon type={IconType.ADD} small />
                            <>{addButtonCTA}</>
                        </button>
                    )}
                </div>
            </div>

            {items.map((element, index) => {
                const isPreferred = preferredIndex === index;

                // const isDisabled = disabledSet.has(index);

                return (
                    <>
                        <div
                            key={index}
                            ref={(el) => {
                                itemRefs.current[index] = el;
                            }}
                            className={`${styles.card} ${
                                newlyAddedSet.has(index)
                                    ? styles.animateSlideUp
                                    : ''
                            }`}
                            style={{ opacity: 1 }}
                        >
                            <div className="flex justify-between items-start gap-4 flex-wrap">
                                <div className={`flex-1 min-w-[70%]`}>
                                    {element.children}
                                </div>
                                <div className="flex flex-col gap-3 items-end">
                                    {/* {showRemoveItemBtn &&
                                        !readonly &&
                                        !newlyAddedSet.has(index) && (
                                            <CheckboxText
                                                id={`remove-address-${index}`}
                                                label={t('remove')}
                                                checked={isDisabled}
                                                onChange={() =>
                                                    toggleDisable(index)
                                                }
                                            />
                                        )} */}
                                    {showDeleteBtn &&
                                        !readonly &&
                                        newlyAddedSet.has(index) && (
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
                                onChange={(val) =>
                                    toggleIsPreferred(index, val)
                                }
                            />
                        </div>
                    </>
                );
            })}
        </div>
    );
}
