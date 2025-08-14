import { SearchRequest } from '@xd/api-types/dist/generated-types/documents-v3';
import { PartyType } from '@zinnia/api-types/types/sor';
import dayjs from 'dayjs';
import { useTranslation } from 'next-i18next';
import { useState } from 'react';
import { v4 as uuidV4 } from 'uuid';

import Field, {
    FieldSize,
    FieldType,
    FieldVariant,
} from '@deps/components/fields/field';
import FieldDateSelect from '@deps/components/fields/field-date-select/field-date-select';
import FileUpload from '@deps/components/file-upload/file-upload';
import Radio, {
    RadioOrientation,
    RadioVariant,
} from '@deps/components/radio/radio';
import SelectSimple from '@deps/components/select/select';
import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import { TranslationFiles } from '@deps/config/translations';
import {
    containerClasses,
    EntityTypeValue,
    RoleField,
    Roles,
    sectionClasses,
} from '@deps/constants/policy';
import {
    getPartyTypeOptions,
    getRelationshipOptions,
} from '@deps/constants/role';
import {
    genderOption,
    newPrefixOption,
    newTrustOptions,
    suffixOptions,
    TrustType,
} from '@deps/containers/bene-change/components/beneficiary-details/bene-identification/bene-identification.helpers';
import { convertToBase64 } from '@deps/containers/people-data-cards/name-card/sidesheet/sidesheet-name-card.helpers';
import { useRoleChange } from '@deps/contexts/RoleChangeContext';
import { uploadDocumentV2 } from '@deps/queries/api/documents';
import {
    EDS_DATE_DISPLAY_FORMAT,
    ZAHARA_API_DATE_FORMAT,
} from '@deps/types/constants';
import { SourceSystem } from '@deps/types/documents-v3';
import { browserLogError } from '@deps/utils/browser-logging';
import { parseErrorInformation } from '@deps/utils/server-logging';

import {
    countryOptions,
    getFileSubtype,
    BooleanOptions,
    getVariant,
    getFormattedDate,
    rolePartyCheck,
    roleCheck,
    normalizeRole,
    NO,
    IDENTIFICATIONS,
    CLIENT_COPY,
    NEW_BUSINESS,
    entityTypeOptions,
} from '../../role-change-helper';

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
    trustType: null,
    usCitizen: null,
    trustDate: null,
    entityType: null,
};

export interface RoleIdentificationProps {
    handleChange: any;
    handleIdentificationChange: any;
    isReadOnly: boolean;
    role: string;
    index: number;
    existingRoleData: any;
    policy: any;
}

const RoleIdentification = ({
    handleChange,
    handleIdentificationChange,
    isReadOnly,
    role,
    policy,
    existingRoleData,
    index,
}: RoleIdentificationProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: 'roleChange.roleDetails',
    });

    const { t: t2 } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: 'beneChange.beneDetails.identification',
    });

    const {
        roleData,
        setRoleData,
        currentErrors,
        setCurrentErrors,
        addRole,
        removeRole,
    } = useRoleChange();
    const newRole = role.toLowerCase().includes('new');

    const party = newRole
        ? roleData?.party || DEFAULT_PARTY_INSTANCE
        : existingRoleData?.party || DEFAULT_PARTY_INSTANCE;

    const identification = newRole
        ? roleData?.party?.identifications?.[0] || []
        : existingRoleData?.party?.identifications?.[0] || [];

    const genderOptions = genderOption(t2);
    const partyTypeOptions = getPartyTypeOptions(t, role);

    const [uploadedFiles, setUploadedFiles] = useState<File[]>(
        roleData?.documents || []
    );

    const relationshipToPartyOptions = getRelationshipOptions(t);

    const options = BooleanOptions(t);

    const trustOptions = newTrustOptions(t2);

    const entityType = entityTypeOptions(t);

    const firstNameExist =
        party?.firstName && party?.firstName.trim().length > 0;
    const lastNameExist = party?.lastName && party?.lastName.trim().length > 0;

    const { partyType = '' } = party || {};
    let dob = '';
    let trustDate = '';
    if (!newRole) {
        dob = getFormattedDate(party?.dateOfBirth);
        trustDate = getFormattedDate(party?.trustDate);
    }

    const isRolePartyCheck = !rolePartyCheck(
        normalizeRole(role),
        party?.partyType as PartyType
    );
    const isRoleCheck = roleCheck(normalizeRole(role));

    const showElement = () =>
        ![
            Roles.PAYOR,
            Roles.NEWPAYOR,
            Roles.THIRDPARTYDESIGNEE,
            Roles.NEWTHIRDPARTYDESIGNEE,
        ].includes(role.toUpperCase() as Roles);

    const handleFilesChange = async (files: File[]) => {
        const documents: any = [];
        if (!files.length) {
            setRoleData((prevData: any) => ({
                ...prevData,
                documents: [],
                supportingDocumentAttached: NO,
            }));
            setUploadedFiles(files);
            return;
        }
        const base64Results = await Promise.all(
            files.map((file) => convertToBase64(file))
        );

        files.forEach(async (file, index) => {
            const blob: Blob = file;
            const metaData = {
                sourceFileName: file.name,
                documentDate: dayjs().format(EDS_DATE_DISPLAY_FORMAT),
                fileType: getFileSubtype(blob),
                docClassification: SearchRequest.documentClassification.INBOUND,
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
                        documentDate: dayjs().format(ZAHARA_API_DATE_FORMAT),
                        documentType: metaData?.fileType,
                        documentName: metaData?.sourceFileName,
                        name: metaData?.sourceFileName,
                    };
                    documents.push(attachment);
                }
            } catch (error) {
                browserLogError(
                    'sidesheet-name-change: Error uploading document:',
                    {
                        ...parseErrorInformation(error),
                    }
                );
            }
            setRoleData((prevData: any) => ({
                ...prevData,
                documents,
                supportingDocumentAttached: 'Yes',
            }));
        });

        setUploadedFiles(files);
    };

    const onEntityTypeChange = (value: string) => {
        handleChange(RoleField.EntityType, value);
    };

    return (
        <div key={index}>
            <Typography variant={TypographyVariant.H2}>
                Identification
            </Typography>
            <div className={containerClasses}>
                <div className={sectionClasses}>
                    <div
                        className={`mb-6 ${
                            role.toUpperCase() === Roles.PAYOR ||
                            role.toUpperCase() === Roles.NEWPAYOR
                                ? 'pointer-events-none opacity-50 cursor-not-allowed'
                                : ''
                        }`}
                    >
                        <Radio
                            items={partyTypeOptions}
                            label={t('partyType') as string}
                            onChange={(e) => {
                                handleChange('partyType', e.target.value);
                            }}
                            value={party?.partyType}
                            orientation={'horizontal'}
                            disabled={isReadOnly}
                            variant={
                                isReadOnly
                                    ? RadioVariant.Inactive
                                    : RadioVariant.Default
                            }
                        />
                    </div>
                    {showElement() && (
                        <>
                            <div className="mb-6">
                                <SelectSimple
                                    label={t('relationshipParty') as string}
                                    options={relationshipToPartyOptions}
                                    onChange={(e) => {
                                        handleChange(RoleField.Relationship, e);
                                    }}
                                    size={FieldSize.Small}
                                    value={roleData?.relationshipToParty}
                                    variant={getVariant(
                                        RoleField.Relationship,
                                        roleData,
                                        isReadOnly
                                    )}
                                    disabled={isReadOnly}
                                    message={
                                        !roleData?.relationshipToParty &&
                                        !isReadOnly
                                            ? t(
                                                  'formValidations.relationshipToParty'
                                              )
                                            : ''
                                    }
                                    required
                                    data-testid="relationship-to-party"
                                />
                            </div>
                            <div
                                className={
                                    identification?.usCitizen == NO
                                        ? 'mb-6'
                                        : ''
                                }
                            >
                                <Radio
                                    items={options}
                                    label={t('usCitizen') as string}
                                    onChange={(e) => {
                                        handleIdentificationChange(
                                            IDENTIFICATIONS,
                                            0,
                                            RoleField.UsCitizen,
                                            e.target.value
                                        );
                                    }}
                                    value={identification?.usCitizen ?? ''}
                                    orientation={'horizontal'}
                                    variant={
                                        isReadOnly
                                            ? RadioVariant.Inactive
                                            : RadioVariant.Default
                                    }
                                    name={`partyType-${index}`}
                                />
                            </div>

                            {identification?.usCitizen === NO && (
                                <>
                                    <div className="mb-6">
                                        <Radio
                                            items={options}
                                            label={
                                                t('permanentResident') as string
                                            }
                                            onChange={(e) => {
                                                handleIdentificationChange(
                                                    IDENTIFICATIONS,
                                                    0,
                                                    RoleField.PermanentResident,
                                                    e.target.value
                                                );
                                            }}
                                            value={
                                                identification?.permanentResident ??
                                                ''
                                            }
                                            orientation={
                                                RadioOrientation.Horizontal
                                            }
                                            variant={
                                                isReadOnly
                                                    ? RadioVariant.Inactive
                                                    : RadioVariant.Default
                                            }
                                        />
                                    </div>
                                    <SelectSimple
                                        label={
                                            t('countryCitizenship') as string
                                        }
                                        options={countryOptions}
                                        onChange={(e) => {
                                            handleIdentificationChange(
                                                IDENTIFICATIONS,
                                                0,
                                                RoleField.IssueCountry,
                                                e
                                            );
                                        }}
                                        size={FieldSize.Small}
                                        value={
                                            identification?.issueCountry || ''
                                        }
                                        variant={
                                            isReadOnly
                                                ? FieldVariant.Inactive
                                                : FieldVariant.Default
                                        }
                                        disabled={isReadOnly}
                                    />
                                </>
                            )}
                        </>
                    )}
                </div>
            </div>
            <div className={containerClasses}>
                <div className={sectionClasses}>
                    {party?.partyType === PartyType.INDIVIDUAL && (
                        <div className="grid w-full grid-cols-5 gap-4">
                            <SelectSimple
                                label={t('prefix') as string}
                                options={newPrefixOption(t)}
                                onChange={(value) =>
                                    handleChange(RoleField.Prefix, value)
                                }
                                size={FieldSize.Small}
                                value={party?.prefix || ''}
                                variant={FieldVariant.Default}
                                disabled={isReadOnly}
                            />
                            <Field
                                label={t('firstName') as string}
                                message={
                                    !firstNameExist && !isReadOnly
                                        ? t('formValidations.firstName')
                                        : ''
                                }
                                onChange={(event) => {
                                    handleChange(
                                        RoleField.FirstName,
                                        event.target.value
                                    );
                                }}
                                size={FieldSize.Small}
                                type={FieldType.BaseActive}
                                value={party?.firstName || ''}
                                maxLength={15}
                                variant={getVariant(
                                    RoleField.FirstName,
                                    party,
                                    isReadOnly
                                )}
                                required
                                disabled={isReadOnly}
                            />
                            <Field
                                label={t(`middleName`) as string}
                                onChange={(event) => {
                                    handleChange(
                                        RoleField.MiddleName,
                                        event.target.value
                                    );
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
                                    handleChange(
                                        RoleField.LastName,
                                        event.target.value
                                    );
                                }}
                                message={
                                    !lastNameExist && !isReadOnly
                                        ? t('formValidations.lastName')
                                        : ''
                                }
                                size={FieldSize.Small}
                                type={FieldType.BaseActive}
                                value={party?.lastName || ''}
                                maxLength={40}
                                variant={getVariant(
                                    RoleField.LastName,
                                    party,
                                    isReadOnly
                                )}
                                required
                            />
                            <SelectSimple
                                label={t('suffix') as string}
                                options={suffixOptions(t)}
                                onChange={(value) =>
                                    handleChange(RoleField.Suffix, value)
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

                    {[PartyType.TRUST, PartyType.ORGANIZATION].includes(
                        party?.partyType
                    ) && (
                        <div className="grid w-full grid-cols-2">
                            <div className="flex flex-col gap-4">
                                <Field
                                    label={
                                        partyType == PartyType.TRUST
                                            ? t(`trustName`) || ''
                                            : t(`companyName`) || ''
                                    }
                                    message={
                                        !lastNameExist && !isReadOnly
                                            ? t('formValidations.fullName')
                                            : ''
                                    }
                                    onChange={(event) => {
                                        handleChange(
                                            RoleField.LastName,
                                            event.target.value
                                        );
                                    }}
                                    size={FieldSize.Small}
                                    type={FieldType.BaseActive}
                                    value={
                                        party?.lastName || party?.fullName || ''
                                    }
                                    maxLength={40}
                                    variant={getVariant(
                                        RoleField.LastName,
                                        party,
                                        isReadOnly
                                    )}
                                    required
                                />
                                {party?.partyType ===
                                    PartyType.ORGANIZATION && (
                                    <>
                                        <SelectSimple
                                            label={t('entityType') as string}
                                            options={entityType}
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
                                    </>
                                )}
                                {party?.partyType === PartyType.TRUST && (
                                    <>
                                        <SelectSimple
                                            label={t('trustType') as string}
                                            options={trustOptions}
                                            onChange={(value) =>
                                                handleChange('trustType', value)
                                            }
                                            size={FieldSize.Small}
                                            value={
                                                party?.trustType ??
                                                TrustType.Individual
                                            }
                                            variant={
                                                isReadOnly
                                                    ? FieldVariant.Inactive
                                                    : FieldVariant.Default
                                            }
                                            disabled={isReadOnly}
                                        />
                                        {showElement() && (
                                            <>
                                                {isRoleCheck && (
                                                    <FieldDateSelect
                                                        label={
                                                            t(
                                                                'trustDate'
                                                            ) as string
                                                        }
                                                        id="trustDate"
                                                        data-testid="trustDate"
                                                        isFutureDateDisabled={
                                                            false
                                                        }
                                                        onChange={(e) =>
                                                            handleChange(
                                                                RoleField.TrustDate,
                                                                e.target.value
                                                            )
                                                        }
                                                        size={FieldSize.Small}
                                                        type={
                                                            FieldType.BaseActive
                                                        }
                                                        value={
                                                            !newRole
                                                                ? trustDate
                                                                : party?.trustDate ||
                                                                  ''
                                                        }
                                                        maxLength={10}
                                                        disabled={isReadOnly}
                                                        message={
                                                            !party?.trustDate &&
                                                            !isReadOnly
                                                                ? t(
                                                                      'formValidations.trustDateRequired'
                                                                  )
                                                                : ''
                                                        }
                                                        variant={getVariant(
                                                            RoleField.TrustDate,
                                                            party,
                                                            isReadOnly
                                                        )}
                                                        required
                                                    />
                                                )}
                                            </>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className={containerClasses}>
                <div className={sectionClasses}>
                    <div className="grid w-full grid-cols-4 gap-4">
                        <div>
                            <div className="mb-6">
                                <Field
                                    label={t('ssn') as string}
                                    onChange={(e) =>
                                        handleIdentificationChange(
                                            IDENTIFICATIONS,
                                            0,
                                            RoleField.IdentificationValue,
                                            e.target.value
                                        )
                                    }
                                    formatOptions={{ format: '#########' }}
                                    size={FieldSize.Small}
                                    type={FieldType.BaseActive}
                                    value={
                                        identification?.identificationValue ||
                                        ''
                                    }
                                    maxLength={9}
                                    variant={
                                        isReadOnly
                                            ? FieldVariant.Inactive
                                            : FieldVariant.Default
                                    }
                                />
                            </div>

                            {isRolePartyCheck && (
                                <>
                                    <div className="mb-6">
                                        <Radio
                                            label={t('gender') as string}
                                            items={genderOptions}
                                            onChange={(e) =>
                                                handleChange(
                                                    RoleField.Gender,
                                                    e.target.value
                                                )
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
                                    <div>
                                        <FieldDateSelect
                                            label={t('dateOfBirth') as string}
                                            id="dateOfBirth"
                                            data-testid="dateOfBirth"
                                            isFutureDateDisabled={false}
                                            onChange={(e) =>
                                                handleChange(
                                                    RoleField.DateOfBirth,
                                                    e.target.value
                                                )
                                            }
                                            size={FieldSize.Small}
                                            type={FieldType.BaseActive}
                                            value={
                                                !newRole
                                                    ? dob
                                                    : party?.dateOfBirth || ''
                                            }
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
                    {(role.toUpperCase() === Roles.THIRDPARTYDESIGNEE ||
                        role.toUpperCase() === Roles.NEWTHIRDPARTYDESIGNEE) &&
                        party?.partyType === PartyType.TRUST && (
                            <div className="mb-7 w-[400px]">
                                <FileUpload
                                    value={uploadedFiles}
                                    onChange={handleFilesChange}
                                />
                            </div>
                        )}
                </div>
            </div>
        </div>
    );
};

export default RoleIdentification;
