import { FieldProps } from '@rjsf/utils';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import DifferentAddress from '@deps/components/otp-send-document/components/different-address';
import { PiiWrapper } from '@deps/components/pii/PiiWrapper';
import {
    ClaimActionTypes,
    ClaimCommunicationTypes,
} from '@deps/containers/death-claim-container/death-claim.types';
import { lowerCaseJson } from '@deps/containers/death-claim-container/update-notification-method/update-notification-method-helper';
import { DynamicKey } from '@deps/containers/task-container/components/steps/claims/claims.type';
import { useSideSheetContextLegacy } from '@deps/contexts/SideSheetContext';
import { DataFormattingTypes } from '@deps/models/case/task';
import { AddressType } from '@zinnia/api-types/types/sor';

import { formatValueByDataType } from '../../templates/card-templates/card-template';

interface NotificationPreferences {
    address: {
        addressType: AddressType;
        addressLine1?: string;
        addressLine2?: string;
        addressLine3?: string;
        city?: string;
        state?: string;
        country?: string;
        zipCode?: string;
        zipCodeExtension?: string;
    };
    notificationMethod: {
        method: ClaimCommunicationTypes;
    };
    email?: {
        emailAddress: string;
        action: ClaimActionTypes;
    };
    fax?: {
        faxNumber: string;
        action: ClaimActionTypes;
    };
}

export const displayAddressType: Record<AddressType, string | undefined> = {
    [AddressType.POBOX]: 'PO Box',
    [AddressType.RESIDENCE]: 'Residential',
    [AddressType.BUSINESS]: 'Business',
    [AddressType.SEASONAL]: 'Seasonal',
    [AddressType.SECONDARY]: 'Secondary',
    [AddressType.MAILING]: 'Mailing',
};

function ChangeAddressField(props: FieldProps) {
    const { formContext, onChange: onFieldChange } = props;
    const { customData, setCustomData } = formContext;
    const { t } = useTranslation();
    const sideSheet = useSideSheetContextLegacy();

    const dynamicKey = customData.details?.beneAddress
        ? DynamicKey.BENE_ADDRESS
        : DynamicKey.BENE_FINAL_CONTACT_ATTEMPT;

    useEffect(() => {
        const updatedCustomData = customData;
        if (
            !updatedCustomData.task.data.details[dynamicKey]
                .beneficiaryChangeDetail
        ) {
            updatedCustomData.task.data.details[
                dynamicKey
            ].beneficiaryChangeDetail = {};
        }
        if (
            dynamicKey === DynamicKey.BENE_FINAL_CONTACT_ATTEMPT &&
            !updatedCustomData.task.data.details[dynamicKey]
                .subTaskBeneAddressChangeRequire
        ) {
            updatedCustomData.task.data.details[
                dynamicKey
            ].subTaskBeneAddressChangeRequire = false;
        }
        if (
            !updatedCustomData.task.data.details[dynamicKey]
                .beneficiaryChangeDetail.notificationPreferences
        ) {
            updatedCustomData.task.data.details[
                dynamicKey
            ].beneficiaryChangeDetail.notificationPreferences =
                updatedCustomData.task.data.details[
                    dynamicKey
                ]?.beneficiary?.notificationPreferences;
        }
        const details = { details: { ...updatedCustomData.details } };
        setCustomData(details);
    }, [customData, dynamicKey, setCustomData]);

    const handleCardClick = () => {
        // Initialize beneficiary and notificationPreferences if they don't exist
        if (!customData.details[dynamicKey]?.beneficiary) {
            customData.details[dynamicKey] = {
                ...customData.details[dynamicKey],
                beneficiary: {
                    notificationPreferences: {
                        address: {
                            addressType: AddressType.RESIDENCE,
                        },
                    },
                },
            };
        }

        const sideSheetContent = <div className="p-4">{formContent()}</div>;
        sideSheet.changeSideSheetContent(
            `Edit ${
                displayAddressType[
                    customData.details[dynamicKey]?.beneficiary
                        ?.notificationPreferences?.address
                        ?.addressType as AddressType
                ] || AddressType.RESIDENCE
            } Address`,
            sideSheetContent
        );
        sideSheet.handleOpen(true);
    };

    const handleAddressSubmit = (addressData: any) => {
        const updatedCustomData = customData;

        if (
            !updatedCustomData.task.data.details[dynamicKey]
                .beneficiaryChangeDetail
        ) {
            updatedCustomData.task.data.details[
                dynamicKey
            ].beneficiaryChangeDetail = {
                notificationPreferences: {
                    address: {
                        addressType: AddressType.RESIDENCE,
                    },
                    notificationMethod: {
                        method: ClaimCommunicationTypes.Mail,
                    },
                } as NotificationPreferences,
            };
        }

        if (!Object.keys(addressData || {}).length) {
            sideSheet.handleOpen(false);
            sideSheet.onClose();
            return;
        }

        const normalizeAddress = (addr: any) => ({
            addressLine1: addr.addressLine1?.trim() || '',
            addressLine2: addr.addressLine2?.trim() || '',
            addressLine3: addr.addressLine3?.trim() || '',
            city: addr.city?.trim() || '',
            country: addr.country || 'USA',
            state: addr.state?.trim() || '',
            zipCode: addr.zipCode?.trim() || '',
            zipCodeExtension: addr.zipCodeExtension?.trim() || '',
            addressType: addr.addressType || AddressType.RESIDENCE,
            action: ClaimActionTypes.NONE,
        });

        const stripAddressForComparison = (addr: any) => ({
            addressLine1: addr.addressLine1?.trim() || '',
            addressLine2: addr.addressLine2?.trim() || '',
            addressLine3: addr.addressLine3?.trim() || '',
            city: addr.city?.trim() || '',
            country: addr.country || 'USA',
            state: addr.state?.trim() || '',
            zipCode: addr.zipCode?.trim() || '',
            zipCodeExtension: addr.zipCodeExtension?.trim() || '',
        });

        const updatedAddress = normalizeAddress(addressData);

        const currentAddressInfo =
            updatedCustomData.task.data.details[dynamicKey]?.beneficiary
                ?.notificationPreferences?.address || {};

        const isEqual =
            lowerCaseJson(stripAddressForComparison(currentAddressInfo)) ===
            lowerCaseJson(stripAddressForComparison(addressData));

        updatedAddress.action = isEqual
            ? ClaimActionTypes.NONE
            : ClaimActionTypes.UPDATE;

        updatedCustomData.task.data.details[
            dynamicKey
        ].beneficiary.notificationPreferences = {
            ...updatedCustomData.task.data.details[dynamicKey].beneficiary
                .notificationPreferences,
            address: {
                ...currentAddressInfo,
                ...updatedAddress,
            },
        } as NotificationPreferences;

        const notificationPrefs =
            updatedCustomData.task.data.details[dynamicKey].beneficiary
                .notificationPreferences ||
            ({
                address: {
                    addressType: AddressType.RESIDENCE,
                },
                notificationMethod: {
                    method: ClaimCommunicationTypes.Mail,
                },
            } as NotificationPreferences);

        if (!isEqual) {
            updatedCustomData.task.data.details[
                dynamicKey
            ].beneficiaryChangeDetail.notificationPreferences = {
                ...notificationPrefs,
                address: {
                    ...notificationPrefs.address,
                    ...updatedAddress,
                },
                notificationMethod: {
                    method: ClaimCommunicationTypes.Mail,
                },
            };

            if (dynamicKey === DynamicKey.BENE_FINAL_CONTACT_ATTEMPT) {
                updatedCustomData.task.data.details[
                    dynamicKey
                ].subTaskBeneAddressChangeRequire = true;
                updatedCustomData.task.data.details[
                    dynamicKey
                ].beneficiaryChangeDetail.changeType =
                    'BENEFICIARY_ADDRESS_CHANGE';
                updatedCustomData.task.data.details[
                    dynamicKey
                ].beneficiaryChangeDetail.changeRequire = true;
            }
        }

        const details = { details: { ...updatedCustomData.details } };
        setCustomData(details);
        onFieldChange(updatedAddress);
        sideSheet.handleOpen(false);
        sideSheet.onClose();
    };

    const formContent = () => {
        return (
            <div className="px-4">
                <DifferentAddress
                    carrierId={customData.carrier}
                    handleClose={handleAddressSubmit}
                    showName={false}
                    isContainerClass={false}
                    isSideSheet={true}
                />
            </div>
        );
    };

    const isTaskCompleted = formContext.isReadOnlyOverride;
    return (
        <>
            <div className="flex gap-2">
                <>
                    <div
                        className={`flex w-[455px] rounded border border-gray-100 p-[12px]`}
                    >
                        <div className="grow">
                            <div className="flex flex-col text-sm font-normal text-gray-600">
                                <div className="font-bold text-gray-900">
                                    {displayAddressType[
                                        customData.details?.[dynamicKey]
                                            ?.beneficiary
                                            ?.notificationPreferences?.address
                                            ?.addressType as AddressType
                                    ] || AddressType.RESIDENCE}{' '}
                                    Address
                                </div>
                                <PiiWrapper>
                                    {customData.details?.[dynamicKey]
                                        ?.beneficiary?.notificationPreferences
                                        ?.address &&
                                        formatValueByDataType(
                                            DataFormattingTypes.DirtyAddress,
                                            customData.details[dynamicKey]
                                                .beneficiary
                                                .notificationPreferences.address
                                        )}
                                </PiiWrapper>
                            </div>
                        </div>
                        <div
                            onClick={
                                isTaskCompleted ? () => {} : handleCardClick
                            }
                            className={`flex justify-center items-center text-[var(--color-base-text-link)] ${
                                isTaskCompleted
                                    ? 'cursor-not-allowed opacity-50'
                                    : 'cursor-pointer'
                            }`}
                        >
                            {t('claimsAddressChange.change')}
                        </div>
                    </div>
                </>
            </div>
        </>
    );
}

export default ChangeAddressField;
