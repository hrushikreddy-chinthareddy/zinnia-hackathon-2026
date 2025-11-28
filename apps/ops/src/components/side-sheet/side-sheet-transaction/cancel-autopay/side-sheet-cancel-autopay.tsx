import { AssistiveTextVariant } from '@zinnia/bloom/components';
import dayjs from 'dayjs';
import { useTranslation } from 'next-i18next';
import { useMemo, useState } from 'react';
import { v4 as uuidV4 } from 'uuid';

import CaseDocumentSelect, {
    CaseDocumentOption,
    SetStateCaseId,
} from '@deps/components/case-document-select/case-document-select';
import CheckboxText from '@deps/components/checkbox/checkbox-text/checkbox-text';
import {
    FieldSize,
    FieldType,
    FieldVariant,
} from '@deps/components/fields/field';
import FieldDateSelect from '@deps/components/fields/field-date-select/field-date-select';
import TransactionCta from '@deps/components/transaction-cta/transaction-cta';
import { TranslationFiles } from '@deps/config/translations';
import { useOptimizely } from '@deps/contexts/OptimizelyContext';
import { usePermissionsContext } from '@deps/contexts/PermissionsContext';
import { segmentAnalyticsTrackEvent } from '@deps/helpers/analytics/segment-analytics';
import { buildSystematicProgramSubmittedEvent } from '@deps/helpers/analytics/submit-transaction-event';
import { getUtcDate } from '@deps/helpers/date.helpers';
import { numberFormatify } from '@deps/helpers/numbers.helpers';
import { isNullEmptyOrUndefined } from '@deps/helpers/string.helpers';
import { getFrequency } from '@deps/helpers/systematic-program.helpers';
import { Processes } from '@deps/models/case/case';
import {
    submitSystematicProgramUpdate,
    validateSystematicProgramUpdate,
    ValidationResult,
} from '@deps/queries/api/bpm';
import { StatusCode } from '@deps/queries/api-utils/baseAPIClient';
import {
    NUMERIC_DATE_FORMAT,
    ZAHARA_API_DATE_FORMAT,
} from '@deps/types/constants';
import {
    SegmentTrackedEventName,
    TransactionContinueClickedEvent,
    TransactionStep,
    TransactionSuccessfulEvent,
} from '@deps/types/segment-analytics';
import { FEATURE_FLAGS } from '@deps/utils/optimizely/flags';
import {
    AdhocSystematicProgram,
    AmountType,
    ArrangementType,
    Frequency,
    PaymentForm,
    Policy,
    Reason,
    TransactionType,
} from '@zinnia/api-types/types/sor';

import { CancelAutopayDetails } from './cancel-autopay-details';
import { ViewState } from '../non-financial-transactions/states/states.helpers';
import ApiErrorState from '../states/api-error-state';
import BpmErrorState from '../states/bpm-error-state';
import { handleResponse } from '../states/states.helpers';
import SuccessState from '../states/success-state';
import WithdrawalApiErrorState from '../states/withdrawal-cancal-autopay-api-error';

interface CancelSystematicProgramBody {
    caseId?: string;
    correlationId: string;
    effectiveDate: string;
}

type Errors = {
    caseId?: string;
    confirmCancel?: string;
    effectiveDate?: string;
};

export type SideSheetCancelAutopayProps = {
    arrangementType: ArrangementType;
    onCancel: () => void;
    policy: Policy;
    systematicProgramReason: Reason;
    isFromWithdrawals?: boolean;
    errorContent?: React.ReactElement;
    date?: string;
};

const SideSheetCancelAutopay = ({
    arrangementType,
    onCancel,
    policy,
    systematicProgramReason,
    isFromWithdrawals = false,
    errorContent,
}: SideSheetCancelAutopayProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: 'transactions.cancelAutopay',
    });
    const { t: defaultT } = useTranslation();

    const { featureFlags } = useOptimizely();
    const systematicProgramTablesEnabled =
        featureFlags[FEATURE_FLAGS.SYSTEMATIC_PROGRAMS_TABLE];

    const INITIAL_BODY: CancelSystematicProgramBody = {
        correlationId: uuidV4(),
        effectiveDate: dayjs().format(ZAHARA_API_DATE_FORMAT),
    };

    const { sessionId, partyId } = usePermissionsContext();

    const systematicProgram = useMemo(
        () =>
            policy.systematicPrograms?.find(
                (sp) => sp.reason === systematicProgramReason
            ),
        [policy.systematicPrograms, systematicProgramReason]
    );
    const [caseDocumentOptions, setCaseDocumentOptions] = useState<
        CaseDocumentOption[]
    >([]);
    const [body, setBody] = useState(INITIAL_BODY);
    const [newCaseId, setNewCaseId] = useState<string>();
    const [effectiveDate, setEffectiveDate] = useState<string>(
        dayjs(policy.policyDates?.nextMonthiversaryDate).format(
            NUMERIC_DATE_FORMAT
        )
    );
    const [confirmCancel, setConfirmCancel] = useState<boolean>(false);
    const [validationResults, setValidationResults] = useState<
        ValidationResult[]
    >([]);

    const [errors, setErrors] = useState<Errors>({});
    const [viewState, setViewState] = useState(ViewState.Default);
    const [loading, setLoading] = useState<boolean>(false);

    const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const dateValue = event.target.value;
        const { effectiveDate, ...remainingErrors } = errors;

        setEffectiveDate(String(dateValue));
        setErrors(remainingErrors);
    };

    const validateFields = (
        effectiveDate: string,
        confirmCancel: boolean,
        caseId?: string
    ) => {
        let localErrors: Errors = {};

        if (caseId == undefined) {
            localErrors = {
                ...localErrors,
                caseId: errors.caseId || `${t('missingCaseDocument')}`,
            };
        }

        if (isNullEmptyOrUndefined(effectiveDate)) {
            localErrors = {
                ...localErrors,
                effectiveDate: `${t('invalidEffectiveDate')}`,
            };
        }

        if (!confirmCancel) {
            localErrors = {
                ...localErrors,
                confirmCancel: `${
                    systematicProgramTablesEnabled
                        ? defaultT('confirmCancelProgram')
                        : t('confirmCancelError')
                }`,
            };
        }

        setErrors(localErrors);

        return Object.keys(localErrors).length === 0;
    };

    const getUpdateSystematicProgramBody = () => {
        const effectiveDateFormatted = getUtcDate(effectiveDate);

        return {
            caseId: body.caseId || '',
            correlationId: body.correlationId,
            effectiveDate: effectiveDateFormatted,
            reverseInitiator: false,
            systematicProgram: {
                amount: Number(systematicProgram?.amount),
                arrangementType: arrangementType,
                paymentForm: (systematicProgram?.paymentForm ||
                    PaymentForm.ACH) as PaymentForm,
                amountType: AmountType.AMOUNT,
                frequency: systematicProgram?.frequency,
                startDate: systematicProgram?.startDate,
                endDate: effectiveDateFormatted,
                previousProgramDate: systematicProgram?.previousProgramDate,
                nextProgramDate: systematicProgram?.nextProgramDate,
                ...(systematicProgram?.parties && {
                    parties: systematicProgram.parties,
                }),
            } as AdhocSystematicProgram,
        };
    };

    const validateAndSubmitUpdate = async () => {
        if (!validateFields(effectiveDate, confirmCancel, body.caseId)) {
            return;
        }

        setLoading(true);

        const arrangementId = systematicProgram?.arrangementId || '';
        const updateBody = getUpdateSystematicProgramBody();

        const validateResponse = await validateSystematicProgramUpdate(
            policy.product?.planCode,
            policy.policyNumber || '',
            arrangementId,
            updateBody
        );

        if (
            validateResponse?.status !== StatusCode.Accepted &&
            validateResponse?.status !== StatusCode.Okay
        ) {
            handleResponse({
                response: validateResponse,
                setViewState,
                setValidationResults,
            });

            return;
        }

        await submitUpdate();

        setLoading(false);
    };

    const submitUpdate = async () => {
        const arrangementId = systematicProgram?.arrangementId || '';
        const updateBody = getUpdateSystematicProgramBody();
        const submitResponse = await submitSystematicProgramUpdate(
            policy.product?.planCode,
            policy.policyNumber || '',
            arrangementId,
            updateBody
        );

        segmentAnalyticsTrackEvent<TransactionContinueClickedEvent>(
            SegmentTrackedEventName.TransactionContinueClicked,
            {
                authSessionId: sessionId,
                userId: partyId,
                type: TransactionType.SYSTEMATIC_PROGRAM_UPDATE,
                correlationId: updateBody.correlationId,
            }
        );

        if (submitResponse?.data?.caseId) {
            setNewCaseId(submitResponse?.data?.caseId);
        }

        if (
            [StatusCode.Accepted, StatusCode.Okay].includes(
                submitResponse?.status
            )
        ) {
            segmentAnalyticsTrackEvent<TransactionSuccessfulEvent>(
                SegmentTrackedEventName.TransactionSubmitted,
                buildSystematicProgramSubmittedEvent({
                    action: 'cancel',
                    query: updateBody,
                    policy,
                    caseId: submitResponse?.data?.caseId,
                    sessionId,
                    userId: partyId,
                })
            );
        }

        handleResponse({
            response: submitResponse,
            setViewState,
            setValidationResults,
        });

        return;
    };

    const getArrangementTranslationKey = (type: ArrangementType): string => {
        switch (type) {
            case ArrangementType.PAYMENT:
                return systematicProgramTablesEnabled
                    ? 'premiumAutopayCancellationSP'
                    : 'premiumAutopayCancellation';
            case ArrangementType.LOANREPAYMENT:
                return systematicProgramTablesEnabled
                    ? 'loanAutopayCancellationSP'
                    : 'loanAutopayCancellation';
            case ArrangementType.WITHDRAWAL:
                return 'withdrawalAutopayCancellation';
            case ArrangementType.REQUIREDMINIMUMDISTRIBUTION:
                return 'minimumDistributionAutopayCancellation';
            default:
                return '';
        }
    };

    const proceedCancelData = {
        frequency: getFrequency(
            systematicProgram?.frequency as Frequency,
            defaultT
        ),
        amount: numberFormatify(systematicProgram?.amount),
    };

    switch (viewState) {
        case ViewState.BpmError:
            if (isFromWithdrawals) {
                return (
                    <BpmErrorState
                        onCancel={onCancel}
                        onContinue={submitUpdate}
                        setViewState={setViewState}
                        validationResults={validationResults}
                        showEdit={!errorContent}
                        date={effectiveDate}
                        label={
                            (systematicProgramTablesEnabled
                                ? defaultT('proceedCancel', proceedCancelData)
                                : t('proceedCancel', proceedCancelData)) || ''
                        }
                    >
                        {errorContent ?? <></>}
                    </BpmErrorState>
                );
            }
            return (
                <BpmErrorState
                    onCancel={onCancel}
                    onContinue={submitUpdate}
                    setViewState={setViewState}
                    validationResults={validationResults}
                >
                    <CancelAutopayDetails effectiveDate={effectiveDate} />
                </BpmErrorState>
            );
        case ViewState.ApiError:
            if (isFromWithdrawals) {
                return (
                    <WithdrawalApiErrorState
                        onCancel={onCancel}
                        onContinue={submitUpdate}
                        arrangementType={arrangementType}
                    />
                );
            }
            return (
                <ApiErrorState onCancel={onCancel} onContinue={submitUpdate} />
            );
        case ViewState.Success:
            return (
                <SuccessState
                    caseId={newCaseId}
                    transactionType={t(
                        getArrangementTranslationKey(arrangementType)
                    )}
                    isNigo={!!validationResults?.length}
                    onCancel={onCancel}
                />
            );
        case ViewState.Default:
        default:
            break;
    }

    return (
        <div className="flex flex-col p-8">
            <div className="flex flex-col gap-8">
                <CaseDocumentSelect
                    caseId={body.caseId}
                    caseDocumentOptions={caseDocumentOptions}
                    currentErrors={errors}
                    policyNumber={policy?.policyNumber}
                    processType={Processes.SSW}
                    setBody={setBody as SetStateCaseId}
                    setCaseDocumentOptions={setCaseDocumentOptions}
                    setCurrentErrors={setErrors as SetStateCaseId}
                    setViewState={setViewState}
                />
                <FieldDateSelect
                    data-testid={t('effectiveDate') as string}
                    className="flex max-w-[160px]"
                    label={t('effectiveDate') as string}
                    value={String(effectiveDate)}
                    onChange={handleDateChange}
                    size={FieldSize.Small}
                    type={FieldType.BaseActive}
                    isFutureDateDisabled={false}
                    isPastDateDisabled={true}
                    variant={
                        errors.effectiveDate
                            ? FieldVariant.Error
                            : FieldVariant.Default
                    }
                    message={errors.effectiveDate || ''}
                />
                <CheckboxText
                    assistiveText={
                        !confirmCancel && errors.confirmCancel
                            ? {
                                  text: errors.confirmCancel,
                                  variant: AssistiveTextVariant.Error,
                              }
                            : undefined
                    }
                    checked={confirmCancel}
                    label={t(
                        systematicProgramTablesEnabled
                            ? 'proceedCancelSP'
                            : 'proceedCancel',
                        {
                            frequency: getFrequency(
                                systematicProgram?.frequency as Frequency,
                                defaultT
                            ),
                            amount: numberFormatify(systematicProgram?.amount),
                        }
                    )}
                    onChange={() => setConfirmCancel(!confirmCancel)}
                />
            </div>

            <TransactionCta
                className="mt-10"
                mainCta={{
                    onClick: validateAndSubmitUpdate,
                    text: systematicProgramTablesEnabled
                        ? defaultT('cancelProgram')
                        : t('cancelAutopay'),
                }}
                secondaryCta={{
                    onClick: onCancel,
                    text: t('cancel'),
                }}
                stopLoading={!loading}
                newSpinner={true}
                // TODO MG: better handling for this - will need to support withdrawal soon
                trackEventProps={{
                    type:
                        systematicProgramReason === Reason.LOANREPAYMENT
                            ? TransactionType.PAYMENT_SYSTEMATIC_LOAN_REPAYMENT
                            : systematicProgramReason === Reason.WITHDRAWAL
                            ? TransactionType.SYSTEMATIC_PARTIAL_WITHDRAWAL
                            : systematicProgramReason ===
                              Reason.REQUIREDMINIMUMDISTRIBUTION
                            ? TransactionType.SYSTEMATIC_REQUIRED_MINIMUM_DISTRIBUTION
                            : TransactionType.SUBSEQUENT_PREMIUM,
                    step: TransactionStep.Cancel,
                    correlationId: body.correlationId,
                }}
            />
        </div>
    );
};

export default SideSheetCancelAutopay;
