import { ArrayFieldTemplateProps, getUiOptions, RJSFSchema } from '@rjsf/utils';
import dayjs from 'dayjs';
import { useRef, useState, useEffect, useLayoutEffect } from 'react';

import CheckboxText from '@deps/components/checkbox/checkbox-text/checkbox-text';
import { Action } from '@deps/constants/policy';
import { ZAHARA_API_DATE_FORMAT } from '@deps/types/constants';

import styles from './transaction-accordion.module.css';
import { getTitle } from './utils';

function TransactionAccordionTemplate(
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
    } = props;

    const uiOptions = getUiOptions(uiSchema);
    const {
        tabTitle,
        showAddBtn = true,
        showDeleteBtn = true,
        showRemoveItemBtn = true,
        addButtonCTA = 'Add',
        title: overrideTitle,
    } = uiOptions;

    const [activeIndex, setActiveIndex] = useState<number | null>(0);

    const [heights, setHeights] = useState<Record<number, number>>({});
    const contentRefs = useRef<(HTMLDivElement | null)[]>([]);

    const [disabledIndices, setDisabledIndices] = useState<Set<number>>(
        new Set()
    );

    const prevLengthRef = useRef(items.length);

    const toggleIndex = (index: number) => {
        if (disabledIndices.has(index)) return;
        setActiveIndex((prev) => (prev === index ? null : index));
    };

    const { customData, setCustomData } = formContext;
    const isTpdAdded = customData.requestType === Action.ADD;
    const isTpdUpdated = customData.requestType === Action.UPDATE;
    const [isAdd, setIsAdd] = useState(false);
    const [isDelete, setIsDelete] = useState(false);
    const [deletedIndex, setDeletedIndex] = useState<number | null>(null);

    useEffect(() => {
        if (customData.requestType === Action.ADD) {
            const lastIndex = customData.partyData.length - 1;
            customData.partyData[lastIndex] = {
                ...customData.partyData[lastIndex],
                party: {
                    ...customData.partyData[lastIndex].party,
                    partyId: null,
                },
            };
        }

        if (customData.requestType === Action.DELETE && deletedIndex !== null) {
            customData.partyData[deletedIndex] = {
                ...customData.partyData[deletedIndex],
                party: {
                    ...customData.partyData[deletedIndex].party,
                    endDate:
                        deletedIndex !== null
                            ? dayjs.utc().format(ZAHARA_API_DATE_FORMAT)
                            : null,
                },
            };
        }
    }, [customData, deletedIndex]);

    useEffect(() => {
        let newRequestType: string | null = null;
        let partyId: string | null = null;

        if (isAdd && isDelete) {
            newRequestType = Action.UPDATE;
            partyId =
                deletedIndex !== null
                    ? customData.partyData[deletedIndex]?.party?.partyId
                    : null;
        } else if (isAdd) {
            newRequestType = Action.ADD;
        } else if (isDelete) {
            newRequestType = Action.DELETE;
            partyId =
                deletedIndex !== null
                    ? customData.partyData[deletedIndex]?.party?.partyId
                    : null;
        }

        setCustomData({
            ...customData,
            requestType: newRequestType,
            partyId,
        });
    }, [isAdd, isDelete, deletedIndex]);

    const handleAdd = () => {
        onAddClick();
        setIsAdd(true);
    };

    const handleRemove = () => {
        setIsAdd(false);
    };

    const handleCheckboxChange = (index: number, checked: boolean) => {
        if (customData.taskType === 'THIRD_PARTY_DETAIL') {
            //To allow only 1 remove to be checked at a time
            setDisabledIndices((prev) => {
                const n = new Set(prev);
                if (checked) {
                    n.clear();
                    n.add(index);
                } else {
                    n.delete(index);
                }
                return n;
            });
        } else {
            setDisabledIndices((prev) => {
                const n = new Set(prev);
                n.has(index) ? n.delete(index) : n.add(index);
                return n;
            });
        }

        setIsDelete(checked);
        setDeletedIndex(index);
    };

    useLayoutEffect(() => {
        if (activeIndex !== null) {
            const el = contentRefs.current[activeIndex];
            if (el) {
                requestAnimationFrame(() => {
                    setHeights((prev) => ({
                        ...prev,
                        [activeIndex]: el.scrollHeight,
                    }));
                });
            }
        }
    }, [activeIndex, items.length]);

    useEffect(() => {
        const prevLen = prevLengthRef.current;
        const newLen = items.length;

        if (newLen > prevLen) {
            setActiveIndex(newLen - 1);
        }

        if (newLen < prevLen) {
            setActiveIndex((prev) => {
                if (prev === null) return null;
                return prev < newLen ? prev : null;
            });
        }

        prevLengthRef.current = newLen;
    }, [items.length]);

    return (
        <div>
            {items.map((element, index) => {
                const formData = element.children?.props?.formData || {};
                const itemTitle = getTitle(formData, index, tabTitle);
                const isTpdAdded = customData.requestType === Action.ADD;
                const isTpdUpdated = customData.requestType === Action.UPDATE;

                const isActive = activeIndex === index;
                const isDisabled = disabledIndices.has(index);

                const isNewItem =
                    ((isTpdAdded || isTpdUpdated) &&
                        index === customData.partyData.length - 1) ||
                    formData?.action === Action.ADD;

                const showRemove = showRemoveItemBtn && !readonly && isNewItem;

                return (
                    <div
                        key={`accordion-item-${index}`}
                        className={isDisabled ? styles.disabledAccordion : ''}
                        style={{ opacity: isDisabled ? 0.5 : 1 }}
                    >
                        <div className="border-2 border-gray-100 rounded-lg mt-3">
                            <div className="flex justify-between items-center px-4 py-3">
                                {
                                    <button
                                        type="button"
                                        onClick={() => toggleIndex(index)}
                                        className={`flex items-center gap-x-2 flex-grow ${
                                            isDisabled ? styles.disabled : ''
                                        }`}
                                        disabled={isDisabled}
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
                                                strokeWidth={2}
                                                d={
                                                    isActive
                                                        ? 'M19 9l-7 7-7-7'
                                                        : 'M9 5l7 7-7 7'
                                                }
                                            />
                                        </svg>

                                        <span className={styles.title}>
                                            {itemTitle}
                                        </span>
                                    </button>
                                }
                                {showRemove && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            element.onDropIndexClick(
                                                element.index
                                            )();
                                            handleRemove();
                                        }}
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
                                {!readonly && showDeleteBtn && !isNewItem && (
                                    <CheckboxText
                                        id={`remove-${index}`}
                                        label="Remove"
                                        checked={isDisabled}
                                        onChange={(checked) =>
                                            handleCheckboxChange(index, checked)
                                        }
                                    />
                                )}
                            </div>

                            <div
                                ref={(el) => {
                                    contentRefs.current[index] = el;
                                }}
                                className={`overflow-hidden bg-gray-50 ${
                                    isDisabled ? styles.disabledContent : ''
                                }`}
                                style={{
                                    padding: isActive ? '1rem' : '0',
                                }}
                            >
                                {isActive && element.children}
                            </div>
                        </div>
                    </div>
                );
            })}

            {!readonly &&
                showAddBtn &&
                canAdd &&
                !isTpdAdded &&
                !isTpdUpdated && (
                    <div className="flex justify-start mt-3">
                        <button
                            type="button"
                            onClick={handleAdd}
                            className="text-cyan-800 text-sm font-bold hover:text-cyan-900"
                        >
                            {` + ${addButtonCTA}`}
                        </button>
                    </div>
                )}
        </div>
    );
}

export default TransactionAccordionTemplate;
