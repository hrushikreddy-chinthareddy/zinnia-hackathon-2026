import { ArrayFieldTemplateProps, getUiOptions, RJSFSchema } from '@rjsf/utils';
import { Icon, IconType } from '@zinnia/bloom/components';

import CheckboxText from '@deps/components/checkbox/checkbox-text/checkbox-text';
import { Action, Roles } from '@deps/constants/policy';
import { ReactComponent as ChevronDown } from '@deps/styles/elements/icons/arrow/chevron-down.svg';
import { ReactComponent as ChevronRightIcon } from '@deps/styles/elements/icons/icons_outlined/chevron-right.svg';

import { useAccordionState } from './hooks/useAccordionState';
import { useTransactionActions } from './hooks/useTransactionActions';
import styles from './transaction-accordion.module.css';
import { getTitle } from './utils';

export const TransactionAccordionTemplate = (
    props: ArrayFieldTemplateProps
) => {
    const { canAdd, items, onAddClick, readonly, uiSchema, formContext } =
        props;
    const ui = getUiOptions(uiSchema);
    const { customData, setCustomData } = formContext;

    const {
        templateId = 'default',
        tabTitle,
        titleSeparator = ' ',
        titlePaths = [],
        defaultTitle = '',
        overrideTitle,
        showAddBtn = true,
        showDeleteBtn = true,
        showRemoveItemBtn = true,
        addButtonCTA = 'Add',
        allowContentDisabled = false,
        isSinglePartyTransaction = false,
        isMultiPartyTransaction = false,
    } = ui;
    const isSimpleAccordion =
        !isSinglePartyTransaction && !isMultiPartyTransaction;

    function getItemDefault(schema?: RJSFSchema) {
        const items = schema?.items;
        if (!items || Array.isArray(items) || typeof items !== 'object')
            return undefined;
        if (!('default' in items)) return undefined;
        return (items as { default?: unknown }).default;
    }

    const itemDefault = getItemDefault(props.schema);

    const { actionData, disableAddButton, onToggleDelete } =
        useTransactionActions({
            templateId: templateId as string,
            itemsLen: items.length,
            isSingleParty: isSinglePartyTransaction as boolean,
            itemDefault,
            customData,
            setCustomData,
        });

    const { activeIndex, setActiveIndex } = useAccordionState(
        templateId as string,
        items.length
    );

    const toggle = (i: number) =>
        setActiveIndex((prev) => (prev === i ? null : i));

    const isJointOwnerPresent =
        formContext?.customData?.contractInfo?.parties?.some(
            (party: any) => party.partyRole === Roles.JOINTOWNER
        );
    if (formContext?.customData?.signatureData) {
        formContext.customData.signatureData.signatures = isJointOwnerPresent
            ? formContext.customData.signatureData.signatures
            : formContext.customData.signatureData.signatures?.filter(
                  (signature: any) => signature.signType !== Roles.JOINT_OWNER
              );
    }

    return (
        <div>
            {items.map((element, index) => {
                const formData = element.children?.props?.formData || {};
                const itemTitle = overrideTitle
                    ? overrideTitle
                    : getTitle(
                          formData,
                          index,
                          tabTitle,
                          titlePaths as any[],
                          titleSeparator,
                          formData,
                          defaultTitle as string
                      );

                const itemAction = actionData?.[index]?.action;
                const isNew = itemAction === Action.ADD;
                const isDeleted = itemAction === Action.DELETE;

                const disableContent =
                    allowContentDisabled && !isNew && !isSimpleAccordion;

                return (
                    <div key={index} className="mt-3 border-2 rounded-lg">
                        <div className="flex justify-between items-center px-4 py-3">
                            <button
                                type="button"
                                className="flex items-center gap-x-2 flex-grow"
                                onClick={() => toggle(index)}
                            >
                                <span className={styles.title}>
                                    {itemTitle as string}
                                </span>
                                {activeIndex === index ? (
                                    <ChevronDown
                                        className="simple-transition group-data-[state=open]:rotate-180"
                                        width={16}
                                        height={16}
                                    />
                                ) : (
                                    <ChevronRightIcon height={16} width={16} />
                                )}
                            </button>

                            {showRemoveItemBtn && isNew && (
                                <button
                                    type="button"
                                    onClick={element.onDropIndexClick(
                                        element.index
                                    )}
                                >
                                    <Icon type={IconType.CLOSE} />
                                </button>
                            )}

                            {!readonly &&
                                showDeleteBtn &&
                                !isNew &&
                                !isSimpleAccordion && (
                                    <CheckboxText
                                        id={`remove-${index}`}
                                        label="Remove"
                                        checked={isDeleted}
                                        onChange={(val) =>
                                            onToggleDelete(index, val)
                                        }
                                    />
                                )}
                        </div>

                        {activeIndex === index && (
                            <div
                                className={`bg-gray-50 ${
                                    disableContent && styles.disabledContent
                                }`}
                                style={{
                                    padding: activeIndex === index ? '1rem' : 0,
                                }}
                            >
                                {element.children}
                            </div>
                        )}
                    </div>
                );
            })}

            {!readonly && showAddBtn && canAdd && !isSimpleAccordion && (
                <div className="mt-3">
                    <button
                        type="button"
                        onClick={onAddClick}
                        disabled={disableAddButton}
                        className="text-cyan-800 font-bold"
                        style={{ opacity: disableAddButton ? 0.4 : 1 }}
                    >
                        <Icon type={IconType.ADD} small />
                        {typeof addButtonCTA === 'object'
                            ? String(addButtonCTA)
                            : (addButtonCTA as React.ReactNode)}
                    </button>
                </div>
            )}
        </div>
    );
};
