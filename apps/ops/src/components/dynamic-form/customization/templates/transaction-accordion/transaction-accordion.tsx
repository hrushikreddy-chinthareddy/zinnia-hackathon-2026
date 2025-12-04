import { ArrayFieldTemplateProps, getUiOptions, RJSFSchema } from '@rjsf/utils';
import { Icon, IconType } from '@zinnia/bloom/components';
import { useRef, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import CheckboxText from '@deps/components/checkbox/checkbox-text/checkbox-text';
import { TranslationFiles } from '@deps/config/translations';
import { Action } from '@deps/constants/policy';

import styles from './transaction-accordion.module.css';
import { getTitle } from './utils';

export const TransactionAccordionTemplate = (
    props: ArrayFieldTemplateProps<any, RJSFSchema, any>
) => {
    const { canAdd, items, onAddClick, readonly, uiSchema, formContext } =
        props;

    const uiOptions = getUiOptions(uiSchema);
    const { customData, setCustomData } = formContext;

    const {
        tabTitle,
        showAddBtn = true,
        showDeleteBtn = true,
        showRemoveItemBtn = true,
        addButtonCTA = 'Add',
    } = uiOptions;

    const [activeIndex, setActiveIndex] = useState<number | null>(0);

    const contentRefs = useRef<(HTMLDivElement | null)[]>([]);

    const [disabledIndices, setDisabledIndices] = useState<Set<number>>(
        new Set()
    );
    const { t } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: 'transactionAccordion',
    });

    const prevLengthRef = useRef(items.length);

    const toggleIndex = (index: number) => {
        if (disabledIndices.has(index)) return;
        setActiveIndex((prev) => (prev === index ? null : index));
    };

    const handleCheckboxChange = (index: number) => {
        const isCurrentlyDisabled = disabledIndices.has(index);

        setDisabledIndices((prev) => {
            const n = new Set(prev);
            if (isCurrentlyDisabled) {
                n.delete(index);
            } else {
                n.add(index);
            }
            return n;
        });

        const item = items[index];
        if (item?.children?.props?.formData) {
            const formData = item.children.props.formData;

            if (isCurrentlyDisabled) {
                item.children.props.onChange({
                    ...formData,
                    action: Action.NONE,
                });
            } else {
                item.children.props.onChange({
                    ...formData,
                    action: Action.DELETE,
                });
            }
        }
    };

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

    const handleAddClick = () => {
        setCustomData({ requestType: 'ADD' });
        onAddClick();
    };
    //intentional console.log
    console.log('printing customData', customData);

    return (
        <div>
            {items.map((element, index) => {
                const formData = element.children?.props?.formData || {};
                const itemTitle = getTitle(formData, index, tabTitle);
                const isActive = activeIndex === index;
                const isDisabled = disabledIndices.has(index);
                const isNewItem = formData?.action === Action.ADD;

                const showRemove =
                    showRemoveItemBtn &&
                    !readonly &&
                    formData?.action === Action.ADD;

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

                                {!readonly && showDeleteBtn && !isNewItem && (
                                    <CheckboxText
                                        id={`remove-${index}`}
                                        label={t('remove')}
                                        checked={isDisabled}
                                        onChange={() =>
                                            handleCheckboxChange(index)
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

            {!readonly && showAddBtn && canAdd && (
                <div className="flex justify-start mt-3">
                    <button
                        type="button"
                        onClick={handleAddClick}
                        className="text-cyan-800 text-sm font-bold hover:text-cyan-900"
                    >
                        <Icon type={IconType.ADD} small />
                        <>{addButtonCTA}</>
                    </button>
                </div>
            )}
        </div>
    );
};
