import { SearchRequest } from '@xd/api-types/dist/generated-types/documents-v3';
import {
    Party,
    PartyType,
    Prefix,
    Suffix,
} from '@xd/api-types/dist/generated-types/sor';
import { AssistiveText, AssistiveTextVariant } from '@zinnia/bloom/components';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { ChangeEvent, useEffect, useState } from 'react';
import { v4 as uuidV4 } from 'uuid';

import CaseDocumentSelect, {
    CaseDocumentOption,
    SetStateCaseId,
} from '@deps/components/case-document-select/case-document-select';
import Field, {
    FieldSize,
    FieldType,
    FieldVariant,
} from '@deps/components/fields/field';
import { DATE_PICKER_FORMAT } from '@deps/components/fields/field-date-select/field-date-select';
import Radio, {
    RadioOrientation,
    RadioVariant,
} from '@deps/components/radio/radio';
import SelectSimple from '@deps/components/select/select';
import ApiErrorState from '@deps/components/side-sheet/side-sheet-transaction/non-financial-transactions/states/api-error-state';
import BpmErrorState from '@deps/components/side-sheet/side-sheet-transaction/non-financial-transactions/states/bpm-error-state';
import LoadingState from '@deps/components/side-sheet/side-sheet-transaction/non-financial-transactions/states/loading-state';
import {
    handleResponse,
    ViewState,
} from '@deps/components/side-sheet/side-sheet-transaction/non-financial-transactions/states/states.helpers';
import TransactionCta from '@deps/components/transaction-cta/transaction-cta';
import { TranslationFiles } from '@deps/config/translations';
import { usePermissionsContext } from '@deps/contexts/PermissionsContext';
import { segmentAnalyticsTrackEvent } from '@deps/helpers/analytics/segment-analytics';
import { buildNonFinancialTransactionsSubmittedEvent } from '@deps/helpers/analytics/submit-transaction-event';
import { getFileSubtype } from '@deps/helpers/document.helpers';
import { PolicyDetails } from '@deps/helpers/policy-sor/PolicyDetails';
import { Processes } from '@deps/models/case/case';
import { ValidationResult } from '@deps/queries/api/bpm';
import {
    NonFinancialTransactionActions,
    NonFinancialTransactionBody,
    NonFinancialTransactions,
    changePartyName,
} from '@deps/queries/api/bpm-non-financial';
import { uploadDocumentV2 } from '@deps/queries/api/documents';
import {
    CLIENT_COPY,
    DISPLAY_NAME,
    EDS_DATE_DISPLAY_FORMAT,
    NEW_BUSINESS,
    SOURCE,
    ZAHARA_API_DATE_FORMAT,
} from '@deps/types/constants';
import { SourceSystem } from '@deps/types/documents-v3';
import {
    TransactionSuccessfulEvent,
    SegmentTrackedEventName,
    TransactionSubmittedEventType,
} from '@deps/types/segment-analytics';
import { browserLogError } from '@deps/utils/browser-logging';
import { parseErrorInformation } from '@deps/utils/server-logging';

import {
    convertToBase64,
    Errors,
    getFormErrors,
    NameDetails,
} from './sidesheet-name-card.helpers';
import SuccessState from './success-state';
import { CustomYesDatePicker } from '../../../../components/custom-date-picker/custom-date-picker';
import FileUpload from '../../../../components/file-upload/file-upload';

interface ISidesheetNameCard {
    planCode?: string;
    onCancel: () => void;
    policyDetails: PolicyDetails;
    selectedPolicyParty?: Party;
}

interface IDocuments {
    documentId: string;
    documentDate: string;
    documentType: string;
}

dayjs.extend(utc);

export const SidesheetNameCard = ({
    policyDetails,
    planCode,
    onCancel,
    selectedPolicyParty,
}: ISidesheetNameCard) => {
    const { t } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: 'people.sideSheet.name',
    });
    const { t: defaultT } = useTranslation();
    const router = useRouter();
    const correlationIdFromRoute =
        typeof router?.query?.correlationId === 'string'
            ? router?.query?.correlationId
            : undefined;
    const { sessionId, partyId: userId } = usePermissionsContext();
    const INITIAL_BODY: NonFinancialTransactionBody = {
        correlationId: correlationIdFromRoute || uuidV4(),
        effectiveDate: dayjs.utc().format(ZAHARA_API_DATE_FORMAT),
        reverseInitiator: false,
    };
    const [body, setBody] = useState(INITIAL_BODY);

    const [firstName, setFirstName] = useState(
        selectedPolicyParty?.firstName ?? ''
    );
    const [lastName, setLastName] = useState(
        selectedPolicyParty?.lastName ?? ''
    );
    const [fullName, setFullName] = useState(
        selectedPolicyParty?.fullName ?? ''
    );
    const [middleName, setMiddleName] = useState(
        selectedPolicyParty?.middleName ?? ''
    );
    const [suffix, setSuffix] = useState<Suffix | undefined>(
        selectedPolicyParty?.suffix
    );
    const [prefix, setPrefix] = useState<Prefix | undefined>(
        selectedPolicyParty?.prefix
    );
    const [supportingDocumentAttached, setSupportingDocumentAttached] =
        useState('No');
    const [
        supportingDocumentMatchesWithNewName,
        setSupportingDocumentMatchesWithNewName,
    ] = useState('');
    const [
        signaturePresentOnDocumentForAllOwners,
        setSignaturePresentOnDocumentForAllOwners,
    ] = useState<string>('');

    const [currentErrors, setCurrentErrors] = useState<Errors>();

    const [newCaseId, setNewCaseId] = useState<string | undefined>(undefined);
    const [caseDocumentOptions, setCaseDocumentOptions] = useState<
        CaseDocumentOption[]
    >([]);
    const [validationResults, setValidationResults] = useState<
        ValidationResult[]
    >([]);
    const [viewState, setViewState] = useState(ViewState.Default);
    const stopLoading =
        currentErrors === undefined
            ? true
            : !!Object.entries(currentErrors).length;
    const prefixOptions = [
        Prefix.MR,
        Prefix.MS,
        Prefix.MISS,
        Prefix.DR_,
        Prefix.MRS_,
    ].map((option) => ({ label: option, value: option }));

    const [dateOfSignature, setDateOfSignature] = useState('');
    const [dateOfSignatureError, setDateOfSignatureError] = useState(false);
    const suffixOptions = [
        Suffix.I,
        Suffix.II,
        Suffix.III,
        Suffix.JR,
        Suffix.SN,
    ].map((option) => ({ label: option, value: option }));
    const [selectedOption, setSelectedOption] = useState('');
    const documentMatchesOptions = ['Yes', 'No'].map((option) => ({
        label: option,
        value: option,
    }));
    const [documents, setDocuments] = useState<IDocuments[] | undefined>();
    const dateChangeHandler = (e: any) => {
        e.target.value.length > 0
            ? setDateOfSignatureError(false)
            : setDateOfSignatureError(true);
        setCurrentErrors((prevState) => {
            const { dateOfSignature, ...errors } = prevState ?? {};
            return errors;
        });
        setDateOfSignature(e.target.value);
    };
    const documentAttachedOptions = ['Yes', 'No'].map((option) => {
        if (option === 'Yes') {
            return {
                label: option,
                value: option,
                subElement: (
                    <CustomYesDatePicker
                        option={selectedOption}
                        onChange={dateChangeHandler}
                        value={dateOfSignature}
                        error={
                            dateOfSignatureError ||
                            currentErrors?.dateOfSignature?.length
                                ? true
                                : false
                        }
                        formatOptions={{ format: '##/##/####' }}
                        placeholder={t('dateOfSignature') as string}
                        id="dateOfSignature"
                        label={t('dateOfSignature') as string}
                    />
                ),
            };
        } else {
            return { label: option, value: option };
        }
    });
    const party = policyDetails.parties.getPartyById(
        selectedPolicyParty?.partyId ?? ''
    );
    const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
    const [uploadError, setUploadError] = useState<string | null>(null);

    useEffect(() => {
        if (uploadedFiles.length > 0) {
            setSupportingDocumentAttached('Yes');
        } else {
            setSupportingDocumentAttached('No');
        }
    }, [uploadedFiles.length]);

    const handleFilesChange = async (files: File[]) => {
        const newFiles = files.filter(
            (file) =>
                !uploadedFiles.some(
                    (uf) =>
                        uf.name === file.name &&
                        uf.size === file.size &&
                        uf.lastModified === file.lastModified
                )
        );

        if (newFiles.length === 0) {
            setUploadedFiles(files);
            return;
        }

        try {
            const base64Results = await Promise.all(
                newFiles.map((file) => convertToBase64(file))
            );
            const newAttachments: any[] = [];

            for (let i = 0; i < newFiles.length; i++) {
                const file = newFiles[i];
                const blob: Blob = file;
                const metaData = {
                    policyNumber: policyDetails.policyNumber || '',
                    planCode: policyDetails.planCode || '',
                    displayName: DISPLAY_NAME,
                    source: SOURCE,
                    sourceFileName: file.name,
                    documentDate: dayjs().format(EDS_DATE_DISPLAY_FORMAT),
                    fileType: getFileSubtype(blob),
                    docClassification:
                        SearchRequest.documentClassification.INBOUND,
                    sourceSystem: SourceSystem.ZL,
                    zinniaLiveCaseId: '',
                    parentCarrierCode: policyDetails.carrierId ?? '',
                    correlationId: uuidV4() || '',
                    docAccessLevel: CLIENT_COPY,
                    docCategory: NEW_BUSINESS,
                    documentType: '',
                };

                try {
                    const response = await uploadDocumentV2(
                        metaData,
                        base64Results[i]
                    );

                    if (response?.documentId) {
                        const attachment = {
                            documentId: response.documentId,
                            documentDate:
                                dateOfSignature.length > 0
                                    ? dateOfSignature
                                    : dayjs().format(ZAHARA_API_DATE_FORMAT),
                            documentType: metaData?.documentType,
                        };
                        newAttachments.push(attachment);
                    }
                } catch (error) {
                    setUploadError('Failed to upload file. Please try again.');
                    browserLogError(
                        'sidesheet-name-change: Error uploading document:',
                        {
                            ...parseErrorInformation(error),
                        }
                    );
                }
            }

            setDocuments((prev) => [...(prev || []), ...newAttachments]);
            setUploadedFiles(files);
        } catch (error) {
            setUploadError('Failed to process files. Please try again.');
        }
    };

    const handleSupportingDocumentMatchesWithNewName = (
        e: ChangeEvent<HTMLInputElement>
    ) => {
        setSupportingDocumentMatchesWithNewName(e.target.value);
        setCurrentErrors((prevState) => {
            const { supportingDocumentMatchesWithNewName, ...errors } =
                prevState ?? {};
            return errors;
        });
    };
    const handleSignPresentChange = (e: ChangeEvent<HTMLInputElement>) => {
        setSignaturePresentOnDocumentForAllOwners(e.target.value);
        setSelectedOption(e.target.value);
        setCurrentErrors((prevState) => {
            const { signaturePresentOnDocumentForAllOwners, ...errors } =
                prevState ?? {};
            return errors;
        });
    };

    const mainCtaText = t('mainCta.updateName');

    const getFullName = () => {
        switch (selectedPolicyParty?.partyType) {
            case PartyType.ORGANIZATION:
                return fullName;
            case PartyType.TRUST:
                return fullName;
            default:
                return `${firstName}${
                    middleName ? ' ' + middleName : ''
                } ${lastName}`;
        }
    };

    const handleSubmit = async () => {
        const caseId = body.caseId;
        const errors = getFormErrors({
            caseId,
            firstName,
            lastName,
            fullName,
            t: defaultT,
            type: selectedPolicyParty?.partyType,
            supportingDocumentMatchesWithNewName,
            signaturePresentOnDocumentForAllOwners,
            dateOfSignature,
            uploadedFiles,
        });

        setCurrentErrors(errors);
        if (Object.keys(errors).length > 0) {
            setCurrentErrors(errors);
            return;
        }

        const nameChangePayload = {
            correlationId: caseId ? INITIAL_BODY.correlationId : uuidV4(),
            effectiveDate: INITIAL_BODY.effectiveDate,
            partyName: {
                firstName,
                middleName: middleName,
                lastName,
                fullName: getFullName(),
                prefix,
                suffix,
                doingBusinessAs: selectedPolicyParty?.doingBusinessAs,
                abbreviatedName: selectedPolicyParty?.abbreviatedName,
            },
            supportingDocumentAttached,
            supportingDocumentMatchesWithNewName,
            signaturePresentOnDocumentForAllOwners,
            signatureDate:
                dateOfSignature.length > 0
                    ? dayjs(dateOfSignature, DATE_PICKER_FORMAT).format(
                          ZAHARA_API_DATE_FORMAT
                      )
                    : '',
            partyType: selectedPolicyParty?.partyType,
            documents,
        };

        const response = await changePartyName({
            partyId: party?.partyId ?? '',
            planCode: policyDetails.planCode ?? '',
            policyNumber: policyDetails.policyNumber ?? '',
            newPartyData: nameChangePayload,
        });

        const onSuccessfulSubmit = (caseId: string) => {
            setNewCaseId(caseId);
            segmentAnalyticsTrackEvent<TransactionSuccessfulEvent>(
                SegmentTrackedEventName.TransactionSubmitted,
                buildNonFinancialTransactionsSubmittedEvent({
                    transactionSubmittedEventType:
                        TransactionSubmittedEventType.UPDATE_NAME,
                    query: nameChangePayload,
                    caseId,
                    policy: policyDetails.policy,
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

    const getContent = () => {
        switch (selectedPolicyParty?.partyType) {
            case PartyType.ORGANIZATION:
                return (
                    <>
                        <div className="max-w-[250px]">
                            <Field
                                aria-label={t('organizationName') as string}
                                label={t('organizationName') as string}
                                message={currentErrors?.fullName}
                                onChange={(event) => {
                                    setFullName(event.target.value);
                                    setCurrentErrors((prevState) => {
                                        const { fullName, ...errors } =
                                            prevState ?? {};
                                        return errors;
                                    });
                                }}
                                size={FieldSize.Small}
                                type={FieldType.BaseActive}
                                value={fullName}
                                variant={
                                    currentErrors?.fullName
                                        ? FieldVariant.Error
                                        : FieldVariant.Default
                                }
                                required={true}
                            />
                        </div>
                    </>
                );
            case PartyType.TRUST:
                return (
                    <>
                        <div className="basis-1/2 max-w-[250px]">
                            <Field
                                aria-label={t('trustName') as string}
                                label={t('trustName') as string}
                                message={currentErrors?.fullName}
                                onChange={(event) => {
                                    setFullName(event.target.value);
                                    setCurrentErrors((prevState) => {
                                        const { fullName, ...errors } =
                                            prevState ?? {};
                                        return errors;
                                    });
                                }}
                                size={FieldSize.Small}
                                type={FieldType.BaseActive}
                                value={fullName}
                                variant={
                                    currentErrors?.fullName
                                        ? FieldVariant.Error
                                        : FieldVariant.Default
                                }
                                required={true}
                            />
                        </div>
                    </>
                );

            default:
                return (
                    <>
                        <div
                            role="group"
                            className="flex flex-col gap-4"
                            id="name-row1"
                        >
                            <div className="flex gap-4">
                                <div className="basis-1/4 max-w-[250px]">
                                    <SelectSimple
                                        aria-label={t('prefix') as string}
                                        label={t('prefix') as string}
                                        onChange={(value) => {
                                            setPrefix(value as Prefix);
                                        }}
                                        options={prefixOptions}
                                        size={FieldSize.Small}
                                        value={prefix}
                                        variant={FieldVariant.Default}
                                    />
                                </div>
                                <div className="basis-1/2">
                                    <Field
                                        aria-label={t('firstName') as string}
                                        label={t('firstName') as string}
                                        message={currentErrors?.firstName}
                                        onChange={(event) => {
                                            setFirstName(event.target.value);
                                            setCurrentErrors((prevState) => {
                                                const { firstName, ...errors } =
                                                    prevState ?? {};
                                                return errors;
                                            });
                                        }}
                                        size={FieldSize.Small}
                                        type={FieldType.BaseActive}
                                        value={firstName}
                                        variant={
                                            currentErrors?.firstName
                                                ? FieldVariant.Error
                                                : FieldVariant.Default
                                        }
                                        required={true}
                                    />
                                </div>
                                <div className="basis-1/4">
                                    <Field
                                        aria-label={t('middle') as string}
                                        label={t('middle') as string}
                                        onChange={(event) => {
                                            setMiddleName(event.target.value);
                                        }}
                                        size={FieldSize.Small}
                                        type={FieldType.BaseActive}
                                        value={middleName}
                                        variant={FieldVariant.Default}
                                    />
                                </div>
                            </div>
                        </div>

                        <div
                            role="group"
                            className="flex flex-col gap-4"
                            id="name-row1"
                        >
                            <div className="flex gap-4">
                                <div className="basis-1/2">
                                    <Field
                                        aria-label={t('lastName') as string}
                                        label={t('lastName') as string}
                                        message={currentErrors?.lastName}
                                        onChange={(event) => {
                                            setLastName(event.target.value);
                                            setCurrentErrors((prevState) => {
                                                const { lastName, ...errors } =
                                                    prevState ?? {};
                                                return errors;
                                            });
                                        }}
                                        size={FieldSize.Small}
                                        type={FieldType.BaseActive}
                                        value={lastName}
                                        variant={
                                            currentErrors?.lastName
                                                ? FieldVariant.Error
                                                : FieldVariant.Default
                                        }
                                        required={true}
                                    />
                                </div>
                                <div className="basis-1/4">
                                    <SelectSimple
                                        aria-label={t('suffix') as string}
                                        label={t('suffix') as string}
                                        onChange={(value) => {
                                            setSuffix(value as Suffix);
                                        }}
                                        options={suffixOptions}
                                        size={FieldSize.Small}
                                        value={suffix}
                                        variant={FieldVariant.Default}
                                    />
                                </div>
                            </div>
                        </div>
                    </>
                );
        }
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
                    transaction={NonFinancialTransactions.Name}
                    validationResults={validationResults}
                >
                    <NameDetails name={getFullName()} />
                </BpmErrorState>
            );
        case ViewState.ApiError:
            return (
                <ApiErrorState
                    action={NonFinancialTransactionActions.Edit}
                    name={party?.fullName ?? ''}
                    onCancel={onCancel}
                    onContinue={handleSubmit}
                    transaction={NonFinancialTransactions.Name}
                />
            );
        case ViewState.Success:
            return (
                <SuccessState
                    action={NonFinancialTransactionActions.Edit}
                    isNigo={!!validationResults?.length}
                    name={party?.fullName ?? ''}
                    oldName={party?.fullName ?? ''}
                    newName={getFullName()}
                    onCancel={onCancel}
                    transaction={NonFinancialTransactions.Name}
                    caseId={newCaseId}
                />
            );
        case ViewState.Default:
        default:
            return (
                <div
                    role="group"
                    id="comm-pref-form"
                    className="flex flex-col gap-8 p-8"
                >
                    <CaseDocumentSelect
                        caseDocumentOptions={caseDocumentOptions}
                        caseId={body.caseId}
                        currentErrors={currentErrors}
                        policyNumber={policyDetails.policyNumber}
                        processType={Processes.PolicyUpdate}
                        setBody={setBody as SetStateCaseId}
                        setCaseDocumentOptions={setCaseDocumentOptions}
                        setCurrentErrors={setCurrentErrors}
                        setViewState={setViewState}
                        required={true}
                    />

                    {getContent()}

                    <FileUpload
                        value={uploadedFiles}
                        onChange={handleFilesChange}
                        error={uploadError}
                        required={true}
                    />
                    <AssistiveText
                        variant={AssistiveTextVariant.Error}
                        text={currentErrors?.supportingDocumentRequired ?? ''}
                    />

                    <Radio
                        items={documentMatchesOptions}
                        orientation={RadioOrientation.Vertical}
                        onChange={handleSupportingDocumentMatchesWithNewName}
                        value={supportingDocumentMatchesWithNewName}
                        required={true}
                        disabled={false}
                        label={t('supportingDocMatches') as string}
                        name={'supportingDocumentMatchesWithNewName'}
                        variant={RadioVariant.Default}
                    />
                    <AssistiveText
                        variant={AssistiveTextVariant.Error}
                        text={
                            currentErrors?.supportingDocumentMatchesWithNewName ??
                            ''
                        }
                    />
                    <Radio
                        items={documentAttachedOptions}
                        orientation={RadioOrientation.Vertical}
                        onChange={handleSignPresentChange}
                        value={signaturePresentOnDocumentForAllOwners}
                        required={true}
                        label={t('signPresent') as string}
                        name={'signaturePresentOnDocumentForAllOwners'}
                        variant={RadioVariant.Default}
                    />
                    {signaturePresentOnDocumentForAllOwners === 'Yes' && (
                        <AssistiveText
                            variant={AssistiveTextVariant.Error}
                            text={currentErrors?.dateOfSignature ?? ''}
                        />
                    )}
                    <AssistiveText
                        variant={AssistiveTextVariant.Error}
                        text={
                            currentErrors?.signaturePresentOnDocumentForAllOwners ??
                            ''
                        }
                    />

                    <TransactionCta
                        className="mt-4"
                        mainCta={{
                            onClick: handleSubmit,
                            text: mainCtaText,
                        }}
                        secondaryCta={{
                            onClick: onCancel,
                            text: t('mainCta.cancel'),
                        }}
                        stopLoading={stopLoading}
                    />
                </div>
            );
    }
};
