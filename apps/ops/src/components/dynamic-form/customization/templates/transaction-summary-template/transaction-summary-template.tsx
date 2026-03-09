import { FieldTemplateProps, getUiOptions } from '@rjsf/utils';
import { Icon, IconType, Tag, TagVariant } from '@zinnia/bloom/components';
import { useTranslation } from 'next-i18next';
import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';

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
import { TransactionResponse } from '@zinnia/api-types/types/bpm';

import styles from './transaction-summary-template.module.css';
import {
    fetchValidationSummary,
    getTransactionPartyDisplayValue,
    formatAgentType,
    formatTypeLabel,
    getPartyMeta,
    formattedAddress,
    formattedPhone,
    formattedEmail,
    groupPartiesByPartyId,
} from './transaction-summary-template.utils';
import { TabTitle } from '../transaction-accordion/types';

import type {
    SummaryItem,
    Address,
    Phone,
    Email,
} from './transaction-summary-template.utils';

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
    visibleWhen?: Record<string, string | string[]>;
}

interface SummarySection {
    label?: string;
    layout?: 'vertical' | 'horizontal';
    fields: SummaryField[];
}

export const TransactionSummaryTemplate = (props: FieldTemplateProps) => {
    const tabTitle = props.uiSchema?.['ui:options']?.title;
    const isFormReviewTab = tabTitle === TabTitle.FormReview;

    function renderValidationErrors() {
        return (
            <div className={styles.validationErrors}>
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
                <div className={styles.validationCheckbox}>
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
    const { formContext = {}, uiSchema = {}, schema = {}, readonly } = props;
    const url = formContext?.customData?.validationUrl;
    const { issueResolved } = formContext?.customData || {};
    const customData = formContext?.customData;

    const [expandedCardIndex, setExpandedCardIndex] = useState<number>(0); // First card expanded by default

    const toggleCard = (index: number) => {
        setExpandedCardIndex((prevIndex) => (prevIndex === index ? -1 : index));
    };

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

    const stableCustomData = useMemo(
        () => formContext.customData,
        [formContext.customData]
    );

    const previousSummaryRef = useRef<TransactionResponse | null>(null);

    const setValidationSummary = useCallback(
        (summary: TransactionResponse | null) => {
            const prev = previousSummaryRef.current;
            if (!summary && !prev) return;
            if (
                summary &&
                prev &&
                JSON.stringify(summary) === JSON.stringify(prev)
            ) {
                return;
            }
            previousSummaryRef.current = summary;
            if (formContext.setValidationSummary) {
                formContext.setValidationSummary(summary);
            }
        },
        [formContext]
    );

    useEffect(() => {
        if (
            readonly ||
            !url ||
            !stableCustomData ||
            !issueResolved ||
            isFormReviewTab
        )
            return;
        setLoading(true);
        setValidationError(null);

        fetchValidationSummary(url, stableCustomData, invokeNewBeneChangeApi)
            .then((summary) => {
                setValidationResponse(summary);
                setLoading(false);
                setValidationSummary(summary as TransactionResponse);
            })
            .catch((err) => {
                setValidationError(err?.message || t('failedToFetch'));
                setLoading(false);
                setValidationSummary(null);
            });
    }, [
        readonly,
        url,
        stableCustomData,
        issueResolved,
        isFormReviewTab,
        invokeNewBeneChangeApi,
        setValidationSummary,
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

    const resolveNestedKey = (obj: any, path: string) =>
        path.split('.').reduce((acc: any, key: string) => acc?.[key], obj);

    const taskType = formContext.customData?.taskType;
    const { label: showLabel, title: titleText = schema?.title } =
        getUiOptions(uiSchema);

    const displayItems = useMemo(() => {
        const data =
            resolveNestedKey(formContext.customData, dataKey) ||
            resolveNestedKey(formContext, dataKey) ||
            [];
        return Array.isArray(data) && data.length > 0
            ? groupPartiesByPartyId(data as SummaryItem[], t, taskType)
            : [];
    }, [formContext, dataKey, t, taskType]);

    if (loading) {
        return <div>{t('loading')}</div>;
    }

    if (displayItems.length === 0) {
        return <div>{t('noSummary')}</div>;
    }

    return (
        <div id={'id'} className={styles.container}>
            {showLabel && titleText && (
                <Typography
                    variant={TypographyVariant.H2}
                    className={styles.title}
                >
                    {titleText}
                </Typography>
            )}
            {!readonly && !isFormReviewTab && (
                <p className={styles.validationMessage}>
                    {validationSucceeded
                        ? t('successMessage')
                        : t('errorMessage')}
                </p>
            )}
            {displayItems.map((item, idx) => {
                const {
                    party,
                    fullName,
                    addressStr,
                    addresses,
                    phoneStr,
                    phones,
                    emailStr,
                    emails,
                    ssn,
                    gender,
                    dob,
                    trustDate,
                    relationshipToParty,
                } = getPartyMeta(item, t);
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
                const isPerStirpes = item.isPerStirpes === true ? 'Yes' : 'No';
                const isIrrevocable =
                    item.isIrrevocable === true ? 'Yes' : 'No';
                const { tagVariant, tagText } = getTagVariant(
                    customData?.requestType ?? item.action ?? 'NONE',
                    t
                );
                const { roles } = item;

                const sectionsRaw = uiSchema?.['ui:options']?.sections;
                const sections = Array.isArray(sectionsRaw) ? sectionsRaw : [];

                const isFieldVisible = (field: SummaryField) => {
                    if (!field.visibleWhen) return true;

                    return Object.entries(field.visibleWhen).every(
                        ([key, expected]) => {
                            const actual = String(
                                item.party?.[key] ?? item[key] ?? ''
                            ).toUpperCase();
                            const allowedValues = Array.isArray(expected)
                                ? expected
                                : [expected];

                            return allowedValues.some(
                                (val) => val.toUpperCase() === actual
                            );
                        }
                    );
                };

                const getFieldValue = (fieldKey: string) => {
                    if (fieldKey in item) return item[fieldKey];
                    if (item.party && fieldKey in item.party)
                        return item.party[fieldKey];
                    return '-';
                };

                const fieldValueExtractors: Record<
                    string,
                    (args: { field: SummaryField; item: SummaryItem }) => string
                > = {
                    agentType: ({ item }) => formatAgentType(item),
                    address: () => addressStr,
                    phone: () => phoneStr,
                    email: () => emailStr,
                    ssn: () => ssn,
                    gender: () => gender,
                    dateOfBirth: () => dob,
                    trustDate: () => trustDate,
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
                const isExpanded = expandedCardIndex === idx;

                return (
                    <div key={idx} className={styles.card}>
                        {/* Clickable header */}
                        <div
                            className={styles.cardHeader}
                            onClick={() => toggleCard(idx)}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    toggleCard(idx);
                                }
                            }}
                        >
                            <div className={styles.headerRow}>
                                <div className={styles.headerLeft}>
                                    <Typography variant={TypographyVariant.H2}>
                                        {getTransactionPartyDisplayValue({
                                            taskType,
                                            fullName,
                                            item,
                                        })}
                                    </Typography>
                                    {tagText && !isFormReviewTab && (
                                        <Tag
                                            text={tagText}
                                            className={styles.actionTag}
                                            variant={tagVariant as TagVariant}
                                        />
                                    )}
                                </div>
                                {/* Chevron icon */}
                                <Icon
                                    type={IconType.CHEVRON}
                                    className={
                                        isExpanded
                                            ? styles.chevronExpanded
                                            : styles.chevron
                                    }
                                />
                            </div>
                            {roles.length > 0 && (
                                <div className={styles.roleTags}>
                                    {roles.map((r: string) => (
                                        <Tag
                                            key={r}
                                            text={r}
                                            className={styles.roleTag}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Collapsible content */}
                        {isExpanded &&
                            (sections as SummarySection[]).map(
                                (section: SummarySection, sIdx: number) => (
                                    <React.Fragment key={sIdx}>
                                        {section.label && (
                                            <Typography
                                                variant={TypographyVariant.H2}
                                                className={styles.sectionTitle}
                                            >
                                                {section.label}
                                            </Typography>
                                        )}
                                        <div
                                            className={
                                                section.layout === 'vertical'
                                                    ? styles.sectionVertical
                                                    : styles.sectionHorizontal
                                            }
                                        >
                                            {(section.fields as SummaryField[])
                                                .filter(isFieldVisible)
                                                .map((field: SummaryField) => {
                                                    const value =
                                                        getSummaryFieldValue(
                                                            field,
                                                            item
                                                        );
                                                    const isAddressField =
                                                        field.key === 'address';
                                                    const isPhoneField =
                                                        field.key === 'phone';
                                                    const isEmailField =
                                                        field.key === 'email';
                                                    const showAddressesHorizontal =
                                                        section.layout ===
                                                            'vertical' &&
                                                        isAddressField &&
                                                        Array.isArray(
                                                            addresses
                                                        ) &&
                                                        addresses.length > 0;
                                                    const showPhonesHorizontal =
                                                        section.layout ===
                                                            'vertical' &&
                                                        isPhoneField &&
                                                        Array.isArray(phones) &&
                                                        phones.length > 0;
                                                    const showEmailsHorizontal =
                                                        section.layout ===
                                                            'vertical' &&
                                                        isEmailField &&
                                                        Array.isArray(emails) &&
                                                        emails.length > 0;

                                                    const showList =
                                                        showAddressesHorizontal ||
                                                        showPhonesHorizontal ||
                                                        showEmailsHorizontal;

                                                    return (
                                                        <div
                                                            key={field.key}
                                                            className={
                                                                showList
                                                                    ? styles.addressFieldWrapper
                                                                    : undefined
                                                            }
                                                        >
                                                            <Label
                                                                className={
                                                                    styles.fieldLabel
                                                                }
                                                                label={
                                                                    field.label
                                                                }
                                                                variant={
                                                                    LabelVariant.FieldLabel
                                                                }
                                                            />
                                                            {showAddressesHorizontal ? (
                                                                <div
                                                                    className={
                                                                        styles.addressList
                                                                    }
                                                                >
                                                                    {(
                                                                        addresses as Address[]
                                                                    ).map(
                                                                        (
                                                                            addr,
                                                                            aIdx
                                                                        ) => {
                                                                            const typeLabel =
                                                                                formatTypeLabel(
                                                                                    addr.addressType
                                                                                );
                                                                            return (
                                                                                <div
                                                                                    key={
                                                                                        aIdx
                                                                                    }
                                                                                    className={
                                                                                        styles.addressItem
                                                                                    }
                                                                                >
                                                                                    <span
                                                                                        className={
                                                                                            styles.addressTypeLabel
                                                                                        }
                                                                                    >
                                                                                        {
                                                                                            typeLabel
                                                                                        }
                                                                                    </span>
                                                                                    <br />
                                                                                    {formattedAddress(
                                                                                        addr
                                                                                    ) ||
                                                                                        '-'}
                                                                                </div>
                                                                            );
                                                                        }
                                                                    )}
                                                                </div>
                                                            ) : showPhonesHorizontal ? (
                                                                <div
                                                                    className={
                                                                        styles.addressList
                                                                    }
                                                                >
                                                                    {(
                                                                        phones as Phone[]
                                                                    ).map(
                                                                        (
                                                                            ph,
                                                                            pIdx
                                                                        ) => (
                                                                            <div
                                                                                key={
                                                                                    pIdx
                                                                                }
                                                                                className={
                                                                                    styles.addressItem
                                                                                }
                                                                            >
                                                                                <span
                                                                                    className={
                                                                                        styles.addressTypeLabel
                                                                                    }
                                                                                >
                                                                                    {formatTypeLabel(
                                                                                        ph.phoneType,
                                                                                        'Phone'
                                                                                    )}
                                                                                </span>
                                                                                <br />
                                                                                {formattedPhone(
                                                                                    ph
                                                                                )}
                                                                            </div>
                                                                        )
                                                                    )}
                                                                </div>
                                                            ) : showEmailsHorizontal ? (
                                                                <div
                                                                    className={
                                                                        styles.addressList
                                                                    }
                                                                >
                                                                    {(
                                                                        emails as Email[]
                                                                    ).map(
                                                                        (
                                                                            em,
                                                                            eIdx
                                                                        ) => (
                                                                            <div
                                                                                key={
                                                                                    eIdx
                                                                                }
                                                                                className={
                                                                                    styles.addressItem
                                                                                }
                                                                            >
                                                                                <span
                                                                                    className={
                                                                                        styles.addressTypeLabel
                                                                                    }
                                                                                >
                                                                                    {formatTypeLabel(
                                                                                        em.emailType,
                                                                                        'Email'
                                                                                    )}
                                                                                </span>
                                                                                <br />
                                                                                {formattedEmail(
                                                                                    em
                                                                                )}
                                                                            </div>
                                                                        )
                                                                    )}
                                                                </div>
                                                            ) : (
                                                                <div
                                                                    className={
                                                                        styles.fieldValue
                                                                    }
                                                                >
                                                                    {value ??
                                                                        '-'}
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                        </div>
                                        {sIdx !== sections.length - 1 && (
                                            <hr
                                                className={
                                                    styles.sectionDivider
                                                }
                                            />
                                        )}
                                    </React.Fragment>
                                )
                            )}
                    </div>
                );
            })}

            {showSelectionError && !isChecked && (
                <AssistiveText
                    className={styles.assistiveText}
                    variant={AssistiveTextVariant.Error}
                    text={t('missingCheckToConfirm')}
                />
            )}

            {!readonly &&
                !isFormReviewTab &&
                !validationSucceeded &&
                renderValidationErrors()}
            {showSelectionError && !isChecked && (
                <AssistiveText
                    className={styles.assistiveText}
                    variant={AssistiveTextVariant.Error}
                    text={t('missingCheckToConfirm')}
                />
            )}
        </div>
    );
};
