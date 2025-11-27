import { ArrayFieldTemplateProps, getUiOptions, RJSFSchema } from '@rjsf/utils';
import { useState, useRef, useEffect } from 'react';

import CheckboxText from '@deps/components/checkbox/checkbox-text/checkbox-text';

import styles from './party-info-list.module.css';

export default function PartyInfoListTemplate(
    props: ArrayFieldTemplateProps<any, RJSFSchema, any>
) {
    const { canAdd, items, onAddClick, readonly, title, uiSchema } = props;

    const uiOptions = getUiOptions(uiSchema);
    const {
        addButtonCTA = 'Add',
        title: overrideTitle,
        showRemoveItemBtn = true,
        showDeleteBtn = true,
        prefferedCTA = 'Preferred',
    } = uiOptions;

    const [disabledSet, setDisabledSet] = useState(new Set<number>());
    const prevLengthRef = useRef(items.length);
    const [newlyAddedSet, setNewlyAddedSet] = useState(new Set<number>());
    const [preferredIndex, setPreferredIndex] = useState(0);

    const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

    const toggleDisable = (index: number) => {
        setDisabledSet((prev) => {
            const copy = new Set(prev);
            copy.has(index) ? copy.delete(index) : copy.add(index);
            return copy;
        });
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
        }

        prevLengthRef.current = newLen;
    }, [items.length]);

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
                    {overrideTitle || title}

                    {!readonly && canAdd && (
                        <button
                            type="button"
                            onClick={onAddClick}
                            className="text-cyan-800 text-sm font-bold hover:text-cyan-900"
                        >
                            {`+ ${addButtonCTA}`}
                        </button>
                    )}
                </div>
            </div>

            {items.map((element, index) => {
                const isDisabled = disabledSet.has(index);

                return (
                    <>
                        <div
                            key={index}
                            ref={(el) => {
                                itemRefs.current[index] = el;
                            }}
                            className={`bg-[#F8F8F8] border border-[#e5e5e5] rounded-lg p-4 mb-4 shadow-sm ${
                                newlyAddedSet.has(index)
                                    ? styles.animateSlideUp
                                    : ''
                            }`}
                            style={{ opacity: isDisabled ? 0.5 : 1 }}
                        >
                            <div className="flex justify-between items-start gap-4 flex-wrap">
                                <div
                                    className={`flex-1 min-w-[70%] ${
                                        isDisabled ? 'pointer-events-none' : ''
                                    }`}
                                >
                                    {element.children}
                                </div>
                                <div className="flex flex-col gap-3 items-end">
                                    {showRemoveItemBtn &&
                                        !readonly &&
                                        !newlyAddedSet.has(index) && (
                                            <CheckboxText
                                                id={`remove-address-${index}`}
                                                label="Remove"
                                                checked={isDisabled}
                                                onChange={() =>
                                                    toggleDisable(index)
                                                }
                                            />
                                        )}
                                    {showDeleteBtn &&
                                        !readonly &&
                                        newlyAddedSet.has(index) && (
                                            <button
                                                type="button"
                                                onClick={element.onDropIndexClick(
                                                    element.index
                                                )}
                                            >
                                                <svg
                                                    className="w-5 h-5"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={4}
                                                        d="M6 18L18 6M6 6l12 12"
                                                    />
                                                </svg>
                                            </button>
                                        )}
                                </div>
                            </div>
                            <CheckboxText
                                id={`preferred-${index}`}
                                label={prefferedCTA as string}
                                checked={preferredIndex === index}
                                onChange={() => setPreferredIndex(index)}
                            />
                        </div>
                    </>
                );
            })}
        </div>
    );
}
