import { ArrayFieldTemplateProps, getUiOptions } from '@rjsf/utils';
import { Icon, IconType } from '@zinnia/bloom/components';
import clsx from 'clsx';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import CheckboxText from '@deps/components/checkbox/checkbox-text/checkbox-text';
import { Action, Roles } from '@deps/constants/policy';
import {
    Party,
    Signatures,
} from '@deps/containers/task-container/task-handlers/types';
import { useWorkflow } from '@deps/contexts/WorkflowContainerContext';
import { ReactComponent as ChevronDown } from '@deps/styles/elements/icons/arrow/chevron-down.svg';
import { ReactComponent as ChevronRightIcon } from '@deps/styles/elements/icons/icons_outlined/chevron-right.svg';

import { useAccordionState } from './hooks/useAccordionState';
import { useTransactionActions } from './hooks/useTransactionActions';
import styles from './transaction-accordion.module.css';
import { getTitle } from './utils';
export const TransactionAccordionTemplate = (
    props: ArrayFieldTemplateProps
) => {
    const {
        canAdd,
        items,
        onAddClick,
        readonly,
        uiSchema,
        formContext,
        formData,
    } = props;

    const ui = getUiOptions(uiSchema);
    const { setCustomData } = formContext;
    const { t } = useTranslation();
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
        isEditable = true,
        maxParties,
        minPerRole,
        maxPerRole,
        validationMessage,
    } = ui;
    const isSimpleAccordion =
        !isSinglePartyTransaction && !isMultiPartyTransaction;

    const { currentStepIndex } = useWorkflow();

    const { disableAddButton, onToggleDelete } = useTransactionActions({
        setCustomData,
        isSingleParty: isSinglePartyTransaction as boolean,
        isMultiParty: isMultiPartyTransaction as boolean,
        formData,
        maxParties: maxParties as number | undefined,
    });
    const { activeIndex, setActiveIndex } = useAccordionState(
        templateId as string,
        items.length
    );

    const toggle = (i: number) =>
        setActiveIndex((prev) => (prev === i ? null : i));

    const isJointOwnerPresent =
        formContext?.customData?.contractInfo?.parties?.some(
            (party: Party) => party.partyRole === Roles.JOINTOWNER
        );
    if (formContext?.customData?.signatureData) {
        formContext.customData.signatureData.signatures = isJointOwnerPresent
            ? formContext.customData.signatureData.signatures
            : formContext.customData.signatureData.signatures?.filter(
                  (signature: Signatures) =>
                      signature.signType !== Roles.JOINT_OWNER
              );
    }

    const isIrrevocable = formContext?.customData?.actionData?.some(
        (item: any) =>
            item.isIrrevocable === true && item.action !== Action.DELETE
    );

    const shouldShowIrrevocableSignature = isIrrevocable;

    const irrevocableBeneSignature = {
        isSignedPresent: false,
        signDate: null,
        signDesignation: null,
        signType: Roles.IRREVOCABLE,
        signTypeForUI: 'Irrevocable Beneficiary',
    };

    if (formContext?.customData?.signatureData) {
        const signatures = formContext?.customData?.signatureData?.signatures;

        const hasIrrevocable = signatures.some(
            (s: any) =>
                s.signType === Roles.IRREVOCABLE ||
                s.signType === Roles.IRREVOCABLE_BENEFICIARY
        );

        if (shouldShowIrrevocableSignature && !hasIrrevocable) {
            formContext.customData.signatureData.signatures = [
                ...signatures,
                irrevocableBeneSignature,
            ];
        }
        if (!shouldShowIrrevocableSignature && hasIrrevocable) {
            formContext.customData.signatureData.signatures = signatures.filter(
                (s: any) =>
                    s.signType !== Roles.IRREVOCABLE_BENEFICIARY &&
                    s.signType !== Roles.IRREVOCABLE
            );
        }
    }

    formContext.parentActionData = formData;

    if (!formContext.customData) {
        formContext.customData = {};
    }
    formContext.customData.minPerRole = minPerRole;
    formContext.customData.maxPerRole = maxPerRole;
    formContext.customData.validationMessage = validationMessage;

    useEffect(() => {
        const { setSubmitEnabled, setSubmitDisabledStepIndex } = formContext;
        if (!setSubmitEnabled || !minPerRole) return;

        const activeByRole: Record<string, number> = {};
        (formData || []).forEach((item: any) => {
            if (item.action !== Action.DELETE) {
                const role = item.partyRole || '';
                activeByRole[role] = (activeByRole[role] || 0) + 1;
            }
        });

        let isValid = true;

        for (const [role, minCount] of Object.entries(
            minPerRole as Record<string, number>
        )) {
            if (minCount > 0 && (activeByRole[role] || 0) < minCount) {
                isValid = false;
                break;
            }
        }

        if (isValid && maxPerRole) {
            for (const [role, maxCount] of Object.entries(
                maxPerRole as Record<string, number>
            )) {
                if ((activeByRole[role] || 0) > maxCount) {
                    isValid = false;
                    break;
                }
            }
        }

        setSubmitEnabled(isValid);
        if (setSubmitDisabledStepIndex) {
            setSubmitDisabledStepIndex(currentStepIndex);
        }
    }, [formData, minPerRole, maxPerRole, formContext, currentStepIndex]);

    return (
        <div>
            {items.map((element, index) => {
                const formDataEle = element.children?.props?.formData || {};
                const itemTitle = overrideTitle
                    ? overrideTitle
                    : getTitle(
                          formDataEle,
                          index,
                          tabTitle,
                          titlePaths as any[],
                          titleSeparator,
                          defaultTitle as string
                      );

                const itemAction = formData?.[index]?.action;
                const isNew = itemAction === Action.ADD;
                const isDeleted = itemAction === Action.DELETE;

                const disableContent =
                    isDeleted ||
                    !isEditable ||
                    (allowContentDisabled && !isNew && !isSimpleAccordion);

                return (
                    <div key={index} className="mt-3 border-2 rounded-lg">
                        <div className="flex justify-between items-center px-4 py-3">
                            <button
                                type="button"
                                className={styles.row}
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
                                        label={t('allFields.remove')}
                                        checked={isDeleted}
                                        onChange={(val) =>
                                            onToggleDelete(index, val)
                                        }
                                    />
                                )}
                        </div>

                        {activeIndex === index && (
                            <div
                                className={clsx(
                                    styles.container,
                                    activeIndex === index && styles.active,
                                    disableContent && styles.disabledContent
                                )}
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
                        className={styles.highlightText}
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
