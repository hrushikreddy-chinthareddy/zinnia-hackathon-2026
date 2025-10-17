import { WidgetProps } from '@rjsf/utils';
import { useRef, useState, useEffect } from 'react';

import CheckboxText from '@deps/components/checkbox/checkbox-text/checkbox-text';

import styles from './transaction-accordion.module.css';
import { Action, PanelHeights, TabTitle } from './types';

const TransactionAccordion = ({
    schema,
    uiSchema = {},
    value = [],
    onChange,
    registry,
    options,
    formContext,
    readonly,
}: WidgetProps) => {
    const { ObjectField } = registry.fields;
    const { tabTitle, showAddBtn, showDeleteBtn, hideAccordion } = options;
    const isIrrevocableBene =
        formContext.customData.signatureData?.isIrrevocableBene || false;

    const [activeIndex, setActiveIndex] = useState<number | null>(0);
    const [heights, setHeights] = useState<PanelHeights>({});
    const contentRefs = useRef<(HTMLDivElement | null)[]>([]);

    const toggleIndex = (index: number) => {
        setActiveIndex((prev) => (prev === index ? null : index));
    };

    const deepEqual = (obj1: any, obj2: any): boolean => {
        return JSON.stringify(obj1) === JSON.stringify(obj2);
    };

    const handleItemChange = (index: number, updatedItem: any) => {
        const updatedList = [...value];
        const previousItem = updatedList[index];
        const hasChanged = !deepEqual(previousItem, updatedItem);

        if (updatedItem.party?.partyType === 'TRUST') {
            updatedItem.party.supportingDocumentAttached =
                updatedItem.party.supportingDocumentAttached ?? false;
        }

        updatedList[index] = {
            ...updatedItem,
            action: hasChanged ? Action.UPDATE : Action.NONE,
        };

        onChange(updatedList);
    };

    const handleRemoveToggle = (index: number, checked: boolean) => {
        const updatedList = [...value];
        updatedList[index] = {
            ...updatedList[index],
            action: checked ? Action.DELETE : Action.NONE,
        };
        onChange(updatedList);
    };

    const handleAddItem = () => {
        const newItem = {
            action: Action.ADD,
            actionType: 'BENE_CHANGE',
            isIrrevocable: false,
            isPerStirpes: false,
            party: {
                partyType: 'INDIVIDUAL',
                firstName: '',
                lastName: '',
                middleName: null,
                gender: 'MALE',
                preferredCommunicationType: 'EMAIL',
                supportingDocumentAttached: false,
                emails: [
                    {
                        emailAddress: null,
                    },
                ],
                phones: [
                    {
                        dialNumber: null,
                        phoneType: 'HOME',
                    },
                ],
                addresses: [
                    {
                        addressType: 'RESIDENCE',
                        addressLine1: '',
                        addressLine2: null,
                        city: '',
                        state: '',
                        zipCode: '',
                        zipCodeExtension: null,
                    },
                ],
                identifications: [
                    {
                        identificationValue: null,
                        IdentificationType: 'SSN',
                    },
                ],
            },
            partyRole: {
                partyRole: 'PRIMARYBENEFICIARY',
                relationshipToParty: 'OTHER',
            },
        };

        const updatedList = [...value, newItem];
        onChange(updatedList);
        setActiveIndex(updatedList.length - 1);
    };

    const setTitle = (item: any, index: number) => {
        let title = `Item ${index + 1}`;
        if (tabTitle == TabTitle.OwnerDetails) {
            title = item.partyRole;
        } else if (tabTitle == TabTitle.BeneficiaryDetails) {
            title =
                item.partyRole.partyRole === 'PRIMARYBENEFICIARY'
                    ? 'Primary Beneficiary'
                    : 'Contingent Beneficiary';
        } else if (tabTitle == TabTitle.Signature) {
            title =
                item.signType === 'OWNER'
                    ? 'Owner'
                    : item.signType === 'JOINT_OWNER'
                    ? 'Joint Owner'
                    : 'Irrevocable Beneficiary';
        }
        return title;
    };

    const handleRemoveItem = (index: number) => {
        const updatedList = [...value];
        updatedList.splice(index, 1);
        onChange(updatedList);
        setActiveIndex(null);
    };

    const getConditionalUiSchema = (role: string) => {
        let currentUiSchema = JSON.parse(JSON.stringify(uiSchema.items));

        if (role === 'Joint Owner') {
            currentUiSchema = {
                ...currentUiSchema,
                phones: {
                    ...currentUiSchema?.phones,
                    'ui:widget': 'hidden',
                },
                addresses: {
                    ...currentUiSchema?.addresses,
                    'ui:widget': 'hidden',
                },
                emails: {
                    ...currentUiSchema?.emails,
                    'ui:widget': 'hidden',
                },
            };
        }

        return currentUiSchema;
    };

    useEffect(() => {
        if (activeIndex !== null) {
            const element = contentRefs.current[activeIndex];
            if (element) {
                const elementHeight = element.scrollHeight;
                setHeights((prev) => ({
                    ...prev,
                    [activeIndex]: elementHeight,
                }));
            }
        }
    }, [activeIndex, value]);

    return (
        <div>
            {value.map((item: any, index: number) => {
                const title = setTitle(item, index);
                const isActive = activeIndex === index;
                const panelHeight = heights[index] || 0;
                const isMarkedForRemoval = item?.action === Action.DELETE;
                const isBeneAddition = item?.action === Action.ADD;
                const hideIrrevocableSignType =
                    item.signType === 'IRREVOCABLE' && !isIrrevocableBene;
                const updatedUiSchema = getConditionalUiSchema(item?.partyRole);

                return (
                    <div key={`accordion-item-${index}`}>
                        {hideAccordion && hideIrrevocableSignType ? null : (
                            <div
                                className={`border-2 border-gray-100 rounded-lg mt-3 ${
                                    isMarkedForRemoval ? 'bg-gray-50' : ''
                                }`}
                            >
                                <div className="flex justify-between items-center px-4 py-3">
                                    <button
                                        type="button"
                                        onClick={() => toggleIndex(index)}
                                        className="flex items-center gap-x-2 flex-grow"
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
                                            {title}
                                        </span>
                                    </button>
                                    {isBeneAddition && (
                                        <button
                                            onClick={() =>
                                                handleRemoveItem(index)
                                            }
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
                                    {showDeleteBtn &&
                                        !isBeneAddition &&
                                        !readonly && (
                                            <CheckboxText
                                                id={`remove-${index}`}
                                                label="Remove"
                                                checked={isMarkedForRemoval}
                                                onChange={(checked) =>
                                                    handleRemoveToggle(
                                                        index,
                                                        checked
                                                    )
                                                }
                                            />
                                        )}
                                </div>
                                <div
                                    ref={(element: any) =>
                                        (contentRefs.current[index] = element)
                                    }
                                    className={`overflow-hidden bg-gray-50 ${
                                        isMarkedForRemoval
                                            ? 'opacity-60 pointer-events-none'
                                            : ''
                                    }`}
                                    style={{
                                        maxHeight: isActive ? panelHeight : 0,
                                        padding: isActive ? '1rem' : '0',
                                    }}
                                >
                                    {isActive && (
                                        <ObjectField
                                            schema={schema.items as any}
                                            uiSchema={updatedUiSchema}
                                            formData={item}
                                            onChange={(data) =>
                                                handleItemChange(index, data)
                                            }
                                            registry={registry}
                                            id={`${index}`}
                                            name={`${index}`}
                                            disabled={isMarkedForRemoval}
                                            onBlur={() => {}}
                                            onFocus={() => {}}
                                            idSchema={{ $id: `${index}` }}
                                            readonly={readonly}
                                        />
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                );
            })}
            {showAddBtn && !readonly && (
                <div className="flex justify-start mt-3">
                    <button
                        type="button"
                        onClick={handleAddItem}
                        className="text-cyan-800 text-sm font-bold hover:text-cyan-900"
                    >
                        + Add New Beneficiary
                    </button>
                </div>
            )}
        </div>
    );
};

export default TransactionAccordion;
