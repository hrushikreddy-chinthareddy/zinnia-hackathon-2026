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
    const {
        tabTitle,
        showAddBtn,
        showDeleteBtn,
        hideAccordion,
        showRemoveItemBtn,
    } = options;
    const isIrrevocableBene =
        formContext?.customData?.signatureData?.isIrrevocableBene || false;

    const isJointOwnerPresent =
        formContext?.customData?.contractInfo?.parties?.some(
            (party: any) => party.partyRole === 'JOINTOWNER'
        );
    if (formContext?.customData?.signatureData) {
        formContext.customData.signatureData.signatures = isJointOwnerPresent
            ? formContext.customData.signatureData.signatures
            : formContext.customData.signatureData.signatures?.filter(
                  (signature: any) => signature.signType !== 'JOINT_OWNER'
              );
    }
    const [activeIndex, setActiveIndex] = useState<number | null>(0);
    const [heights, setHeights] = useState<PanelHeights>({});
    const contentRefs = useRef<(HTMLDivElement | null)[]>([]);
    const valueRef = useRef(value);
    const originalDataRef = useRef<any[]>([]);

    const toggleIndex = (index: number) => {
        setActiveIndex((prev) => (prev === index ? null : index));
    };

    const deepEqual = (obj1: any, obj2: any): boolean => {
        return JSON.stringify(obj1) === JSON.stringify(obj2);
    };

    const handleItemChange = (index: number, updatedItem: any) => {
        const updatedList = [...valueRef?.current];
        const originalItem = originalDataRef?.current?.[index];
        const hasChanged = !deepEqual(originalItem, updatedItem);

        if (updatedItem.party?.partyType === 'TRUST') {
            updatedItem.party.supportingDocumentAttached =
                updatedItem.party.supportingDocumentAttached ?? false;
            updatedItem.party.dateOfBirth = null;
        }

        if (updatedItem.party?.partyType === 'INDIVIDUAL') {
            updatedItem.party.trustDate = null;
        }

        if (updatedItem.party?.partyType === 'ORGANIZATION') {
            updatedItem.party.dateOfBirth = null;
            updatedItem.party.trustDate = null;
        }

        updatedList[index] = {
            ...updatedItem,
            action: updatedItem.partyRole?.partyId
                ? hasChanged
                    ? Action.UPDATE
                    : Action.NONE
                : Action.ADD,
            party: {
                ...updatedItem.party,
                firstName:
                    updatedItem.party?.partyType === 'INDIVIDUAL'
                        ? updatedItem.party?.firstName || null
                        : null,
                lastName: updatedItem.party?.lastName || null,
                middleName:
                    updatedItem.party?.partyType === 'INDIVIDUAL'
                        ? updatedItem.party?.middleName || null
                        : null,
                fullName: [
                    updatedItem.party?.prefix,
                    updatedItem.party?.firstName,
                    updatedItem.party?.middleName,
                    updatedItem.party?.lastName,
                    updatedItem.party?.suffix,
                ]
                    .filter(Boolean)
                    .join(' '),
            },
        };

        onChange(updatedList);
    };

    const handleRemoveToggle = (index: number, checked: boolean) => {
        const updatedList = [...valueRef?.current];
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
                entityType: 'UNKNOWN',
                emails: [
                    {
                        emailAddress: null,
                        emailType: 'PERSONAL',
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
                        identificationType: 'SSN',
                    },
                ],
            },
            partyRole: {
                partyRole: 'PRIMARYBENEFICIARY',
                relationshipToParty: 'OTHER',
            },
        };

        const updatedList = [...valueRef?.current, newItem];
        onChange(updatedList);
        setActiveIndex(updatedList.length - 1);
    };

    const setTitle = (item: any, index: number) => {
        let title = `Item ${index + 1}`;
        if (tabTitle == TabTitle.OwnerDetails) {
            title = item.partyRole == 'OWNER' ? 'Owner' : 'Joint Owner';
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

    const getConditionalUiSchema = (role: string, title: string) => {
        let currentUiSchema = JSON.parse(JSON.stringify(uiSchema.items));

        if (role === 'JOINTOWNER') {
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
        if (title === 'Irrevocable Beneficiary') {
            currentUiSchema = {
                ...currentUiSchema,
                signDesignation: {
                    ...currentUiSchema?.signDesignation,
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

    // Keep track of original data on first load
    useEffect(() => {
        valueRef.current = value;
        if (originalDataRef?.current?.length === 0 && value.length > 0) {
            originalDataRef.current = value.map((item: any) => ({ ...item }));
        }
    }, [value]);

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
                const updatedUiSchema = getConditionalUiSchema(
                    item?.partyRole,
                    title
                );

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
                                    {isBeneAddition && showRemoveItemBtn && (
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
