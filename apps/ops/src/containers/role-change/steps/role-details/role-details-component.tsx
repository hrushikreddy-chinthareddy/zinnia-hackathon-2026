import dayjs from 'dayjs';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { v4 as uuidV4 } from 'uuid';

import InputCheckBox from '@deps/components/checkbox-v2/input-checkbox';
import Content, { ContentVariant } from '@deps/components/content/content';
import { FieldSize, FieldVariant } from '@deps/components/fields/field';
import FileUpload from '@deps/components/file-upload/file-upload';
import NavElement, {
    NavElementSize,
    NavElementType,
} from '@deps/components/nav-element/nav-element';
import Radio, { RadioOrientation } from '@deps/components/radio/radio';
import SelectSimple from '@deps/components/select/select';
import { TranslationFiles } from '@deps/config/translations';
import {
    containerClasses,
    PolicyRole,
    ReasonValue,
    RoleField,
    RoleLabel,
    Roles,
} from '@deps/constants/policy';
import { convertToBase64 } from '@deps/containers/people-data-cards/name-card/sidesheet/sidesheet-name-card.helpers';
import {
    useRoleChange,
    defaultRoleValue,
    RoleData,
} from '@deps/contexts/RoleChangeContext';
import { getFileSubtype } from '@deps/helpers/document.helpers';
import { Policy } from '@deps/models/policy/sor-policy';
import { uploadDocumentV2 } from '@deps/queries/api/documents';
import { ReactComponent as CancelIcon } from '@deps/styles/elements/icons/actions/cancel.svg';
import { ReactComponent as ChevronDown } from '@deps/styles/elements/icons/arrow/chevron-down.svg';
import { ReactComponent as ChevronUp } from '@deps/styles/elements/icons/icons_outlined/chevron-up.svg';
import {
    EDS_DATE_DISPLAY_FORMAT,
    SOURCE,
    ZAHARA_API_DATE_FORMAT,
} from '@deps/types/constants';
import { SourceSystem } from '@deps/types/documents-v3';
import { browserLogError } from '@deps/utils/browser-logging';
import { parseErrorInformation } from '@deps/utils/server-logging';
import { SearchRequest } from '@zinnia/api-types/types/documents-v3';

import ContactDetailsComponent from './contact-details-component';
import RoleIdentification from './role-identification';
import {
    BooleanOptions,
    getPartyName,
    ReasonOptions,
    NEW,
    GetIsReadOnly,
    NEW_BUSINESS,
    CLIENT_COPY,
    NO,
} from '../../role-change-helper';

const RoleDetailsComponent = ({
    policy,
    role,
    roleLabel,
    action,
    roleData,
    index,
}: {
    policy: Policy;
    role: PolicyRole;
    roleLabel: RoleLabel;
    action: any;
    roleData: RoleData;
    index: number;
}) => {
    const { t } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: 'roleChange.roleDetails',
    });
    const [uploadedFiles, setUploadedFiles] = useState<File[]>(
        roleData?.documents || []
    );
    const [uploadError, setUploadError] = useState<string | null>(null);

    const { setRoleData, setAddRole, removeRole, setRemoveRole } =
        useRoleChange();

    const isReadOnly = !role?.toLowerCase().includes(NEW);

    const [showRole, setShowRole] = useState<boolean>(
        role?.toLowerCase().includes(NEW) ? true : false
    );

    const options = BooleanOptions(t);

    const reasonOptions = ReasonOptions(t);
    const sectionClasses = 'flex flex-col p-4 md:p-6 lg:p-8';
    const labelClasses = 'flex items-center space-x-2';

    const handleChange = (key: any, value: any) => {
        setRoleData((prevState: any) => {
            if (
                [
                    RoleField.Relationship,
                    RoleField.ReasonChange,
                    RoleField.SupportingDocument,
                ].includes(key)
            ) {
                return {
                    ...prevState,
                    [key]: value,
                };
            } else {
                return {
                    ...prevState,
                    party: {
                        ...prevState.party,
                        [key]: value,
                    },
                };
            }
        });
    };

    const handleRolePartyChange = <
        T extends keyof typeof roleData.party,
        K extends keyof (typeof roleData.party)[T][0]
    >(
        arrayKey: T,
        index: number,
        key: K,
        value: any
    ) => {
        setRoleData((prevState: any) => {
            const updatedArray = [...(prevState.party[arrayKey] || [])];
            if (!updatedArray[index]) {
                updatedArray[index] = {};
            }
            updatedArray[index] = {
                ...updatedArray[index],
                [key]: value,
            };
            return {
                ...prevState,
                party: {
                    ...prevState.party,
                    [arrayKey]: updatedArray,
                },
            };
        });
    };

    const handleFilesChange = async (files: File[]) => {
        // Helper to check if two files are the same
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
            setRoleData((prevData: any) => ({
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

        const updatedDocuments = (roleData?.documents || []).slice();

        const getSupportingDocumentType = (role: PolicyRole) => {
            switch (role.toUpperCase()) {
                case Roles.NEWOWNER:
                    return 'Owner Change Supporting Document';
                case Roles.NEWJOINTOWNER:
                    return 'Joint Owner Change Supporting Document';
                case Roles.NEWPAYOR:
                    return 'Payor Change Supporting Document';
                case Roles.NEWTHIRDPARTYDESIGNEE:
                    return 'Third Party Designee Change Supporting Document';
                default:
                    return 'Unknown Supporting Document';
            }
        };

        await Promise.all(
            newFiles.map(async (file, index) => {
                const blob: Blob = file;

                const metaData = {
                    policyNumber: policy.policyNumber || '',
                    planCode: policy.product?.planCode || '',
                    displayName: getSupportingDocumentType(role),
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

        setRoleData((prevData: any) => ({
            ...prevData,
            documents: updatedDocuments,
        }));
        setUploadedFiles(files);
    };

    const isRelevantChangeHandler = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        handleChange(RoleField.SupportingDocument, e.target.value);
        setRoleData((prevData) => ({
            ...prevData,
            supportingDocumentAttached: e.target.value,
        }));
    };

    return (
        <div
            className={
                removeRole && !role?.toLowerCase().includes(NEW)
                    ? 'my-4 w-full rounded-sm border-2 bg-gray-50 p-8'
                    : 'my-4 w-full rounded-sm border-2 p-8'
            }
        >
            <div
                className={
                    showRole
                        ? 'flex justify-between mb-8'
                        : 'flex justify-between'
                }
            >
                {action == 'Add' ? (
                    <div className="font-primary text-xl">
                        {`New ${roleLabel}`}
                    </div>
                ) : (
                    <div className="flex items-center gap-2">
                        <div className="font-primary text-xl">
                            <span className={removeRole ? 'text-gray-200' : ''}>
                                {roleData?.party?.fullName ||
                                    getPartyName(roleData?.party as any)}
                            </span>
                        </div>
                    </div>
                )}
                <div className="flex">
                    <div className="flex flex-col gap-6">
                        {action == 'Add' ? (
                            <label className={`${labelClasses} cursor-pointer`}>
                                <button
                                    aria-label={
                                        t('beneficiaryListing.cancel') as string
                                    }
                                    className="default-focus-icons flex justify-start rounded-xl"
                                    onClick={() => {
                                        setAddRole(true);
                                        setRoleData(defaultRoleValue.roleData);
                                        setRemoveRole(false);
                                    }}
                                >
                                    <CancelIcon height={24} width={24} />
                                </button>
                                <Content
                                    details={'Cancel' as string}
                                    variant={ContentVariant.BodySm}
                                    contentClassName="items-center flex"
                                />
                            </label>
                        ) : (
                            <label
                                className={`${labelClasses} ${
                                    role == PolicyRole.THIRDPARTYDESIGNEE
                                        ? 'pointer-events-none opacity-50 cursor-not-allowed'
                                        : 'cursor-pointer'
                                }`}
                            >
                                <InputCheckBox
                                    isDisabled={false}
                                    checked={removeRole}
                                    onChange={() => setRemoveRole(!removeRole)}
                                />
                                <Content
                                    details={'Remove' as string}
                                    variant={ContentVariant.BodySm}
                                    contentClassName="items-center flex"
                                />
                            </label>
                        )}
                    </div>
                    <div>
                        <div
                            onClick={() => setShowRole(!showRole)}
                            className="ml-6"
                        >
                            <ChevronDown
                                height={24}
                                width={24}
                                className={
                                    'simple-transition  self-center text-secondary ' +
                                    (showRole ? 'flip180' : '')
                                }
                            />
                        </div>
                    </div>
                </div>
            </div>

            {showRole && (
                <>
                    {[Roles.NEWPAYOR].includes(role.toUpperCase() as Roles) && (
                        <div className={containerClasses}>
                            <div className={sectionClasses}>
                                <div className="mb-7 w-[400px]">
                                    <FileUpload
                                        value={uploadedFiles}
                                        onChange={handleFilesChange}
                                        error={uploadError}
                                    />
                                </div>
                                <Radio
                                    items={options}
                                    label={t('documentsAvailable') as string}
                                    value={
                                        roleData?.supportingDocumentAttached ||
                                        null
                                    }
                                    onChange={isRelevantChangeHandler}
                                    orientation={RadioOrientation.Horizontal}
                                />
                            </div>
                        </div>
                    )}
                    {[Roles.NEWOWNER, Roles.NEWJOINTOWNER].includes(
                        role.toUpperCase() as Roles
                    ) && (
                        <div className={containerClasses}>
                            <div className={sectionClasses}>
                                <div className="mb-6">
                                    <SelectSimple
                                        label={t('changeReason') as string}
                                        options={reasonOptions}
                                        onChange={(e) =>
                                            handleChange(
                                                RoleField.ReasonChange,
                                                e
                                            )
                                        }
                                        size={FieldSize.Small}
                                        value={roleData?.changeReason}
                                        variant={
                                            roleData?.changeReason ==
                                            ReasonValue.OwnerDeath
                                                ? FieldVariant.Error
                                                : FieldVariant.Default
                                        }
                                        disabled={false}
                                        message={
                                            roleData?.changeReason ==
                                            ReasonValue.OwnerDeath
                                                ? (t(
                                                      'formValidations.reason'
                                                  ) as string)
                                                : ''
                                        }
                                    />
                                </div>
                                <div className="mb-7 w-[400px]">
                                    <FileUpload
                                        value={uploadedFiles}
                                        onChange={handleFilesChange}
                                        error={uploadError}
                                    />
                                </div>
                                <Radio
                                    items={options}
                                    label={t('documentsAvailable') as string}
                                    value={
                                        roleData?.supportingDocumentAttached ||
                                        null
                                    }
                                    onChange={(e) => {
                                        handleChange(
                                            RoleField.SupportingDocument,
                                            e.target.value
                                        );
                                    }}
                                    orientation={RadioOrientation.Horizontal}
                                />
                            </div>
                        </div>
                    )}
                    <div className="my-4">
                        <RoleIdentification
                            handleChange={handleChange}
                            handleIdentificationChange={handleRolePartyChange}
                            isReadOnly={GetIsReadOnly(isReadOnly, role)}
                            role={role}
                            index={index}
                            existingRoleData={roleData}
                            policy={policy}
                            handleFilesChange={handleFilesChange}
                            uploadedFiles={uploadedFiles}
                        />
                        <ContactDetailsComponent
                            handleChange={handleChange}
                            role={role}
                            isReadOnly={GetIsReadOnly(isReadOnly, role)}
                            roleLabel={roleLabel}
                            idx={index}
                            roleData={roleData}
                        />
                    </div>
                </>
            )}

            {showRole && (
                <div className="flex w-full justify-center align-middle">
                    <div className="flex">
                        <NavElement
                            onClick={() => {
                                setShowRole(!showRole);
                            }}
                            size={NavElementSize.Small}
                            startIcon={<ChevronUp height={20} width={20} />}
                            type={NavElementType.Button}
                        >
                            {t('close')}
                        </NavElement>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RoleDetailsComponent;
