// TODO: Generalize this Agent Summary Widget for other transaction types (e.g., Beneficiary Change, Owner Change)

import { WidgetProps } from '@rjsf/utils';
import {
    Tag,
    TagVariant,
    AssistiveText,
    AssistiveTextVariant,
} from '@zinnia/bloom/components';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import BannerAlert, {
    BannerVariant,
} from '@deps/components/banner-alert/banner-alert';
import CheckboxText from '@deps/components/checkbox/checkbox-text/checkbox-text';
import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import { TranslationFiles } from '@deps/config/translations';
import { getTagVariant } from '@deps/containers/bene-change/components/steps/summary/summary-step.helpers';
import { validateAgentTransaction } from '@deps/queries/api/web-non-financial';
import { browserLogInfo, browserLogError } from '@deps/utils/browser-logging';
import { toTitleCase } from '@deps/utils/strings';

interface DeclineReason {
    value: string;
    exceptionSubRefs?: Array<{
        subNigoId: string;
        value: string;
    }>;
    category: string;
    reason: string;
    detailedReason: string;
}

interface ValidationResult {
    error: string;
    errorCode: string;
    resolution: string;
}

interface ValidationResponse {
    status: 'success' | 'Error';
    data?: {
        validationResult?: ValidationResult[];
    };
    validationResult?: ValidationResult[] | null;
    correlationId?: string;
}

interface FormData {
    partyUpdates: any[];
    signatures?: Array<{ isSignedPresent: boolean; signDate: string | null }>;
    planCode: string;
    policyNumber: string;
    issueResolved: boolean;
    declineReason?: DeclineReason[];
}

const ROLE_MAP: { [key: string]: string } = {
    PRIMARYWRITINGAGENT: 'Writing agent',
    PRIMARYSERVICINGAGENT: 'Servicing agent',
};

const formatAgentName = (item: any): string => {
    const firstName = item?.party?.firstName?.trim?.() || '';
    const lastName = item?.party?.lastName?.trim?.() || '';
    const fullName = `${firstName} ${lastName}`.trim();
    return toTitleCase(fullName) || `Ext. ID: ${item.party.agentExternalId}`;
};

const formatAgentType = (item: any): string => {
    return (
        ROLE_MAP[item.partyRole] ||
        toTitleCase(item.partyRole?.replace(/_/g, ' ') || 'N/A')
    );
};

const SummaryWidget = (props: WidgetProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: 'agentChangeDetail.summary',
    });
    const { formContext, readonly } = props;

    const {
        partyUpdates = [],
        signatures,
        planCode,
        policyNumber,
        issueResolved,
        declineReason,
    } = formContext?.customData || {};

    const [validationResponse, setValidationResponse] =
        useState<ValidationResponse | null>(null);
    const [isValidating, setIsValidating] = useState(false);
    const [isChecked, setIsChecked] = useState<boolean>(false);
    const [showSelectionError, setShowSelectionError] =
        useState<boolean>(false);

    useEffect(() => {
        if (!issueResolved || readonly) return;

        const validateAgentChange = async () => {
            if (!planCode || !policyNumber || !partyUpdates.length) {
                browserLogInfo(
                    'AGENT CHANGE PAPER FORM :: ::Skipping validation - missing required data',
                    {
                        planCode,
                        policyNumber,
                        hasPartyUpdates: !!partyUpdates.length,
                    }
                );
                return;
            }

            setIsValidating(true);

            try {
                const requestBody = {
                    planCode,
                    policyNumber,
                    partyUpdates: partyUpdates.map((item: any) => ({
                        action: item.action,
                        partyRole: item.partyRole,
                        party: item.party,
                    })),
                    signatures: signatures || [
                        { isSignedPresent: false, signDate: null },
                    ],
                };

                browserLogInfo('AGENT CHANGE PAPER FORM :: VALIDATION', {
                    planCode,
                    policyNumber,
                    partyUpdatesCount: requestBody.partyUpdates.length,
                });

                const response = await validateAgentTransaction(requestBody);
                setValidationResponse(response);

                const logMethod =
                    response?.status === 'success'
                        ? browserLogInfo
                        : browserLogError;
                logMethod(
                    `AGENT CHANGE PAPER FORM : VALIDATION ${
                        response?.status === 'success' ? 'succeeded' : 'failed'
                    }`,
                    {
                        planCode,
                        policyNumber,
                        ...(response?.status !== 'success' && {
                            validationErrors:
                                response?.data?.validationResult?.length || 0,
                        }),
                    }
                );
            } catch (error) {
                const errorResponse = error as any;
                browserLogError(
                    'AGENT CHANGE PAPER FORM :: Validation API call failed',
                    {
                        error,
                        planCode,
                        policyNumber,
                        correlationId:
                            errorResponse?.correlationId ||
                            errorResponse?.response?.data?.correlationId,
                    }
                );
                setValidationResponse({
                    status: 'Error',
                    validationResult: null,
                });
            } finally {
                setIsValidating(false);
            }
        };

        validateAgentChange();
    }, [planCode, policyNumber, issueResolved]);

    useEffect(() => {
        if (readonly || !formContext?.setSubmitEnabled) return;

        const canSubmit = issueResolved
            ? validationResponse?.status === 'success' || isChecked
            : isChecked;
        formContext.setSubmitEnabled(canSubmit);
    }, [
        validationResponse?.status,
        isChecked,
        issueResolved,
        formContext,
        readonly,
    ]);

    const handleCheckboxChange = () => {
        setIsChecked(!isChecked);
        setShowSelectionError(false);
    };

    const renderErrorCheckbox = () => (
        <div className="flex flex-wrap gap-8 max-md:flex-col">
            <CheckboxText
                label={
                    t('submitWithErrorsText') ||
                    'Submit with errors and create a NIGO task for the appropriate team to follow up on.'
                }
                checked={isChecked}
                onChange={handleCheckboxChange}
            />
            {showSelectionError && !isChecked && (
                <AssistiveText
                    className="mt-2"
                    variant={AssistiveTextVariant.Error}
                    text={
                        t('missingCheckToConfirm') ||
                        'Please confirm to proceed with errors.'
                    }
                />
            )}
        </div>
    );

    const renderValidationErrors = () => {
        if (
            isValidating ||
            validationResponse?.status === 'success' ||
            !validationResponse
        ) {
            return null;
        }

        const validationResults = validationResponse?.data?.validationResult;
        const hasValidResults =
            validationResults && Array.isArray(validationResults);

        return (
            <div className="mb-6 flex flex-col gap-4">
                {hasValidResults ? (
                    validationResults.map(
                        (result: ValidationResult, index: number) => (
                            <BannerAlert
                                canDismiss={false}
                                key={`validation-error-${
                                    result.errorCode || index
                                }`}
                                variant={BannerVariant.Error}
                            >
                                <b>{result.error}</b> {result.resolution}
                            </BannerAlert>
                        )
                    )
                ) : (
                    <BannerAlert
                        canDismiss={false}
                        variant={BannerVariant.Error}
                    >
                        <b>
                            {t('bpm500Error') ||
                                'An unexpected error occurred during validation.'}
                        </b>
                    </BannerAlert>
                )}
                {renderErrorCheckbox()}
            </div>
        );
    };

    const renderDeclineReasons = () => {
        const hasValidReasons = declineReason && Array.isArray(declineReason);

        return (
            <div className="mb-6 flex flex-col gap-4">
                {hasValidReasons ? (
                    declineReason.map(
                        (reason: DeclineReason, index: number) => {
                            const errorCode = reason.value;
                            const exceptionSubRefs = reason.exceptionSubRefs;
                            const hasSubRefs =
                                exceptionSubRefs && exceptionSubRefs.length > 0;

                            if (hasSubRefs) {
                                return exceptionSubRefs.map(
                                    (subRef, subIndex) => (
                                        <BannerAlert
                                            canDismiss={false}
                                            key={`decline-reason-${errorCode}-${
                                                subRef.subNigoId || subIndex
                                            }`}
                                            variant={BannerVariant.Error}
                                        >
                                            <b>{subRef.value}</b>
                                            {errorCode && ` Code: ${errorCode}`}
                                            {subRef.subNigoId &&
                                                ` (${subRef.subNigoId})`}
                                        </BannerAlert>
                                    )
                                );
                            }

                            return (
                                <BannerAlert
                                    canDismiss={false}
                                    key={`decline-reason-${errorCode || index}`}
                                    variant={BannerVariant.Error}
                                >
                                    <b>{reason.reason}</b>
                                    {errorCode && ` Code: ${errorCode}`}
                                </BannerAlert>
                            );
                        }
                    )
                ) : (
                    <BannerAlert
                        canDismiss={false}
                        variant={BannerVariant.Error}
                    >
                        <b>
                            {t('bpm500Error') ||
                                'An unexpected error occurred.'}
                        </b>
                    </BannerAlert>
                )}
                {renderErrorCheckbox()}
            </div>
        );
    };

    const renderAgentList = () => {
        if (
            (validationResponse?.status !== 'success' ||
                !partyUpdates ||
                partyUpdates.length === 0) &&
            !readonly
        ) {
            return null;
        }

        return partyUpdates.map((item: any, index: number) => {
            const tagInfo = getTagVariant(item.action, t);

            return (
                <div key={`agent-summary-${index}`} className="mb-4">
                    <div className="border border-gray-200 rounded-lg p-4 bg-white">
                        <div className="flex items-center mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">
                                {formatAgentName(item)}
                            </h3>
                            <Tag
                                text={tagInfo.tagText}
                                className="ml-3"
                                variant={tagInfo.tagVariant as TagVariant}
                            />
                        </div>

                        <div className="grid grid-cols-3 gap-6">
                            <div>
                                <div className="text-sm font-medium text-gray-600 mb-1">
                                    {t('externalId')}
                                </div>
                                <div className="text-sm text-gray-900">
                                    {item.party.agentExternalId}
                                </div>
                            </div>
                            <div>
                                <div className="text-sm font-medium text-gray-600 mb-1">
                                    {t('agentType')}
                                </div>
                                <div className="text-sm text-gray-900">
                                    {formatAgentType(item)}
                                </div>
                            </div>
                            <div>
                                <div className="text-sm font-medium text-gray-600 mb-1">
                                    {t('allocation')}
                                </div>
                                <div className="text-sm text-gray-900">
                                    {item.party.partyPercentage || 0}%
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            );
        });
    };

    const getTitleMessage = () => {
        if (readonly) return undefined;

        if (!issueResolved) {
            return 'Hm, we found an issue with the form. Review the error below.';
        }

        if (isValidating) return t('validation');

        if (validationResponse?.status === 'success') {
            return t('reviewMessage');
        }

        return (
            t('status400subtitle') ||
            "Hm, we found an issue when checking this policy's rules. Review the error below."
        );
    };

    return (
        <div className="-mt-6">
            <Typography
                className="mb-4 font-medium"
                variant={TypographyVariant.BodySm}
            >
                {getTitleMessage()}
            </Typography>

            {issueResolved ? (
                <>
                    {renderValidationErrors()}
                    {renderAgentList()}
                </>
            ) : (
                renderDeclineReasons()
            )}
        </div>
    );
};

export default SummaryWidget;
