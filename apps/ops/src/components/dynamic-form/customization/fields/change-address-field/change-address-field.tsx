import { FieldProps } from '@rjsf/utils';
import { useTranslation } from 'react-i18next';

import DifferentAddress from '@deps/components/otp-send-document/components/different-address';
import { PiiWrapper } from '@deps/components/pii/PiiWrapper';
import { ClaimActionTypes } from '@deps/containers/death-claim-container/death-claim.types';
import { lowerCaseJson } from '@deps/containers/death-claim-container/update-notification-method/update-notification-method-helper';
import { DynamicKey } from '@deps/containers/task-container/components/steps/claims/claims.type';
import { useSideSheetContextLegacy } from '@deps/contexts/SideSheetContext';
import { DataFormattingTypes } from '@deps/models/case/task';
import { AddressType } from '@zinnia/api-types/types/sor';

import { formatValueByDataType } from '../../templates/card-templates/card-template';

/** Map address type to display label. Uses AddressType from sor-policy. */
export const displayAddressType: Record<string, string | undefined> = {
    [AddressType.POBOX]: 'PO Box',
    [AddressType.RESIDENCE]: 'Residential',
    [AddressType.BUSINESS]: 'Business',
    [AddressType.SEASONAL]: 'Seasonal',
    [AddressType.SECONDARY]: 'Secondary',
    [AddressType.MAILING]: 'Mailing',
};

function ChangeAddressField(props: FieldProps) {
    const { formContext, onChange } = props;
    const { customData } = formContext;
    const { t } = useTranslation();
    const sideSheet = useSideSheetContextLegacy();

    const dynamicKey = customData.details?.beneAddress
        ? DynamicKey.BENE_ADDRESS
        : DynamicKey.BENE_FINAL_CONTACT_ATTEMPT;

    const handleCardClick = () => {
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
            customData.details[dynamicKey]?.beneficiary?.notificationPreferences
                ?.address || {};

        const isEqual =
            lowerCaseJson(stripAddressForComparison(currentAddressInfo)) ===
            lowerCaseJson(stripAddressForComparison(addressData));

        updatedAddress.action = isEqual
            ? ClaimActionTypes.NONE
            : ClaimActionTypes.UPDATE;

        onChange(updatedAddress);
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
