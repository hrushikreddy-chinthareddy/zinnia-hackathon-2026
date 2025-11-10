import { Transition } from '@headlessui/react';
import {
    Phone,
    PhoneType,
    Party,
    TransactionType,
    Policy,
} from '@zinnia/api-types/types/sor';
import { countries } from 'countries-list';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import router from 'next/router';
import { useTranslation } from 'next-i18next';
import { Dispatch, SetStateAction, useState } from 'react';
import { v4 as uuidV4 } from 'uuid';

import CaseDocumentSelect, {
    CaseDocumentOption,
    SetStateCaseId,
} from '@deps/components/case-document-select/case-document-select';
import CheckboxText from '@deps/components/checkbox/checkbox-text/checkbox-text';
import Field, {
    FieldSize,
    FieldType,
    FieldVariant,
} from '@deps/components/fields/field';
import FieldSelect from '@deps/components/fields/field-select/field-select';
import Radio, { RadioOrientation } from '@deps/components/radio/radio';
import SelectSimple from '@deps/components/select/select';
import { updateOptimistically } from '@deps/components/side-sheet/side-sheet-transaction/non-financial-transactions/side-sheet-non-financial-transactions.helpers';
import ApiErrorState from '@deps/components/side-sheet/side-sheet-transaction/non-financial-transactions/states/api-error-state';
import BpmErrorState from '@deps/components/side-sheet/side-sheet-transaction/non-financial-transactions/states/bpm-error-state';
import LoadingState from '@deps/components/side-sheet/side-sheet-transaction/non-financial-transactions/states/loading-state';
import {
    ViewState,
    handleResponse,
} from '@deps/components/side-sheet/side-sheet-transaction/non-financial-transactions/states/states.helpers';
import SuccessState from '@deps/components/side-sheet/side-sheet-transaction/non-financial-transactions/states/success-state';
import WarnState from '@deps/components/side-sheet/side-sheet-transaction/non-financial-transactions/states/warn-state';
import { NonFinancialTransactionIdKeys } from '@deps/components/side-sheet/side-sheet-transaction/non-financial-transactions/types';
import TransactionCta from '@deps/components/transaction-cta/transaction-cta';
import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import { TranslationFiles } from '@deps/config/translations';
import {
    Errors,
    PhoneDetails,
    countryOptions,
    frequentCountryOptions,
    getBestTimeOptions,
    getFormErrors,
    getPhoneTypeOptions,
    getTimeZoneOptions,
} from '@deps/containers/people-data-cards/phone-card/side-sheet/side-sheet-phone.helpers';
import { usePermissionsContext } from '@deps/contexts/PermissionsContext';
import { segmentAnalyticsTrackEvent } from '@deps/helpers/analytics/segment-analytics';
import { buildNonFinancialTransactionsSubmittedEvent } from '@deps/helpers/analytics/submit-transaction-event';
import { getFirstLastName } from '@deps/helpers/party-info-helpers';
import { formatPhoneNumberRaw } from '@deps/helpers/phone.helpers';
import { mapPhoneTypeToTranslation } from '@deps/helpers/translation.helpers';
import { Processes } from '@deps/models/case/case';
import { ValidationResult } from '@deps/queries/api/bpm';
import {
    addNonFinancialTransaction,
    editNonFinancialTransaction,
    NonFinancialTransactionActions,
    NonFinancialTransactionBody,
    NonFinancialTransactions,
} from '@deps/queries/api/bpm-non-financial';
import { ZAHARA_API_DATE_FORMAT } from '@deps/types/constants';
import {
    TransactionSuccessfulEvent,
    SegmentTrackedEventName,
    TransactionSubmittedEventType,
} from '@deps/types/segment-analytics';

dayjs.extend(utc);

type SideSheetPhoneProps = {
    onCancel: () => void;
    party?: Party;
    planCode?: string;
    policyNumber?: string;
    policy?: Policy;
    setCurrentPhones: Dispatch<SetStateAction<Phone[]>>;
    updatePhone?: Phone;
};

export const SideSheetPhone = ({
    onCancel,
    party,
    planCode,
    policyNumber,
    policy,
    setCurrentPhones,
    updatePhone,
}: SideSheetPhoneProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: 'people.sideSheet.phone',
    });
    const { t: defaultT } = useTranslation();
    const { sessionId, partyId: userId } = usePermissionsContext();

    const correlationIdFromRoute =
        typeof router?.query?.correlationId === 'string'
            ? router?.query?.correlationId
            : undefined;

    const INITIAL_PHONE: Phone = {
        bestTime: 'Anytime',
        countryCode: '1',

        phoneType: PhoneType.MOBILE,
        startDate: dayjs.utc().format(ZAHARA_API_DATE_FORMAT),
    };

    const INITIAL_BODY: NonFinancialTransactionBody = {
        correlationId: uuidV4(),
        effectiveDate: dayjs.utc().format(ZAHARA_API_DATE_FORMAT),
        reverseInitiator: false,
    };

    const [action, setAction] = useState(
        updatePhone
            ? NonFinancialTransactionActions.Edit
            : NonFinancialTransactionActions.Add
    );
    const [body, setBody] = useState(INITIAL_BODY);
    const [caseDocumentOptions, setCaseDocumentOptions] = useState<
        CaseDocumentOption[]
    >([]);
    const [country, setCountry] = useState('US' as keyof typeof countries);
    const [currentErrors, setCurrentErrors] = useState<Errors>();
    const [phone, setPhone] = useState<Phone>(updatePhone ?? INITIAL_PHONE);
    const [validationResults, setValidationResults] = useState<
        ValidationResult[]
    >([]);
    const [viewState, setViewState] = useState(ViewState.Default);
    const [newCaseId, setNewCaseId] = useState<string>();

    const { caseId } = body;
    const { partyId } = party ?? {};
    const { phoneType = PhoneType.MOBILE } = phone;

    const isAdd = action === NonFinancialTransactionActions.Add;
    const isDelete = action === NonFinancialTransactionActions.Delete;
    const stopLoading =
        currentErrors === undefined
            ? true
            : !!Object.entries(currentErrors).length;

    const bestTimeOptions = getBestTimeOptions({ t: defaultT });
    const phoneTypeOptions = getPhoneTypeOptions({ t: defaultT });
    const timeZoneOptions = getTimeZoneOptions({ t: defaultT });

    const phoneTypeTranslation = mapPhoneTypeToTranslation(phoneType, defaultT);
    const phoneTypeTranslationLowercase =
        phoneTypeTranslation.toLocaleLowerCase();
    const mainCtaText = isAdd
        ? t('mainCta.add', { type: phoneTypeTranslationLowercase })
        : t('mainCta.update', { type: phoneTypeTranslationLowercase });

    const handleDelete = async () => {
        const response = await editNonFinancialTransaction({
            body: {
                ...body,
                deleteRequest: true,
                phone,
            },
            itemId: updatePhone?.phoneId,
            partyId,
            planCode,
            policyNumber,
            transaction: NonFinancialTransactions.Phone,
        });

        const onSuccessfulSubmit = (caseId: string) => {
            setNewCaseId(caseId);
            segmentAnalyticsTrackEvent<TransactionSuccessfulEvent>(
                SegmentTrackedEventName.TransactionSubmitted,
                buildNonFinancialTransactionsSubmittedEvent({
                    transactionSubmittedEventType:
                        TransactionSubmittedEventType.REMOVE_PHONE,
                    query: {
                        ...body,
                        deleteRequest: true,
                        phone,
                    },
                    caseId,
                    policy,
                    sessionId,
                    userId,
                })
            );
        };

        handleResponse({
            response,
            setViewState,
            setValidationResults,
            onSuccessfulSubmit,
        });
    };

    const handleSubmit = async () => {
        const errors = getFormErrors({ caseId, isDelete, phone, t: defaultT });
        setCurrentErrors(errors);
        if (Object.keys(errors).length > 0) return;

        if (isDelete) {
            setViewState(ViewState.Warn);
            return;
        }

        let response;

        if (isAdd) {
            response = await addNonFinancialTransaction({
                body: {
                    ...body,
                    phone,
                },
                partyId,
                planCode,
                policyNumber,
                transaction: NonFinancialTransactions.Phone,
            });
        } else {
            response = await editNonFinancialTransaction({
                body: {
                    ...body,
                    phone,
                },
                itemId: updatePhone?.phoneId,
                partyId,
                planCode,
                policyNumber,
                transaction: NonFinancialTransactions.Phone,
            });
        }

        const onSuccessfulSubmit = (caseId: string) => {
            setNewCaseId(caseId);
            segmentAnalyticsTrackEvent<TransactionSuccessfulEvent>(
                SegmentTrackedEventName.TransactionSubmitted,
                buildNonFinancialTransactionsSubmittedEvent({
                    transactionSubmittedEventType: isAdd
                        ? TransactionSubmittedEventType.ADD_PHONE
                        : TransactionSubmittedEventType.UPDATE_PHONE,
                    query: {
                        ...body,
                        phone,
                    },
                    caseId,
                    policy,
                    sessionId,
                    userId,
                })
            );
        };

        handleResponse({
            response,
            setViewState,
            setValidationResults,
            onSuccessfulSubmit,
        });
    };

    switch (viewState) {
        case ViewState.Loading:
            return <LoadingState />;
        case ViewState.BpmError:
            return (
                <BpmErrorState
                    onCancel={onCancel}
                    onContinue={handleSubmit}
                    setViewState={setViewState}
                    transaction={NonFinancialTransactions.Phone}
                    validationResults={validationResults}
                >
                    <PhoneDetails phone={phone} />
                </BpmErrorState>
            );
        case ViewState.ApiError:
            return (
                <ApiErrorState
                    action={action}
                    name={getFirstLastName(party)}
                    onCancel={onCancel}
                    onContinue={handleSubmit}
                    transaction={NonFinancialTransactions.Number}
                    type={phoneTypeTranslationLowercase}
                />
            );
        case ViewState.Warn:
            return (
                <WarnState
                    name={getFirstLastName(party)}
                    onCancel={onCancel}
                    onContinue={handleDelete}
                    transaction={NonFinancialTransactions.Number}
                    type={phoneTypeTranslationLowercase}
                />
            );
        case ViewState.Success:
            updateOptimistically({
                action,
                idKey: NonFinancialTransactionIdKeys.Phone,
                newItem: phone,
                setState: setCurrentPhones,
            });

            return (
                <SuccessState
                    action={action}
                    isNigo={!!validationResults?.length}
                    name={getFirstLastName(party)}
                    onCancel={onCancel}
                    transaction={NonFinancialTransactions.Number}
                    type={phoneTypeTranslationLowercase}
                    caseId={newCaseId}
                />
            );
        case ViewState.Default:
        default:
            break;
    }

    return (
        <div className="flex flex-col gap-6 p-10">
            <CaseDocumentSelect
                caseDocumentOptions={caseDocumentOptions}
                caseId={caseId}
                currentErrors={currentErrors}
                policyNumber={policyNumber}
                processType={Processes.PolicyUpdate}
                setBody={setBody as SetStateCaseId}
                setCaseDocumentOptions={setCaseDocumentOptions}
                setCurrentErrors={setCurrentErrors}
                setViewState={setViewState}
                processSubType={[Processes.PhoneNumberChange]}
                correlationId={correlationIdFromRoute}
                body={body}
            />

            <div className="flex flex-col gap-8">
                <div className="flex flex-col gap-8">
                    {isAdd && (
                        <Radio
                            aria-label={t('fieldLabels.type') as string}
                            items={phoneTypeOptions}
                            label={t('fieldLabels.type') as string}
                            onChange={(event) =>
                                setPhone({
                                    ...phone,
                                    phoneType: event.target.value as PhoneType,
                                })
                            }
                            orientation={RadioOrientation.Vertical}
                            value={phone.phoneType}
                        />
                    )}

                    <div className="flex gap-4">
                        <FieldSelect
                            aria-label={t('fieldLabels.number') as string}
                            className="w-[300px]"
                            dropdownValue={countries[country].phone}
                            formatOptions={{ format: '(###) ###-####' }}
                            frequentOptions={frequentCountryOptions}
                            label={t('fieldLabels.number') as string}
                            leading={countries[country].emoji}
                            message={currentErrors?.phoneNumber}
                            onChange={(event) => {
                                setCurrentErrors((prevState) => {
                                    const { phoneNumber, ...errors } =
                                        prevState ?? {};
                                    return errors;
                                });
                                setPhone((prevState) => ({
                                    ...prevState,
                                    areaCode: event.target.value.substring(
                                        0,
                                        3
                                    ),
                                    dialNumber: event.target.value.substring(
                                        3,
                                        10
                                    ),
                                }));
                            }}
                            onDropdownChange={(value) => {
                                setCountry(value as keyof typeof countries);
                                setPhone((prevState) => ({
                                    ...prevState,
                                    countryCode:
                                        countries[
                                            value as keyof typeof countries
                                        ].phone,
                                }));
                            }}
                            options={countryOptions}
                            prefix={`+${countries[country].phone}`}
                            size={FieldSize.Small}
                            type={FieldType.BaseActive}
                            value={formatPhoneNumberRaw(phone)}
                            variant={
                                isDelete
                                    ? FieldVariant.Inactive
                                    : currentErrors?.phoneNumber
                                    ? FieldVariant.Error
                                    : FieldVariant.Default
                            }
                        />
                        <Transition
                            as="div"
                            className="w-full"
                            enter="transition-all ease-in duration-300"
                            enterFrom="opacity-0"
                            enterTo="opacity-100"
                            leave="transition-all ease-out duration-300"
                            leaveFrom="opacity-100"
                            leaveTo="opacity-0"
                            show={phone.phoneType === PhoneType.BUSINESS}
                        >
                            <Field
                                aria-label={
                                    t('fieldLabels.extension') as string
                                }
                                className="w-[120px]"
                                formatOptions={{ format: '####' }}
                                label={t('fieldLabels.extension') as string}
                                onChange={(event) =>
                                    setPhone((prevState) => ({
                                        ...prevState,
                                        extension: event.target.value,
                                    }))
                                }
                                size={FieldSize.Small}
                                type={FieldType.BaseActive}
                                value={phone.extension}
                                variant={
                                    isDelete
                                        ? FieldVariant.Inactive
                                        : FieldVariant.Default
                                }
                            />
                        </Transition>
                    </div>
                </div>

                <div className="flex flex-col gap-4">
                    <Typography variant={TypographyVariant.LabelLg}>
                        {t('fieldLabels.preferredTime')}
                    </Typography>
                    <div className="flex flex-col gap-6">
                        <SelectSimple
                            aria-label={t('fieldLabels.bestTime') as string}
                            className="!w-1/2"
                            disabled={isDelete}
                            label={t('fieldLabels.bestTime') as string}
                            onChange={(value) =>
                                setPhone((prevState) => ({
                                    ...prevState,
                                    bestTime: value,
                                }))
                            }
                            options={bestTimeOptions}
                            size={FieldSize.Small}
                            value={phone.bestTime}
                        />
                        <SelectSimple
                            aria-label={t('fieldLabels.timeZone') as string}
                            className="!w-1/2"
                            disabled={isDelete}
                            label={t('fieldLabels.timeZone') as string}
                            onChange={(value) =>
                                setPhone((prevState) => ({
                                    ...prevState,
                                    timezone: value,
                                }))
                            }
                            options={timeZoneOptions}
                            size={FieldSize.Small}
                            value={phone.timezone ?? ''}
                        />
                    </div>
                </div>
            </div>

            {!isAdd && (
                <CheckboxText
                    checked={isDelete}
                    label={t('fieldLabels.removeNumber')}
                    onChange={(e) => {
                        setAction(
                            e
                                ? NonFinancialTransactionActions.Delete
                                : NonFinancialTransactionActions.Edit
                        );
                    }}
                />
            )}

            <TransactionCta
                className="mt-4"
                mainCta={{
                    onClick: handleSubmit,
                    text: mainCtaText,
                }}
                secondaryCta={{
                    onClick: onCancel,
                    text: t('general.cancel'),
                }}
                stopLoading={stopLoading}
                trackEventProps={{
                    type: TransactionType.PHONE_NUMBER_CHANGE,
                    correlationId: body.correlationId,
                }}
            />
        </div>
    );
};
