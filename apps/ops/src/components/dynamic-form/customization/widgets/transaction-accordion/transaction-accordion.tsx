import { WidgetProps } from '@rjsf/utils';
import React, { useRef, useState, useEffect } from 'react';

interface PanelHeights {
    [key: number]: number;
}

const TransactionAccordion: React.FC<WidgetProps> = (props) => {
    const { schema, uiSchema = {}, value = [], onChange, registry, id } = props;
    const ObjectField = registry.fields.ObjectField;
    const showAddBtn = uiSchema?.['ui:options']?.showAddBtn || false;
    const showDeleteBtn = uiSchema?.['ui:options']?.showDeleteBtn || false;
    const tabTitle = uiSchema?.['ui:options']?.tabTitle || '';

    const [activeIndex, setActiveIndex] = useState<number | null>(0);
    const [heights, setHeights] = useState<PanelHeights>({});
    const contentRefs = useRef<(HTMLDivElement | null)[]>([]);

    const toggleIndex = (index: number) => {
        setActiveIndex((prev) => (prev === index ? null : index));
    };

    const handleItemChange = (index: number, updatedItem: any) => {
        const updated = [...value];
        updated[index] = updatedItem;
        onChange(updated);
    };

    const handleRemoveToggle = (index: number, checked: boolean) => {
        const updated = [...value];
        updated[index] = {
            ...updated[index],
            action: checked ? 'DELETE' : 'UPDATE',
        };
        onChange(updated);
    };

    const handleAddItem = () => {
        const newItem = {
            action: 'ADD',
            isIrrevocable: 'No',
            isPerStirpes: 'No',
            party: {
                partyType: 'INDIVIDUAL',
                firstName: '',
                lastName: '',
                gender: 'MALE',
                preferredCommunicationType: 'EMAIL',
                emails: [
                    {
                        emailAddress: '',
                    },
                ],
                phones: [
                    {
                        dialNumber: '',
                        phoneType: 'HOME',
                    },
                ],
                addresses: [
                    {
                        addressType: 'RESIDENCE',
                        addressLine1: '',
                        addressLine2: '',
                        city: '',
                        state: '',
                        zipCode: '',
                        zipCodeExtension: '',
                    },
                ],
                identifications: [
                    {
                        identificationValue: '',
                    },
                ],
            },
            partyRole: {
                beneficiaryRole: 'PRIMARY BENEFICIARY',
            },
        };

        const updated = [...value, newItem];
        onChange(updated);
        setActiveIndex(updated.length - 1);
    };

    const setTitle = (item: any) => {
        let title = '';
        if (tabTitle == 'Owner Details') {
            title = item.partyRole;
        } else if (tabTitle == 'Beneficiary Details') {
            title = item.partyRole.beneficiaryRole;
        }
        return title;
    };

    useEffect(() => {
        if (activeIndex !== null && contentRefs.current[activeIndex]) {
            const el = contentRefs.current[activeIndex]!;
            const measured = el.scrollHeight;
            setHeights((prev) => ({
                ...prev,
                [activeIndex]: measured,
            }));
        }
    }, [activeIndex, value]);

    return (
        <div id={`${id}-accordion`}>
            {value.map((item: any, index: number) => {
                const title = setTitle(item);
                const isActive = activeIndex === index;
                const panelHeight = heights[index] || 0;
                const isMarkedForRemoval = item?.action === 'DELETE';

                return (
                    <div
                        key={index}
                        className={`border-2 border-gray-100 rounded-lg mb-4 ${
                            isMarkedForRemoval ? 'bg-gray-50' : ''
                        }`}
                    >
                        <div className="flex justify-between items-center px-4 py-3 bg-white rounded-t-lg">
                            <button
                                type="button"
                                onClick={() => toggleIndex(index)}
                                className="flex items-center gap-x-2 text-left flex-grow"
                            >
                                {isActive ? (
                                    <svg
                                        className="w-4 h-4"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M19 9l-7 7-7-7"
                                        />
                                    </svg>
                                ) : (
                                    <svg
                                        className="w-4 h-4"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9 5l7 7-7 7"
                                        />
                                    </svg>
                                )}
                                <span className="font-lato font-bold text-sm">
                                    {title}
                                </span>
                            </button>
                            {showDeleteBtn && (
                                <label className="flex items-center gap-2 text-sm font-bold">
                                    <input
                                        type="checkbox"
                                        checked={isMarkedForRemoval}
                                        onChange={(e) =>
                                            handleRemoveToggle(
                                                index,
                                                e.target.checked
                                            )
                                        }
                                        className="form-checkbox"
                                    />
                                    Remove
                                </label>
                            )}
                        </div>

                        <div
                            ref={(el: any) => (contentRefs.current[index] = el)}
                            className={`overflow-hidden ${
                                isMarkedForRemoval
                                    ? 'opacity-60 pointer-events-none'
                                    : ''
                            }`}
                            style={{
                                maxHeight: isActive ? panelHeight : 0,
                                padding: isActive ? '1rem' : '0',
                                backgroundColor: isActive
                                    ? 'rgb(248 248 248)'
                                    : 'transparent',
                            }}
                        >
                            {isActive && (
                                <ObjectField
                                    schema={schema.items as any}
                                    uiSchema={uiSchema.items || {}}
                                    formData={item}
                                    onChange={(data) =>
                                        handleItemChange(index, data)
                                    }
                                    registry={registry}
                                    id={`${id}-${index}`}
                                    name={`${index}`}
                                    disabled={isMarkedForRemoval}
                                    onBlur={() => {}}
                                    onFocus={() => {}}
                                    idSchema={{ $id: `${id}-${index}` }}
                                />
                            )}
                        </div>
                    </div>
                );
            })}
            {showAddBtn && (
                <div className="flex justify-start mt-4">
                    <button
                        type="button"
                        onClick={handleAddItem}
                        className="text-cyan-800 rounded font-lato font-bold text-sm hover:text-cyan-900 transition"
                    >
                        + Add New Beneficiary
                    </button>
                </div>
            )}
        </div>
    );
};

export default TransactionAccordion;
