// TODO: Generalize this widget for other transaction types beyond agent changes

import { WidgetProps } from '@rjsf/utils';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import Field, {
    FieldSize,
    FieldType,
    FieldVariant,
} from '@deps/components/fields/field';
import { TranslationFiles } from '@deps/config/translations';
import { PartyRole } from '@zinnia/api-types/types/sor';

const ALLOWED_PERCENTAGE_AGENT = {
    HUNDRED: 100,
    ZERO: 0,
};

interface ValidationRule {
    roles: PartyRole[];
    allowedTotals: number[];
}

const AGENT_VALIDATION_RULES: ValidationRule[] = [
    {
        roles: [PartyRole.PRIMARYWRITINGAGENT],
        allowedTotals: [ALLOWED_PERCENTAGE_AGENT.HUNDRED],
    },
    {
        roles: [PartyRole.PRIMARYSERVICINGAGENT],
        allowedTotals: [
            ALLOWED_PERCENTAGE_AGENT.ZERO,
            ALLOWED_PERCENTAGE_AGENT.HUNDRED,
        ],
    },
];

const filterPartiesByRole = (parties: any[], role: PartyRole) => {
    return (
        parties?.filter(
            (party: any) =>
                party.action !== 'DELETE' && party.partyRole === role
        ) || []
    );
};

const calculateTotalAllocation = (parties: any[]): number => {
    return parties.reduce((acc: number, party: any) => {
        return acc + Number(party.party?.partyPercentage || 0);
    }, 0);
};

const isAllocationValid = (
    parties: any[],
    total: number,
    allowedTotals: number[]
): boolean => {
    return parties.length === 0 || allowedTotals.includes(total);
};

const validateAllocation = (partyUpdates: any): boolean => {
    if (!partyUpdates) return true;

    return AGENT_VALIDATION_RULES.every((rule) => {
        return rule.roles.every((role) => {
            const parties = filterPartiesByRole(partyUpdates, role);
            const total = calculateTotalAllocation(parties);
            return isAllocationValid(parties, total, rule.allowedTotals);
        });
    });
};

const AgentPercentageWidget = ({
    id,
    value,
    disabled,
    readonly,
    required,
    onChange,
    placeholder,
    formContext,
}: WidgetProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: 'agentChangeDetail.agentDetails',
    });

    const actionData = formContext.customData.partyUpdates;
    const partyPercentages = Array.isArray(actionData)
        ? actionData.map((item) => item?.party?.partyPercentage).join(',')
        : '';

    const [isValid, setIsValid] = useState(true);
    const { setSubmitEnabled } = formContext;

    useEffect(() => {
        const validationResult = validateAllocation(actionData);
        setIsValid(validationResult);
        if (setSubmitEnabled) {
            setSubmitEnabled(validationResult);
        }
    }, [partyPercentages, actionData, setSubmitEnabled]);

    return readonly ? (
        value
    ) : (
        <div className="max-w-sm flex w-full flex-col">
            <Field
                name={id}
                value={value}
                trailing={<div>%</div>}
                id={id}
                disabled={disabled}
                required={required}
                readOnly={readonly}
                placeholder={placeholder}
                onChange={(e) => onChange(e.target.value)}
                size={FieldSize.Small}
                type={FieldType.BaseActive}
                variant={!isValid ? FieldVariant.Error : FieldVariant.Default}
                message={!isValid ? t('allocationErr') : ''}
            />
        </div>
    );
};

export default AgentPercentageWidget;
