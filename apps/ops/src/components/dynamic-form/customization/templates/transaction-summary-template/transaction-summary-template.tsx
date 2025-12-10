import { FieldTemplateProps } from '@rjsf/utils';
import { Tag, TagVariant } from '@zinnia/bloom/components';
import { useTranslation } from 'next-i18next';
import React, { useEffect, useMemo, useState } from 'react';

import AssistiveText, {
    AssistiveTextVariant,
} from '@deps/components/assistive-text/assistive-text';
import BannerAlert, {
    BannerVariant,
} from '@deps/components/banner-alert/banner-alert';
import CheckboxText from '@deps/components/checkbox/checkbox-text/checkbox-text';
import { Label, LabelVariant } from '@deps/components/label/label';
import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import { TranslationFiles } from '@deps/config/translations';
import { getTagVariant } from '@deps/containers/bene-change/components/steps/summary/summary-step.helpers';
import { useOptimizely } from '@deps/contexts/OptimizelyContext';
import { TaskType } from '@deps/models/case/task';
import { TransactionResponseStatus } from '@deps/queries/api/bpm';
import { FEATURE_FLAGS } from '@deps/utils/optimizely/flags';

import {
    getRoleLabel,
    fetchValidationSummary,
    getTransactionPartyDisplayValue,
    formatAgentType,
    getPartyMeta,
} from './transaction-summary-template.utils';

import type { SummaryItem } from './transaction-summary-template.utils';

interface ValidationResult {
    error: string;
    errorCode: string;
    resolution: string;
}

interface ValidationResponse {
    status: string | number;
    validationResult?: ValidationResult[];
}

interface SummaryField {
    key: string;
    label: string;
}

interface SummarySection {
    label?: string;
    fields: SummaryField[];
}

export const TransactionSummaryTemplate = (props: FieldTemplateProps) => {
    function renderValidationErrors() {
        return (
            <div className="mt-10 flex flex-col gap-6">
                {validationResponse?.validationResult ? (
                    validationResponse.validationResult.map(
                        (validationResult: ValidationResult) => {
                            const { error, errorCode, resolution } =
                                validationResult;
                            return (
                                <BannerAlert
                                    canDismiss={false}
                                    key={`bpm-validation-banner-${errorCode}`}
                                    variant={BannerVariant.Error}
                                >
                                    <b>{error}</b> {resolution}
                                </BannerAlert>
                            );
                        }
                    )
                ) : (
                    <BannerAlert
                        canDismiss={false}
                        variant={BannerVariant.Error}
                    >
                        <b>{t('internalServerError')}</b>
                    </BannerAlert>
                )}
                <div className="flex flex-wrap gap-8 max-md:flex-col">
                    <CheckboxText
                        label={t('submitWithErrorsText')}
                        checked={isChecked}
                        onChange={handleCheckboxChange}
                    />
                </div>
            </div>
        );
    }

    const { t } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: 'transactionSummary',
    });
    const { formContext = {}, uiSchema = {}, readonly } = props;
    const url = formContext?.customData?.validationUrl;
    const { issueResolved } = formContext?.customData || {};
    const customData = formContext?.customData;

    const [validationResponse, setValidationResponse] =
        useState<ValidationResponse | null>(null);
    const [_validationError, setValidationError] = useState<string | null>(
        null
    );
    const [loading, setLoading] = useState(false);
    const [isChecked, setIsChecked] = useState<boolean>(false);
    const [showSelectionError, setShowSelectionError] =
        useState<boolean>(false);
    const { featureFlags } = useOptimizely();

    const handleCheckboxChange = () => {
        const newChecked = !isChecked;
        setIsChecked(newChecked);
        if (formContext.setValidationSummary) {
            if (newChecked) {
                formContext.setValidationSummary(null);
                setShowSelectionError(false);
            } else if (
                validationResponse &&
                validationResponse.status !== TransactionResponseStatus.Success
            ) {
                formContext.setValidationSummary(validationResponse);
            }
        }
    };
    const invokeNewBeneChangeApi =
        featureFlags[FEATURE_FLAGS.BENE_CHANGE_NEW_API];

    useEffect(() => {
        if (!url || !customData || !issueResolved || readonly) return;
        setLoading(true);
        setValidationError(null);
        fetchValidationSummary(url, customData, invokeNewBeneChangeApi)
            .then((summary) => {
                setValidationResponse(summary);
                setLoading(false);
                if (formContext.setValidationSummary) {
                    formContext.setValidationSummary(summary);
                }
            })
            .catch((err) => {
                setValidationError(err?.message || t('failedToFetch'));
                setLoading(false);
                if (formContext.setValidationSummary) {
                    formContext.setValidationSummary(null);
                }
            });
    }, [
        url,
        invokeNewBeneChangeApi,
        customData,
        issueResolved,
        readonly,
        formContext,
        t,
    ]);

    const validationSucceeded = useMemo(
        () => validationResponse?.status === TransactionResponseStatus.Success,
        [validationResponse]
    );

    const dataKey =
        uiSchema?.['ui:options']?.dataKey ||
        formContext.customData?.dataKey ||
        'actionData';
    const dataSource =
        formContext.customData?.[dataKey] || formContext[dataKey] || [];

    if (loading) {
        return <div>{t('loading')}</div>;
    }

    if (!Array.isArray(dataSource) || dataSource.length === 0) {
        return <div>{t('noSummary')}</div>;
    }

    const taskType = formContext.customData?.taskType;
    return (
        <div id={'id'} className="space-y-8">
            {!readonly && (
                <p className="mb-3 font-primary text-sm">
                    {validationSucceeded
                        ? t('successMessage')
                        : t('errorMessage')}
                </p>
            )}
            {(dataSource as SummaryItem[]).map(
                (item: SummaryItem, idx: number) => {
                    const {
                        party,
                        fullName,
                        addressStr,
                        phoneStr,
                        emailStr,
                        ssn,
                        gender,
                        dob,
                        relationshipToParty,
                    } = getPartyMeta(item);
                    let allocation = '-';
                    if (taskType === TaskType.Initiate_BeneChange_Transaction) {
                        allocation =
                            party.beneficiaryPercentage != null
                                ? `${party.beneficiaryPercentage}%`
                                : '-';
                    } else if (taskType === TaskType.Agent_Change_Detail) {
                        if (item.action === 'UPDATE' || item.action === 'ADD') {
                            allocation =
                                party.partyPercentage != null
                                    ? `${party.partyPercentage}%`
                                    : '-';
                        } else {
                            allocation =
                                party.agentPercentage != null
                                    ? `${party.agentPercentage}%`
                                    : '-';
                        }
                    }
                    const isPerStirpes =
                        item.isPerStirpes === true ? 'Yes' : 'No';
                    const isIrrevocable =
                        item.isIrrevocable === true ? 'Yes' : 'No';
                    const { tagVariant, tagText } = getTagVariant(
                        item.action ?? 'NONE',
                        t
                    );
                    const role = item.partyRole
                        ? getRoleLabel(item.partyRole, t, taskType)
                        : '';

                    const sectionsRaw = uiSchema?.['ui:options']?.sections;
                    const sections = Array.isArray(sectionsRaw)
                        ? sectionsRaw
                        : [];

                    const getFieldValue = (fieldKey: string) => {
                        if (fieldKey in item) return item[fieldKey];
                        if (item.party && fieldKey in item.party)
                            return item.party[fieldKey];
                        return '-';
                    };

                    const fieldValueExtractors: Record<
                        string,
                        (args: {
                            field: SummaryField;
                            item: SummaryItem;
                        }) => string
                    > = {
                        agentType: ({ item }) => formatAgentType(item),
                        address: () => addressStr,
                        phone: () => phoneStr,
                        email: () => emailStr,
                        ssn: () => ssn,
                        gender: () => gender,
                        dateOfBirth: () => dob,
                        beneficiaryPercentage: () => allocation,
                        allocation: () => allocation,
                        relationshipToParty: () => relationshipToParty,
                        isPerStirpes: () => isPerStirpes,
                        isIrrevocable: () => isIrrevocable,
                    };

                    function getSummaryFieldValue(
                        field: SummaryField,
                        item: SummaryItem
                    ) {
                        const extractor = fieldValueExtractors[field.key];
                        if (extractor) {
                            return extractor({ field, item });
                        }
                        return getFieldValue(field.key);
                    }
                    return (
                        <div
                            key={idx}
                            className="border border-gray-200 rounded-lg p-8 bg-white shadow-sm mb-8"
                        >
                            <div className="mb-2">
                                <div className="flex items-center gap-4">
                                    <Typography variant={TypographyVariant.H2}>
                                        {getTransactionPartyDisplayValue({
                                            taskType,
                                            fullName,
                                            item,
                                        })}
                                    </Typography>
                                    {tagText && (
                                        <Tag
                                            text={tagText}
                                            className="m-1 mx-3 h-6"
                                            variant={tagVariant as TagVariant}
                                        />
                                    )}
                                </div>
                                {role && (
                                    <div className="mt-1">
                                        <Tag text={role} className="my-1" />
                                    </div>
                                )}
                            </div>
                            {(sections as SummarySection[]).map(
                                (section: SummarySection, sIdx: number) => (
                                    <React.Fragment key={sIdx}>
                                        {section.label && (
                                            <Typography
                                                variant={TypographyVariant.H2}
                                                className="mb-2"
                                            >
                                                {section.label}
                                            </Typography>
                                        )}
                                        <div className="flex flex-row gap-x-16 mb-2">
                                            {(
                                                section.fields as SummaryField[]
                                            ).map((field: SummaryField) => {
                                                const value =
                                                    getSummaryFieldValue(
                                                        field,
                                                        item
                                                    );
                                                return (
                                                    <div key={field.key}>
                                                        <Label
                                                            className="h-6 leading-4.5"
                                                            label={field.label}
                                                            variant={
                                                                LabelVariant.FieldLabel
                                                            }
                                                        />
                                                        <div className="text-sm whitespace-pre-line font-semibold">
                                                            {value ?? '-'}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        {sIdx !== sections.length - 1 && (
                                            <hr className="my-6 border-gray-200" />
                                        )}
                                    </React.Fragment>
                                )
                            )}
                        </div>
                    );
                }
            )}

            {showSelectionError && !isChecked && (
                <AssistiveText
                    className="mt-2"
                    variant={AssistiveTextVariant.Error}
                    text={t('missingCheckToConfirm')}
                />
            )}

            {!readonly && !validationSucceeded && renderValidationErrors()}
            {showSelectionError && !isChecked && (
                <AssistiveText
                    className="mt-2"
                    variant={AssistiveTextVariant.Error}
                    text={t('missingCheckToConfirm')}
                />
            )}
        </div>
    );
};
