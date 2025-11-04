import { SearchRequest } from '@xd/api-types/dist/generated-types/documents-v3';
import { PartyType, Policy } from '@zinnia/api-types/types/sor';
import clsx from 'clsx';
import dayjs from 'dayjs';
import { useTranslation } from 'next-i18next';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { v4 as uuidV4 } from 'uuid';

import Field, {
    FieldSize,
    FieldType,
    FieldVariant,
} from '@deps/components/fields/field';
import FieldDateSelect, {
    DATE_PICKER_FORMAT,
} from '@deps/components/fields/field-date-select/field-date-select';
import FileUpload from '@deps/components/file-upload/file-upload';
import Radio, {
    RadioOrientation,
    RadioVariant,
} from '@deps/components/radio/radio';
import SelectSimple from '@deps/components/select/select';
import { TranslationFiles } from '@deps/config/translations';
import { EntityTypeValue } from '@deps/constants/policy';
import { convertToBase64 } from '@deps/containers/people-data-cards/name-card/sidesheet/sidesheet-name-card.helpers';
import {
    BooleanOptions,
    CLIENT_COPY,
    entityTypeOptions,
    NEW_BUSINESS,
    NO,
} from '@deps/containers/role-change/role-change-helper';
import { useOptimizely } from '@deps/contexts/OptimizelyContext';
import { getFileSubtype } from '@deps/helpers/document.helpers';
import { formatSSN } from '@deps/helpers/string.helpers';
import { uploadDocumentV2 } from '@deps/queries/api/documents';
import {
    EDS_DATE_DISPLAY_FORMAT,
    SOURCE,
    ZAHARA_API_DATE_FORMAT,
} from '@deps/types/constants';
import { SourceSystem } from '@deps/types/documents-v3';
import { browserLogError } from '@deps/utils/browser-logging';
import { FEATURE_FLAGS } from '@deps/utils/optimizely/flags';
import { parseErrorInformation } from '@deps/utils/server-logging';

import {
    Errors,
    formatPrefix,
    genderOption,
    newTrustOptions,
    prefixOption,
    suffixOptions,
    trustOption,
    TrustType,
    rolePartyCheck,
} from './bene-identification.helpers';
import PartyTypes from './party-type';

const DEFAULT_PARTY_INSTANCE = {
    partyType: PartyType.INDIVIDUAL,
    firstName: '',
    middleName: null,
    lastName: '',
    fullName: '',
    prefix: null,
    suffix: null,
    gender: '',
    ssn: '',
    dateOfBirth: null,
    trustType: TrustType.Individual,
    trustDate: null,
    entityType: EntityTypeValue.Other,
};

export interface BeneficiaryIdentificationProps {
    setCurrentParty: Dispatch<SetStateAction<any>>;
    updateParty?: any;
    isReadOnly?: boolean;
    existingBene?: boolean;
    policy: Policy;
}

const BeneficiaryIdentification = ({
    setCurrentParty,
    updateParty,
    isReadOnly,
    existingBene = false,
    policy,
}: BeneficiaryIdentificationProps) => {
    const containerClasses = clsx(
        'flex flex-col',
        'w-full  ',
        'rounded border-2 border-gray-100',
        'my-3 bg-gray-50'
    );
    const sectionClasses = 'flex flex-col p-4 md:p-6 lg:p-8';

    const { t } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: 'beneChange.beneDetails.identification',
    });

    const [partyIdentification, setPartyIdentification] = useState<PartyType>(
        updateParty?.partyType || PartyType.INDIVIDUAL
    );
    const [party, setParty] = useState<any>(
        updateParty ?? DEFAULT_PARTY_INSTANCE
    );
    const [currentErrors, setCurrentErrors] = useState<Errors>();

    const isRolePartyCheck = !rolePartyCheck(party?.partyType as PartyType);
    const { featureFlags } = useOptimizely();

    const trustEnumFlag = featureFlags[FEATURE_FLAGS.BENE_TRUST_TYPE_ENUM];
    const [uploadedFiles, setUploadedFiles] = useState<File[]>(
        updateParty.documents || []
    );
    const [uploadError, setUploadError] = useState<string | null>(null);
    const options = BooleanOptions(t);
    const [documentValid, setDocumentValid] = useState<string | null>(null);

    useEffect(() => {
        if (
            partyIdentification === PartyType.TRUST ||
            partyIdentification === PartyType.ORGANIZATION
        ) {
            setParty((prevState: any) => ({
                ...prevState,
                partyType: partyIdentification,
            }));
        } else if (partyIdentification === PartyType.INDIVIDUAL) {
            setParty((prevState: any) => ({
                ...prevState,
                partyType: partyIdentification,
                lastName: updateParty ? updateParty.lastName : '',
            }));
        } else {
            setParty((prevState: any) => ({
                ...prevState,
                partyType: partyIdentification,
            }));
        }
    }, [partyIdentification]);

    const dob =
        party?.dateOfBirth &&
        dayjs(party?.dateOfBirth, ZAHARA_API_DATE_FORMAT).isValid()
            ? dayjs(party?.dateOfBirth, ZAHARA_API_DATE_FORMAT).format(
                  DATE_PICKER_FORMAT
              )
            : '';
    const [dateOfBirth, setDateOfBirth] = useState(dob);

    useEffect(() => {
        setCurrentParty((prevState: any) => ({ ...prevState, ...party }));
        if (
            partyIdentification === PartyType.INDIVIDUAL &&
            !party?.firstName?.trim()
        ) {
            setCurrentErrors((prevState: any) => ({
                ...prevState,
                firstName: t('formValidations.firstName'),
            }));
        }
        if (
            (partyIdentification === PartyType.TRUST ||
                partyIdentification === PartyType.ORGANIZATION) &&
            !party.lastName
        ) {
            setCurrentErrors((prevState: any) => ({
                ...prevState,
                lastName: t('formValidations.lastName'),
            }));
        }
    }, [party, setCurrentParty, partyIdentification, t]);

    useEffect(() => {
        const dob = dateOfBirth
            ? dayjs(dateOfBirth, DATE_PICKER_FORMAT).format(
                  ZAHARA_API_DATE_FORMAT
              )
            : null;
        setParty((prevState: any) => ({ ...prevState, dateOfBirth: dob }));
    }, [dateOfBirth]);

    useEffect(() => {
        if (partyIdentification === PartyType.TRUST) {
            setCurrentParty((prevData: any) => ({
                ...prevData,
                supportingDocumentAttached: documentValid === 'Yes',
            }));
        }
    }, [documentValid, partyIdentification]);

    const getVariant = (key: string) => {
        return isReadOnly
            ? FieldVariant.Inactive
            : !party?.[key]?.trim()
            ? FieldVariant.Error
            : FieldVariant.Default;
    };

    const onChangeTrustDate = (event: React.ChangeEvent<HTMLInputElement>) => {
        setParty((prevState: any) => ({
            ...prevState,
            trustDate: event.target.value || null,
        }));
    };

    const onGenderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setParty((prevState: any) => ({
            ...prevState,
            gender: event.target.value,
        }));
    };
    const onCompanyNameChange = (event: any) => {
        setCurrentErrors((prevState: any) => {
            const { lastName, ...errors } = prevState ?? {};
            return errors;
        });
        setParty((prevState: any) => ({
            ...prevState,
            lastName: event.target.value,
        }));
    };

    const onEntityTypeChange = (value: string) => {
        setParty((prevState: any) => ({
            ...prevState,
            entityType: value,
        }));
    };

    const handleFilesChange = async (files: File[]) => {
        const isSameFile = (a: File, b: File) =>
            a.name === b.name &&
            a.size === b.size &&
            a.lastModified === b.lastModified;

        const newFiles = files.filter(
            (newFile) =>
                !uploadedFiles.some((uploadedFile) =>
                    isSameFile(newFile, uploadedFile)
                )
        );

        if (!files.length) {
            setCurrentParty((prevData: any) => ({
                ...prevData,
                documents: [],
                supportingDocumentAttached: NO,
            }));
            setUploadedFiles([]);
            return;
        }

        if (newFiles.length === 0) {
            setUploadedFiles(files);
            return;
        }

        const base64Results = await Promise.all(
            newFiles.map((file) => convertToBase64(file))
        );

        const updatedDocuments: {
            documentId: string;
            documentDate: string;
            documentType: string;
            documentName: string;
            name: string;
        }[] = [];

        await Promise.all(
            newFiles.map(async (file, index) => {
                const blob: Blob = file;

                const metaData = {
                    policyNumber: policy.policyNumber || '',
                    planCode: policy.product?.planCode || '',
                    displayName: 'Bene Change Supporting Document',
                    source: SOURCE,
                    sourceFileName: file.name,
                    documentDate: dayjs().format(EDS_DATE_DISPLAY_FORMAT),
                    fileType: getFileSubtype(blob),
                    docClassification:
                        SearchRequest.documentClassification.INBOUND,
                    sourceSystem: SourceSystem.ZL,
                    zinniaLiveCaseId: '',
                    parentCarrierCode: policy.carrierId ?? '',
                    correlationId: uuidV4() || '',
                    docAccessLevel: CLIENT_COPY,
                    docCategory: NEW_BUSINESS,
                    documentType: '',
                };

                try {
                    const response = await uploadDocumentV2(
                        metaData,
                        base64Results[index]
                    );

                    if (response?.documentId) {
                        const attachment = {
                            documentId: response?.documentId,
                            documentDate: dayjs().format(
                                ZAHARA_API_DATE_FORMAT
                            ),
                            documentType: metaData?.fileType,
                            documentName: metaData?.sourceFileName,
                            name: metaData?.sourceFileName,
                        };
                        updatedDocuments.push(attachment);
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
            })
        );
        setCurrentParty((prevData: any) => ({
            ...prevData,
            documents: updatedDocuments,
            supportingDocumentAttached: 'Yes',
        }));
        setUploadedFiles(files);
    };

    return (
        <div>
            <div className={containerClasses}>
                <div className={sectionClasses}>
                    <PartyTypes
                        partyIdentification={partyIdentification}
                        onPartyChange={setPartyIdentification}
                        isReadOnly={isReadOnly || existingBene}
                    />
                </div>
            </div>
            <div className={containerClasses}>
                <div className={sectionClasses}>
                    {partyIdentification === PartyType.INDIVIDUAL && (
                        <div className="my-4 grid w-full grid-cols-5 gap-4">
                            <SelectSimple
                                label={t('prefix') as string}
                                options={prefixOption(t)}
                                onChange={(value) =>
                                    setParty((prevState: any) => ({
                                        ...prevState,
                                        prefix: value,
                                    }))
                                }
                                size={FieldSize.Small}
                                value={formatPrefix(party?.prefix) || ''}
                                variant={FieldVariant.Default}
                                disabled={isReadOnly}
                            />
                            <Field
                                label={t('firstName') as string}
                                message={currentErrors?.firstName}
                                onChange={(event) => {
                                    setCurrentErrors((prevState: any) => {
                                        const { firstName, ...errors } =
                                            prevState ?? {};
                                        return errors;
                                    });
                                    setParty((prevState: any) => ({
                                        ...prevState,
                                        firstName: event.target.value,
                                    }));
                                }}
                                size={FieldSize.Small}
                                type={FieldType.BaseActive}
                                value={party?.firstName || ''}
                                maxLength={15}
                                variant={getVariant('firstName')}
                                required
                            />
                            <Field
                                label={t(`middleName`) as string}
                                onChange={(event) => {
                                    setParty((prevState: any) => ({
                                        ...prevState,
                                        middleName: event.target.value,
                                    }));
                                }}
                                size={FieldSize.Small}
                                type={FieldType.BaseActive}
                                value={party?.middleName || ''}
                                maxLength={15}
                                variant={
                                    isReadOnly
                                        ? FieldVariant.Inactive
                                        : FieldVariant.Default
                                }
                            />
                            <Field
                                label={t(`lastName`) as string}
                                onChange={(event) => {
                                    setParty((prevState: any) => ({
                                        ...prevState,
                                        lastName: event.target.value,
                                    }));
                                }}
                                message={
                                    !isReadOnly && !party?.lastName?.trim()
                                        ? t('formValidations.last')
                                        : ''
                                }
                                size={FieldSize.Small}
                                type={FieldType.BaseActive}
                                value={party?.lastName || ''}
                                maxLength={40}
                                variant={getVariant('lastName')}
                                required={true}
                            />
                            <SelectSimple
                                label={t('suffix') as string}
                                options={suffixOptions(t)}
                                onChange={(value) =>
                                    setParty((prevState: any) => ({
                                        ...prevState,
                                        suffix: value,
                                    }))
                                }
                                size={FieldSize.Small}
                                value={party?.suffix || ''}
                                variant={
                                    isReadOnly
                                        ? FieldVariant.Inactive
                                        : FieldVariant.Default
                                }
                                disabled={isReadOnly}
                            />
                        </div>
                    )}
                    {partyIdentification === PartyType.TRUST && (
                        <>
                            <div className="my-4 grid w-full grid-cols-2">
                                <div className="flex flex-col gap-4">
                                    <Field
                                        label={t(`trustName`) as string}
                                        message={currentErrors?.lastName}
                                        onChange={(event) => {
                                            setCurrentErrors(
                                                (prevState: any) => {
                                                    const {
                                                        lastName,
                                                        ...errors
                                                    } = prevState ?? {};
                                                    return errors;
                                                }
                                            );
                                            setParty((prevState: any) => ({
                                                ...prevState,
                                                lastName: event.target.value,
                                            }));
                                        }}
                                        size={FieldSize.Small}
                                        type={FieldType.BaseActive}
                                        value={party?.lastName || ''}
                                        maxLength={40}
                                        variant={
                                            isReadOnly
                                                ? FieldVariant.Inactive
                                                : currentErrors?.lastName
                                                ? FieldVariant.Error
                                                : FieldVariant.Default
                                        }
                                        required
                                    />
                                    <SelectSimple
                                        label={t('trustType') as string}
                                        options={
                                            trustEnumFlag
                                                ? trustOption(t)
                                                : newTrustOptions(t)
                                        }
                                        onChange={(value) =>
                                            setParty((prevState: any) => ({
                                                ...prevState,
                                                trustType: value,
                                            }))
                                        }
                                        size={FieldSize.Small}
                                        value={
                                            party.trustType ??
                                            TrustType.Individual
                                        }
                                        variant={FieldVariant.Default}
                                        disabled={isReadOnly}
                                    />
                                </div>
                            </div>
                            <div className="mb-7 w-[400px]">
                                <FileUpload
                                    value={uploadedFiles}
                                    onChange={handleFilesChange}
                                    error={uploadError}
                                />
                                <FieldDateSelect
                                    label={t('trustDate') as string}
                                    id="trustDate"
                                    data-testid="trustDate"
                                    isFutureDateDisabled={false}
                                    onChange={(e) => onChangeTrustDate(e)}
                                    size={FieldSize.Small}
                                    type={FieldType.BaseActive}
                                    value={party.trustDate || null}
                                    maxLength={10}
                                    disabled={isReadOnly}
                                    message={
                                        !party?.trustDate && !isReadOnly
                                            ? t(
                                                  'formValidations.trustDateRequired'
                                              )
                                            : ''
                                    }
                                    required
                                />
                            </div>
                            <Radio
                                items={options}
                                label={t('isRelevant') as string}
                                value={documentValid}
                                onChange={(e) => {
                                    setDocumentValid(e.target.value);
                                }}
                                orientation={RadioOrientation.Horizontal}
                            />
                        </>
                    )}

                    {partyIdentification === PartyType.ORGANIZATION && (
                        <div className="my-4 grid w-full grid-cols-2">
                            <div className="flex flex-col gap-4">
                                <Field
                                    label={t(`companyName`) as string}
                                    message={currentErrors?.lastName}
                                    onChange={onCompanyNameChange}
                                    size={FieldSize.Small}
                                    type={FieldType.BaseActive}
                                    value={party?.lastName || ''}
                                    maxLength={40}
                                    variant={
                                        isReadOnly
                                            ? FieldVariant.Inactive
                                            : currentErrors?.lastName
                                            ? FieldVariant.Error
                                            : FieldVariant.Default
                                    }
                                    required
                                />
                                <SelectSimple
                                    label={t('entityType') as string}
                                    options={entityTypeOptions(t)}
                                    onChange={onEntityTypeChange}
                                    size={FieldSize.Small}
                                    value={
                                        party?.entityType ??
                                        EntityTypeValue.Other
                                    }
                                    variant={
                                        isReadOnly
                                            ? FieldVariant.Inactive
                                            : FieldVariant.Default
                                    }
                                    disabled={isReadOnly}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className={containerClasses}>
                <div className={sectionClasses}>
                    <div className=" grid w-full grid-cols-4 gap-4">
                        <div>
                            <div className="mb-7">
                                <Field
                                    label={t('ssn') as string}
                                    onChange={(event) => {
                                        setParty((prevState: any) => ({
                                            ...prevState,
                                            ssn: event.target.value,
                                        }));
                                    }}
                                    formatOptions={{ format: '#########' }}
                                    size={FieldSize.Small}
                                    type={FieldType.BaseActive}
                                    value={
                                        existingBene
                                            ? formatSSN(party?.ssn || '')
                                            : party?.ssn || ''
                                    }
                                    maxLength={9}
                                    variant={
                                        isReadOnly || existingBene
                                            ? FieldVariant.Inactive
                                            : FieldVariant.Default
                                    }
                                    disabled={isReadOnly || existingBene}
                                />
                            </div>
                            {isRolePartyCheck && (
                                <>
                                    <div className="mb-7">
                                        <Radio
                                            label={t('gender') as string}
                                            items={genderOption(t)}
                                            onChange={(event) =>
                                                onGenderChange(event)
                                            }
                                            disabled={isReadOnly}
                                            value={party?.gender || ''}
                                            variant={
                                                isReadOnly
                                                    ? RadioVariant.Inactive
                                                    : RadioVariant.Default
                                            }
                                            name={'gender' + Math.random()}
                                        />
                                    </div>
                                    <div className="mb-7">
                                        <FieldDateSelect
                                            label={t('dateOfBirth') as string}
                                            id="dateOfBirth"
                                            data-testid="dateOfBirth"
                                            isFutureDateDisabled={false}
                                            onChange={(e) => {
                                                setDateOfBirth(e.target.value);
                                            }}
                                            size={FieldSize.Small}
                                            type={FieldType.BaseActive}
                                            value={dateOfBirth}
                                            maxLength={10}
                                            disabled={isReadOnly}
                                            variant={
                                                isReadOnly
                                                    ? FieldVariant.Inactive
                                                    : FieldVariant.Default
                                            }
                                        />
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BeneficiaryIdentification;
