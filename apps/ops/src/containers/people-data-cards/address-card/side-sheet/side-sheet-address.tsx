import { Transition } from '@headlessui/react';
import dayjs from 'dayjs';
import { useTranslation } from 'next-i18next';
import { Dispatch, SetStateAction, useState } from 'react';
import { v4 as uuidV4 } from 'uuid';

import { AssistiveTextVariant } from '@deps/components/assistive-text/assistive-text';
import CaseDocumentSelect, { CaseDocumentOption, SetStateCaseId } from '@deps/components/case-document-select/case-document-select';
import CheckboxText from '@deps/components/checkbox/checkbox-text/checkbox-text';
import Field, { FieldType , FieldSize, FieldVariant } from '@deps/components/fields/field';
import NavElement, { NavElementSize, NavElementType } from '@deps/components/nav-element/nav-element';
import Radio from '@deps/components/radio/radio';
import SelectSimple from '@deps/components/select/select';
import {
    NonFinancialTransactionIdKeys,
    updateOptimistically,
} from '@deps/components/side-sheet/non-financial-transactions/non-financial-transactions.helper';
import ApiErrorState from '@deps/components/side-sheet/non-financial-transactions/states/api-error-state';
import BpmErrorState from '@deps/components/side-sheet/non-financial-transactions/states/bpm-error-state';
import LoadingState from '@deps/components/side-sheet/non-financial-transactions/states/loading-state';
import { ViewState, handleResponse } from '@deps/components/side-sheet/non-financial-transactions/states/states.helpers';
import SuccessState from '@deps/components/side-sheet/non-financial-transactions/states/success-state';
import WarnState from '@deps/components/side-sheet/non-financial-transactions/states/warn-state';
import TransactionCta from '@deps/components/transaction-cta/transaction-cta';
import { TranslationFiles } from '@deps/config/translations';
import {
    AdditionalAddressLine,
    AddressDetails,
    Errors,
    getAddressTypeOptions,
    getFormErrors,
} from '@deps/containers/people-data-cards/address-card/side-sheet/side-sheet-address.helpers';
import { getFirstLastName } from '@deps/helpers/party-info-helper';
import { getStateCodes } from '@deps/helpers/states.helper';
import { toTitleCase } from '@deps/helpers/string.helper';
import { mapAddressTypeToTranslation } from '@deps/helpers/translation.helper';
import { Processes } from '@deps/models/case/case';
import { Address, AddressType, PolicyAllOfPartiesItem, State } from '@deps/models/policy/sor-policy';
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

export interface SideSheetAddressProps {
    isCurrentMailingAddress: boolean;
    isOnlyAddress: boolean;
    onCancel: () => void;
    party?: PolicyAllOfPartiesItem;
    planCode?: string;
    policyNumber?: string;
    setCurrentAddresses: Dispatch<SetStateAction<Address[]>>;
    updateAddress?: Address;
}

const SideSheetAddress = ({
    isCurrentMailingAddress,
    isOnlyAddress,
    onCancel,
    party,
    planCode,
    policyNumber,
    setCurrentAddresses,
    updateAddress,
}: SideSheetAddressProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, { keyPrefix: 'people.sideSheet.address' });
    const { t: defaultT } = useTranslation();

    const INITIAL_ADDRESS: Address = {
        addressType: AddressType.RESIDENCE,
        country: 'US',
    };

    const INITIAL_BODY: NonFinancialTransactionBody = {
        correlationId: uuidV4(),
        effectiveDate: dayjs().format(ZAHARA_API_DATE_FORMAT),
        preferredAddressIndicator: isCurrentMailingAddress ? PreferredAddressIndicator.Yes : PreferredAddressIndicator.No,
        reverseInitiator: false,
    };

    const [action, setAction] = useState(updateAddress ? NonFinancialTransactionActions.Edit : NonFinancialTransactionActions.Add);
    const [address, setAddress] = useState(updateAddress ?? INITIAL_ADDRESS);
    const [addressLines, setAddressLines] = useState(updateAddress?.addressLine3 ? 3 : updateAddress?.addressLine2 ? 2 : 1);
    const [body, setBody] = useState(INITIAL_BODY);
    const [caseDocumentOptions, setCaseDocumentOptions] = useState<CaseDocumentOption[]>([]);
    const [currentErrors, setCurrentErrors] = useState<Errors>();
    const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);
    const [viewState, setViewState] = useState<ViewState>(ViewState.Default);

    const { addressType } = address;
    const { caseId } = body;
    const { partyId } = party ?? {};

    const isAdd = action === NonFinancialTransactionActions.Add;
    const isDelete = action === NonFinancialTransactionActions.Delete;
    const isEdit = action === NonFinancialTransactionActions.Edit;
    const isSelectedMailingAddress = body.preferredAddressIndicator === PreferredAddressIndicator.Yes;
    const stopLoading = currentErrors === undefined ? true : !!Object.entries(currentErrors).length;

    const addressTypeOptions = getAddressTypeOptions({ t: defaultT });
    const stateOptions = getStateCodes().map(state => ({ label: state, value: state }));

    const addressTypeTranslation = mapAddressTypeToTranslation({ addressType, lowercase: true, t: defaultT });
    const mailingAddressAssistiveText =
        isCurrentMailingAddress && !isSelectedMailingAddress
            ? t('mailingAddressAssitiveText.remove')
            : !isCurrentMailingAddress && isSelectedMailingAddress
            ? t('mailingAddressAssitiveText.add')
            : '';
    const mainCtaText = isAdd ? t('mainCta.add', { type: addressTypeTranslation }) : t('mainCta.update', { type: addressTypeTranslation });

    const handleDelete = async () => {
        const response = await editNonFinancialTransaction({
            body: {
                ...body,
                address,
                deleteRequest: true,
            },
            itemId: updateAddress?.addressId,
            partyId,
            planCode,
            policyNumber,
            transaction: NonFinancialTransactions.Address,
        });

        handleResponse({ response, setViewState, setValidationResults });
    };

    const handleSubmit = async () => {
        const errors = getFormErrors({ address, caseId, isDelete, t });
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

        handleResponse({ response, setViewState, setValidationResults });
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
                    <AddressDetails address={address} isSelectedMailingAddress={isSelectedMailingAddress} />
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
            updateOptimistically({ action, idKey: NonFinancialTransactionIdKeys.Address, newItem: address, setState: setCurrentAddresses });

            return (
                <SuccessState
                    action={action}
                    name={getFirstLastName(party)}
                    onCancel={onCancel}
                    transaction={NonFinancialTransactions.Address}
                    type={addressTypeTranslation}
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
            />

            {isAdd && (
                <Radio
                    items={addressTypeOptions}
                    label={t('labels.addressType') as string}
                    onChange={event => setAddress(prevState => ({ ...prevState, addressType: event.target.value as AddressType }))}
                    value={addressType}
                />
            )}

            <div className="flex flex-col gap-6">
                <div className="flex w-full flex-col items-start">
                    <div className="flex w-full flex-col gap-6">
                        <Field
                            aria-label={t('labels.addressLine1') as string}
                            label={t('labels.address') as string}
                            message={currentErrors?.addressLine1}
                            onChange={event => {
                                setCurrentErrors(prevState => {
                                    const { addressLine1, ...errors } = prevState ?? {};
                                    return errors;
                                });
                                setAddress(prevState => ({ ...prevState, addressLine1: event.target.value }));
                            }}
                            size={FieldSize.Small}
                            type={FieldType.BaseActive}
                            value={address.addressLine1}
                            variant={
                                currentErrors?.addressLine1 ? FieldVariant.Error : isDelete ? FieldVariant.Inactive : FieldVariant.Default
                            }
                        />
                        <AdditionalAddressLine
                            aria-label={t('labels.addressLine2') as string}
                            disabled={isDelete}
                            label={t('labels.addressLine2') as string}
                            onChange={event => setAddress(prevState => ({ ...prevState, addressLine2: event.target.value }))}
                            removeAddressLine={() => {
                                setAddress(prevState => ({ ...prevState, addressLine2: '' }));
                                setAddressLines(prevState => prevState - 1);
                            }}
                            show={addressLines >= 2}
                            value={address.addressLine2}
                        />
                        <AdditionalAddressLine
                            aria-label={t('labels.addressLine3') as string}
                            disabled={isDelete}
                            label={t('labels.addressLine3') as string}
                            onChange={event => setAddress(prevState => ({ ...prevState, addressLine3: event.target.value }))}
                            removeAddressLine={() => {
                                setAddress(prevState => ({ ...prevState, addressLine3: '' }));
                                setAddressLines(prevState => prevState - 1);
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
                            onClick={() => setAddressLines(prevState => prevState + 1)}
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
                            aria-label={t('labels.zip') as string}
                            disabled={isDelete}
                            formatOptions={{ format: '#####-####' }}
                            label={t('labels.zip') as string}
                            message={currentErrors?.zipCode}
                            onChange={event => {
                                setCurrentErrors(prevState => {
                                    const { zipCode, ...errors } = prevState ?? {};
                                    return errors;
                                });
                                setAddress(prevState => ({
                                    ...prevState,
                                    zipCode: event.target.value.substring(0, 5),
                                    zipCodeExtension: event.target.value.substring(5, 9),
                                }));
                            }}
                            size={FieldSize.Small}
                            type={FieldType.BaseActive}
                            value={(address.zipCode ?? '') + (address.zipCodeExtension ?? '')}
                            variant={currentErrors?.zipCode ? FieldVariant.Error : isDelete ? FieldVariant.Inactive : FieldVariant.Default}
                        />
                    </div>
                    <div className="flex-grow">
                        <Field
                            aria-label={t('labels.city') as string}
                            label={t('labels.city') as string}
                            message={currentErrors?.city}
                            onChange={event => {
                                setCurrentErrors(prevState => {
                                    const { city, ...errors } = prevState ?? {};
                                    return errors;
                                });
                                setAddress(prevState => ({ ...prevState, city: event.target.value }));
                            }}
                            size={FieldSize.Small}
                            type={FieldType.BaseActive}
                            value={toTitleCase(address.city)}
                            variant={currentErrors?.city ? FieldVariant.Error : isDelete ? FieldVariant.Inactive : FieldVariant.Default}
                        />
                    </div>
                    <div className="basis-1/4">
                        <SelectSimple
                            aria-label={t('labels.state') as string}
                            disabled={isDelete}
                            label={t('labels.state') as string}
                            message={currentErrors?.state}
                            onChange={value => {
                                setCurrentErrors(prevState => {
                                    const { state, ...errors } = prevState ?? {};
                                    return errors;
                                });
                                setAddress(prevState => ({ ...prevState, state: value as State }));
                            }}
                            options={stateOptions}
                            size={FieldSize.Small}
                            value={address.state}
                            variant={currentErrors?.state ? FieldVariant.Error : FieldVariant.Default}
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
                    onChange={e =>
                        setBody(prevState => ({
                            ...prevState,
                            preferredAddressIndicator: e ? PreferredAddressIndicator.Yes : PreferredAddressIndicator.No,
                        }))
                    }
                />

                {!isAdd && (
                    <CheckboxText
                        checked={isDelete}
                        label={t('labels.removeAddress')}
                        onChange={e => {
                            setAction(e ? NonFinancialTransactionActions.Delete : NonFinancialTransactionActions.Edit);
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
            />
        </div>
    );
};

export default SideSheetAddress;
