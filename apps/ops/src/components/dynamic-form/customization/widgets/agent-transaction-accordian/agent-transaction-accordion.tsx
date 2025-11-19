import { WidgetProps } from '@rjsf/utils';
import { toTitleCase } from '@xd/utils/dist';
import dayjs from 'dayjs';
import { useRef, useState, useEffect } from 'react';

import CheckboxText from '@deps/components/checkbox/checkbox-text/checkbox-text';
import { ZAHARA_DATE_FORMAT } from '@deps/helpers/date.helpers';
import { PartyType } from '@deps/models/policy/sor-policy';

import styles from './agent-transaction-accordion.module.css';
import { Action } from './agent-transaction-accordion.types';

type PanelHeights = {
    [key: number]: number;
};

const AgentTransactionAccordion = ({
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

    const [activeIndex, setActiveIndex] = useState<number | null>(0);
    const [heights, setHeights] = useState<PanelHeights>({});

    const contentRefs = useRef<(HTMLDivElement | null)[]>([]);
    const valueRef = useRef(value);
    const originalDataRef = useRef<any[]>([]);

    // Keep track of original data on first load
    useEffect(() => {
        valueRef.current = value;
        if (originalDataRef?.current?.length === 0 && value?.length > 0) {
            originalDataRef.current = value.map((item: any) => ({ ...item }));
        }
    }, [value]);

    const toggleIndex = (index: number) => {
        setActiveIndex((prev) => (prev === index ? null : index));
    };

    const handleItemChange = (index: number, updatedItem: any) => {
        const updatedList = [...valueRef.current];
        const originalItem = originalDataRef.current[index];

        if (updatedItem.action === Action.ADD) {
            updatedList[index] = updatedItem;
        } else if (originalItem) {
            // Only mark update if editable fields changed
            const originalPartyPercentage = originalItem.party?.partyPercentage;
            const updatedPartyPercentage = updatedItem.party?.partyPercentage;
            const hasChanged =
                originalPartyPercentage !== updatedPartyPercentage;

            updatedList[index] = {
                ...updatedItem,
                action: hasChanged ? Action.UPDATE : Action.NONE,
            };
        } else {
            updatedList[index] = updatedItem;
        }

        onChange(updatedList);
    };

    const handleRemoveToggle = (index: number, checked: boolean) => {
        const updatedList = [...valueRef.current];
        const currentItem = updatedList[index];
        const originalItem = originalDataRef.current[index];

        if (checked) {
            updatedList[index] = {
                ...currentItem,
                action: Action.DELETE,
                party: {
                    ...currentItem.party,
                    endDate: dayjs.utc().format(ZAHARA_DATE_FORMAT),
                },
            };
        } else {
            if (originalItem) {
                const currentPartyPercentage =
                    currentItem.party?.partyPercentage;
                const originalPartyPercentage =
                    originalItem.party?.partyPercentage;
                const hasChanged =
                    currentPartyPercentage !== originalPartyPercentage;

                updatedList[index] = {
                    ...currentItem,
                    action: hasChanged ? Action.UPDATE : Action.NONE,
                    party: {
                        ...currentItem.party,
                        endDate: originalItem.party.endDate,
                    },
                };
            } else {
                updatedList[index] = {
                    ...currentItem,
                    action: Action.NONE,
                    party: {
                        ...currentItem.party,
                        endDate: null,
                    },
                };
            }
        }

        onChange(updatedList);
    };

    const handleAddItem = () => {
        const currentDate = dayjs.utc().format(ZAHARA_DATE_FORMAT);
        const allAgents = [...valueRef.current];

        // Mark existing agents for deletion depending on carrier and role
        const existingAgents = allAgents.filter(
            (agent) => agent.action !== Action.ADD
        );
        const updatedExistingAgents = existingAgents.map((agent) => {
            if (formContext?.customData?.carrier === 'WELB') {
                return {
                    ...agent,
                    action: Action.DELETE,
                    party: { ...agent.party, endDate: currentDate },
                };
            }
            if (
                formContext?.customData?.carrier === 'FNWL' &&
                agent.partyRole === 'PRIMARYSERVICINGAGENT'
            ) {
                return {
                    ...agent,
                    action: Action.DELETE,
                    party: { ...agent.party, endDate: currentDate },
                };
            }
            return agent;
        });

        const newItem = {
            action: Action.ADD,
            partyRole: '',
            party: {
                partyType: PartyType.INDIVIDUAL,
                startDate: currentDate,
                agentExternalId: '',
                partyPercentage: '',
            },
        };

        const updatedList = [
            ...updatedExistingAgents,
            ...allAgents.filter((a) => a.action === Action.ADD),
            newItem,
        ];

        onChange(updatedList);
        setActiveIndex(updatedList.length - 1);
    };

    const setTitle = (item: any) => {
        let title = `Ext. ID: ${item.party.agentExternalId}`;
        if (tabTitle === 'Agent Details') {
            const firstName = item?.party?.firstName?.trim?.() || '';
            const lastName = item?.party?.lastName?.trim?.() || '';
            const fullName = `${firstName} ${lastName}`.trim();
            title =
                toTitleCase(fullName) ||
                `Ext. ID: ${item.party.agentExternalId}`;
        }
        return title;
    };

    const handleRemoveItem = (index: number) => {
        const updatedList = [...valueRef.current];
        updatedList.splice(index, 1);
        onChange(updatedList);
        setActiveIndex(null);
    };

    const getUiSchemaForAgent = (item: any) => {
        const currentUiSchema = JSON.parse(
            JSON.stringify(uiSchema.items || {})
        );
        if (item?.action === Action.ADD) return currentUiSchema;
        return {
            ...currentUiSchema,
            party: {
                ...currentUiSchema?.party,
                'ui:readonly': true,
                partyPercentage: {
                    ...currentUiSchema?.party?.partyPercentage,
                    'ui:readonly': readonly ? true : false,
                },
            },
            partyRole: {
                ...currentUiSchema?.partyRole,
                'ui:readonly': true,
            },
        };
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
                const title = setTitle(item);
                const isActive = activeIndex === index;
                const panelHeight = heights[index] || 0;
                const isMarkedForRemoval = item?.action === Action.DELETE;
                const isAgentAddition = item?.action === Action.ADD;

                return (
                    <div key={`accordion-item-${index}`}>
                        {hideAccordion ? null : (
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
                                    {isAgentAddition && !readonly && (
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
                                        !isAgentAddition &&
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
                                            uiSchema={getUiSchemaForAgent(item)}
                                            formData={item}
                                            onChange={(data) => {
                                                handleItemChange(index, data);
                                            }}
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
                        + Add an Agent
                    </button>
                </div>
            )}
        </div>
    );
};

export default AgentTransactionAccordion;
