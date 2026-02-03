import { Transition } from '@headlessui/react';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { Dispatch, SetStateAction, useState } from 'react';
import { v4 as uuidV4 } from 'uuid';

import { AssistiveTextVariant } from '@deps/components/assistive-text/assistive-text';
import CaseDocumentSelect, {
    CaseDocumentOption,
    SetStateCaseId,
} from '@deps/components/case-document-select/case-document-select';
import CheckboxText from '@deps/components/checkbox/checkbox-text/checkbox-text';
import Field, {
    FieldType,
    FieldSize,
    FieldVariant,
} from '@deps/components/fields/field';
import NavElement, {
    NavElementSize,
    NavElementType,
} from '@deps/components/nav-element/nav-element';
import Radio from '@deps/components/radio/radio';
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
import { TranslationFiles } from '@deps/config/translations';
import {
    AdditionalAddressLine,
    AddressDetails,
    Errors,
    getAddressTypeOptions,
    getFormErrors,
} from '@deps/containers/people-data-cards/address-card/side-sheet/side-sheet-address.helpers';
import { usePermissionsContext } from '@deps/contexts/PermissionsContext';
import { segmentAnalyticsTrackEvent } from '@deps/helpers/analytics/segment-analytics';
import { buildNonFinancialTransactionsSubmittedEvent } from '@deps/helpers/analytics/submit-transaction-event';
import { getFirstLastName } from '@deps/helpers/party-info-helpers';
import { getStateCodes } from '@deps/helpers/states.helpers';
import { toTitleCase } from '@deps/helpers/string.helpers';
import { mapAddressTypeToTranslation } from '@deps/helpers/translation.helpers';
import {
    hasErrorsAndFocus,
    useFocusOnError,
} from '@deps/hooks/useFocusOnError';
import { Processes } from '@deps/models/case/case';
import { ValidationResult } from '@deps/queries/api/bpm';
import {
    NonFinancialTransactionActions,
    NonFinancialTransactionBody,
    NonFinancialTransactions,
    PreferredAddressIndicator,
    addNonFinancialTransaction,
    editNonFinancialTransaction,
} from '@deps/queries/api/bpm-non-financial';
import { ReactComponent as AddIcon } from '@deps/styles/elements/icons/content/add-small.svg';
import { ZAHARA_API_DATE_FORMAT } from '@deps/types/constants';
import {
    SegmentTrackedEventName,
    TransactionSubmittedEventType,
    TransactionSuccessfulEvent,
} from '@deps/types/segment-analytics';
import {
    Address,
    AddressType,
    Country,
    Party,
    Policy,
    State,
    Transaction,
} from '@zinnia/api-types/types/sor';

export interface SideSheetAddressProps {
    isCurrentMailingAddress: boolean;
    isOnlyAddress: boolean;
    onCancel: () => void;
    policy: Policy;
    party?: Party;
    planCode?: string;
    policyNumber?: string;
    setCurrentAddresses: Dispatch<SetStateAction<Address[]>>;
    updateAddress?: Address;
}

dayjs.extend(utc);

const SideSheetAddress = ({
    isCurrentMailingAddress,
    isOnlyAddress,
    onCancel,
    party,
    planCode,
    policy,
    policyNumber,
    setCurrentAddresses,
    updateAddress,
}: SideSheetAddressProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: 'people.sideSheet.address',
    });
    const { t: defaultT } = useTranslation();
    const router = useRouter();
    const correlationIdFromRoute =
        typeof router?.query?.correlationId === 'string'
            ? router?.query?.correlationId
            : undefined;

    const { partyId: userId, sessionId } = usePermissionsContext();
    const INITIAL_ADDRESS: Address = {
        addressType: AddressType.RESIDENCE,
        country: Country.US,
    };

    const INITIAL_BODY: NonFinancialTransactionBody = {
        correlationId: uuidV4(),
        effectiveDate: dayjs.utc().format(ZAHARA_API_DATE_FORMAT),
        preferredAddressIndicator: isCurrentMailingAddress
            ? PreferredAddressIndicator.Yes
            : PreferredAddressIndicator.No,
        reverseInitiator: false,
    };

    const [action, setAction] = useState(
        updateAddress
            ? NonFinancialTransactionActions.Edit
            : NonFinancialTransactionActions.Add
    );
    const [address, setAddress] = useState(updateAddress ?? INITIAL_ADDRESS);
    const [addressLines, setAddressLines] = useState(
        updateAddress?.addressLine3 ? 3 : updateAddress?.addressLine2 ? 2 : 1
    );
    const [body, setBody] = useState(INITIAL_BODY);
    const [caseDocumentOptions, setCaseDocumentOptions] = useState<
        CaseDocumentOption[]
    >([]);
    const [currentErrors, setCurrentErrors] = useState<Errors>();
    const [validationResults, setValidationResults] = useState<
        ValidationResult[]
    >([]);
    const [viewState, setViewState] = useState<ViewState>(ViewState.Default);
    const [newCaseId, setNewCaseId] = useState<string>();

    const { errorRef, triggerErrorFocus } = useFocusOnError(currentErrors);

    const { addressType } = address;
    const { caseId } = body;
    const { partyId } = party ?? {};

    const isAdd = action === NonFinancialTransactionActions.Add;
    const isDelete = action === NonFinancialTransactionActions.Delete;
    const isEdit = action === NonFinancialTransactionActions.Edit;
    const isSelectedMailingAddress =
        body.preferredAddressIndicator === PreferredAddressIndicator.Yes;
    const stopLoading =
        currentErrors === undefined
            ? true
            : !!Object.entries(currentErrors).length;

    const addressTypeOptions = getAddressTypeOptions({ t: defaultT });
    const stateOptions = getStateCodes().map((state) => ({
        label: state,
        value: state,
    }));

    const addressTypeTranslation = mapAddressTypeToTranslation({
        addressType,
        lowercase: true,
        t: defaultT,
    });
    const mailingAddressAssistiveText =
        isCurrentMailingAddress && !isSelectedMailingAddress
            ? t('mailingAddressAssitiveText.remove')
            : !isCurrentMailingAddress && isSelectedMailingAddress
            ? t('mailingAddressAssitiveText.add')
            : '';
    const mainCtaText = isAdd
        ? t('mainCta.add', { type: addressTypeTranslation })
        : t('mainCta.update', { type: addressTypeTranslation });

    const handleZipChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const digits = event.target.value.replace(/\D/g, '').substring(0, 9);

        setCurrentErrors((prevState) => {
            const { zipCode, ...errors } = prevState ?? {};
            return errors;
        });

        setAddress((prevState) => ({
            ...prevState,
            zipCode: digits.substring(0, 5),
            zipCodeExtension: digits.substring(5, 9),
        }));
    };

    const handleDelete = async () => {
        const reqBody = {
            ...body,
            address,
            deleteRequest: true,
        };
        const response = await editNonFinancialTransaction({
            body: reqBody,
            itemId: updateAddress?.addressId,
            partyId,
            planCode,
            policyNumber,
            transaction: NonFinancialTransactions.Address,
        });
        const onSuccessfulSubmit = (caseId: string) => {
            segmentAnalyticsTrackEvent<TransactionSuccessfulEvent>(
                SegmentTrackedEventName.TransactionSubmitted,
                buildNonFinancialTransactionsSubmittedEvent({
                    transactionSubmittedEventType:
                        TransactionSubmittedEventType.REMOVE_ADDRESS,
                    query: reqBody,
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
        const errors = getFormErrors({ address, caseId, isDelete, t });
        setCurrentErrors(errors);
        if (hasErrorsAndFocus(errors, triggerErrorFocus)) return;

        if (isDelete) {
            setViewState(ViewState.Warn);
            return;
        }

        let response;

        if (isAdd) {
            response = await addNonFinancialTransaction({
                body: {
                    ...body,
                    address,
                },
                partyId,
                planCode,
                policyNumber,
                transaction: NonFinancialTransactions.Address,
            });
        } else {
            response = await editNonFinancialTransaction({
                body: {
                    ...body,
                    address,
                },
                itemId: updateAddress?.addressId,
                partyId,
                planCode,
                policyNumber,
                transaction: NonFinancialTransactions.Address,
            });
        }

        const onSuccessfulSubmit = (caseId: string) => {
            setNewCaseId(caseId);
            segmentAnalyticsTrackEvent<TransactionSuccessfulEvent>(
                SegmentTrackedEventName.TransactionSubmitted,
                buildNonFinancialTransactionsSubmittedEvent({
                    transactionSubmittedEventType: isAdd
                        ? TransactionSubmittedEventType.ADD_ADDRESS
                        : TransactionSubmittedEventType.UPDATE_ADDRESS,
                    query: body,
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
                    transaction={NonFinancialTransactions.Address}
                    validationResults={validationResults}
                >
                    <AddressDetails
                        address={address}
                        isSelectedMailingAddress={isSelectedMailingAddress}
                    />
                </BpmErrorState>
            );
        case ViewState.ApiError:
            return (
                <ApiErrorState
                    action={action}
                    name={getFirstLastName(party)}
                    onCancel={onCancel}
                    onContinue={handleSubmit}
                    transaction={NonFinancialTransactions.Address}
                    type={addressTypeTranslation}
                />
            );
        case ViewState.Warn:
            return (
                <WarnState
                    isMailingAddress={isCurrentMailingAddress}
                    name={getFirstLastName(party)}
                    onCancel={onCancel}
                    onContinue={handleDelete}
                    transaction={NonFinancialTransactions.Address}
                    type={addressTypeTranslation}
                />
            );
        case ViewState.Success:
            updateOptimistically({
                action,
                idKey: NonFinancialTransactionIdKeys.Address,
                newItem: address,
                setState: setCurrentAddresses,
            });

            return (
                <SuccessState
                    action={action}
                    name={getFirstLastName(party)}
                    onCancel={onCancel}
                    transaction={NonFinancialTransactions.Address}
                    type={addressTypeTranslation}
                    caseId={newCaseId}
                />
            );
        case ViewState.Default:
        default:
            break;
    }

    return (
        <div ref={errorRef} className="flex flex-col gap-6 p-10">
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
                processSubType={[Processes.AddressChange]}
                correlationId={correlationIdFromRoute}
                body={body}
            />

            {isAdd && (
                <Radio
                    items={addressTypeOptions}
                    label={t('labels.addressType') as string}
                    onChange={(event) =>
                        setAddress((prevState) => ({
                            ...prevState,
                            addressType: event.target.value as AddressType,
                        }))
                    }
                    value={addressType}
                />
            )}

            <div className="flex flex-col gap-6">
                <div className="flex w-full flex-col items-start">
                    <div className="flex w-full flex-col gap-6">
                        <Field
                            errorId="addressLine1"
                            aria-label={t('labels.addressLine1') as string}
                            label={t('labels.address') as string}
                            message={currentErrors?.addressLine1}
                            onChange={(event) => {
                                setCurrentErrors((prevState) => {
                                    const { addressLine1, ...errors } =
                                        prevState ?? {};
                                    return errors;
                                });
                                setAddress((prevState) => ({
                                    ...prevState,
                                    addressLine1: event.target.value,
                                }));
                            }}
                            size={FieldSize.Small}
                            type={FieldType.BaseActive}
                            value={address.addressLine1}
                            variant={
                                currentErrors?.addressLine1
                                    ? FieldVariant.Error
                                    : isDelete
                                    ? FieldVariant.Inactive
                                    : FieldVariant.Default
                            }
                        />
                        <AdditionalAddressLine
                            aria-label={t('labels.addressLine2') as string}
                            disabled={isDelete}
                            label={t('labels.addressLine2') as string}
                            onChange={(event) =>
                                setAddress((prevState) => ({
                                    ...prevState,
                                    addressLine2: event.target.value,
                                }))
                            }
                            removeAddressLine={() => {
                                setAddress((prevState) => ({
                                    ...prevState,
                                    addressLine2: '',
                                }));
                                setAddressLines((prevState) => prevState - 1);
                            }}
                            show={addressLines >= 2}
                            value={address.addressLine2}
                        />
                        <AdditionalAddressLine
                            aria-label={t('labels.addressLine3') as string}
                            disabled={isDelete}
                            label={t('labels.addressLine3') as string}
                            onChange={(event) =>
                                setAddress((prevState) => ({
                                    ...prevState,
                                    addressLine3: event.target.value,
                                }))
                            }
                            removeAddressLine={() => {
                                setAddress((prevState) => ({
                                    ...prevState,
                                    addressLine3: '',
                                }));
                                setAddressLines((prevState) => prevState - 1);
                            }}
                            show={addressLines >= 3}
                            value={address.addressLine3}
                        />
                    </div>
                    <Transition
                        as="div"
                        className="mt-2"
                        show={addressLines < 3}
                        enter="transition ease-in-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <NavElement
                            disabled={isDelete}
                            onClick={() =>
                                setAddressLines((prevState) => prevState + 1)
                            }
                            size={NavElementSize.Small}
                            startIcon={<AddIcon height={20} width={20} />}
                            type={NavElementType.Button}
                        >
                            {t('general.addLine')}
                        </NavElement>
                    </Transition>
                </div>

                <div className="flex gap-4">
                    <div className="basis-1/4">
                        <Field
                            errorId="zipCode"
                            aria-label={t('labels.zip') as string}
                            disabled={isDelete}
                            label={t('labels.zip') as string}
                            message={currentErrors?.zipCode}
                            onChange={handleZipChange}
                            size={FieldSize.Small}
                            type={FieldType.BaseActive}
                            value={
                                address.zipCode
                                    ? address.zipCode.length === 5 &&
                                      address.zipCodeExtension
                                        ? `${address.zipCode}-${address.zipCodeExtension}`
                                        : address.zipCode +
                                          (address.zipCodeExtension || '')
                                    : ''
                            }
                            variant={
                                currentErrors?.zipCode
                                    ? FieldVariant.Error
                                    : isDelete
                                    ? FieldVariant.Inactive
                                    : FieldVariant.Default
                            }
                        />
                    </div>
                    <div className="flex-grow">
                        <Field
                            errorId="city"
                            aria-label={t('labels.city') as string}
                            label={t('labels.city') as string}
                            message={currentErrors?.city}
                            onChange={(event) => {
                                setCurrentErrors((prevState) => {
                                    const { city, ...errors } = prevState ?? {};
                                    return errors;
                                });
                                setAddress((prevState) => ({
                                    ...prevState,
                                    city: event.target.value,
                                }));
                            }}
                            size={FieldSize.Small}
                            type={FieldType.BaseActive}
                            value={toTitleCase(address.city)}
                            variant={
                                currentErrors?.city
                                    ? FieldVariant.Error
                                    : isDelete
                                    ? FieldVariant.Inactive
                                    : FieldVariant.Default
                            }
                        />
                    </div>
                    <div className="basis-1/4">
                        <SelectSimple
                            errorId="state"
                            aria-label={t('labels.state') as string}
                            disabled={isDelete}
                            label={t('labels.state') as string}
                            message={currentErrors?.state}
                            onChange={(value) => {
                                setCurrentErrors((prevState) => {
                                    const { state, ...errors } =
                                        prevState ?? {};
                                    return errors;
                                });
                                setAddress((prevState) => ({
                                    ...prevState,
                                    state: value as State,
                                }));
                            }}
                            options={stateOptions}
                            size={FieldSize.Small}
                            value={address.state}
                            variant={
                                currentErrors?.state
                                    ? FieldVariant.Error
                                    : FieldVariant.Default
                            }
                        />
                    </div>
                </div>

                <CheckboxText
                    assistiveText={{
                        text: mailingAddressAssistiveText,
                        variant: AssistiveTextVariant.Info,
                    }}
                    checked={isSelectedMailingAddress}
                    isDisabled={(isOnlyAddress && isEdit) || isDelete}
                    label={t('labels.setAsMailingAddress')}
                    onChange={(e) =>
                        setBody((prevState) => ({
                            ...prevState,
                            preferredAddressIndicator: e
                                ? PreferredAddressIndicator.Yes
                                : PreferredAddressIndicator.No,
                        }))
                    }
                />

                {!isAdd && (
                    <CheckboxText
                        checked={isDelete}
                        label={t('labels.removeAddress')}
                        onChange={(e) => {
                            setAction(
                                e
                                    ? NonFinancialTransactionActions.Delete
                                    : NonFinancialTransactionActions.Edit
                            );
                        }}
                    />
                )}
            </div>

            <TransactionCta
                className="mt-2"
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
                    type: Transaction.transactionType.ADDRESS_CHANGE,
                    correlationId: body.correlationId,
                }}
            />
        </div>
    );
};

export default SideSheetAddress;
