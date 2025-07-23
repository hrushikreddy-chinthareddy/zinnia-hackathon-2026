import { AddressType } from '@xd/api-types/dist/generated-types/sor';
import { TFunction } from 'i18next';

import ButtonGrp from '@deps/components/button-group/button-group';
import DifferentAddress from '@deps/components/otp-send-document/components/different-address';
import EmailAddress from '@deps/components/otp-send-document/components/email-field';
import FaxNumber from '@deps/components/otp-send-document/components/fax-field';
import { TranslationFiles } from '@deps/config/translations';
import {
    ClaimActionTypes,
    ClaimCommunicationTypes,
} from '@deps/containers/death-claim-container/death-claim.types';
import { AddressTypeAndAddress } from '@deps/containers/small-data-card/address-data/address-data';

import { UpdatedBeneficiaryRecord } from './claims.type';

interface BeneficiaryNotificationChangeProps {
    beneficiary: UpdatedBeneficiaryRecord;
    setBeneficiary: React.Dispatch<
        React.SetStateAction<UpdatedBeneficiaryRecord>
    >;
    task: any;
    setAddressSelected: (addressSelected: boolean) => void;
    t: TFunction<TranslationFiles.COMMON, { keyPrefix: string }>;
    readOnly?: boolean;
}

function BeneficiaryNotificationChange({
    beneficiary,
    setBeneficiary,
    task,
    setAddressSelected,
    t,
    readOnly,
}: BeneficiaryNotificationChangeProps) {
    const handleAddressSubmit = (addressData: any) => {
        if (!Object.keys(addressData || {}).length) {
            return;
        }
        const updatedAddress = {
            ...beneficiary.notificationPreferences.address,
            ...addressData,
            action: ClaimActionTypes.UPDATE,
        };
        setAddressSelected(true);
        setBeneficiary({
            ...beneficiary,
            notificationPreferences: {
                ...beneficiary.notificationPreferences,
                address: updatedAddress,
            },
        });
    };

    const renderNotificationComponent = () => {
        switch (beneficiary.notificationPreferences.notificationMethod.method) {
            case ClaimCommunicationTypes.Mail:
                return (
                    <div
                        className={`col-span-4  ${
                            readOnly ? 'mt-2' : '-mt-10 -ml-8'
                        }`}
                    >
                        {readOnly ? (
                            <AddressTypeAndAddress
                                address={
                                    beneficiary.notificationPreferences.address
                                }
                                addressType={
                                    beneficiary.notificationPreferences.address
                                        .addressType as AddressType
                                }
                                isAddressChange={false}
                                isSideSheet={false}
                            />
                        ) : (
                            <DifferentAddress
                                carrierId={task.carrier ?? ''}
                                handleClose={handleAddressSubmit}
                                showName={false}
                                isCancel={false}
                                isContainerClass={false}
                            />
                        )}
                    </div>
                );
            case ClaimCommunicationTypes.Email:
                return (
                    <div className="col-span-4 mt-4">
                        <EmailAddress
                            isDisabled={readOnly}
                            email={
                                beneficiary.notificationPreferences.email
                                    ?.emailAddress ?? ''
                            }
                            setEmail={(val: string) =>
                                setBeneficiary({
                                    ...beneficiary,
                                    notificationPreferences: {
                                        ...beneficiary.notificationPreferences,
                                        email: {
                                            ...beneficiary
                                                .notificationPreferences.email,
                                            emailAddress: val,
                                            action: ClaimActionTypes.UPDATE,
                                        },
                                    },
                                })
                            }
                        />
                    </div>
                );
            case ClaimCommunicationTypes.Fax:
                return (
                    <div className="col-span-4 mt-4">
                        <FaxNumber
                            isDisabled={readOnly}
                            fax={
                                beneficiary.notificationPreferences.fax
                                    ?.faxNumber ?? ''
                            }
                            setFax={(val: string) =>
                                setBeneficiary({
                                    ...beneficiary,
                                    notificationPreferences: {
                                        ...beneficiary.notificationPreferences,
                                        fax: {
                                            ...beneficiary
                                                .notificationPreferences.fax,
                                            faxNumber: val,
                                            action: ClaimActionTypes.UPDATE,
                                        },
                                    },
                                })
                            }
                        />
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <>
            <ButtonGrp
                activeValue={
                    beneficiary.notificationPreferences.notificationMethod
                        .method || ''
                }
                groupLabel={t('notificationMethod')}
                toggle={(value) => {
                    setBeneficiary({
                        ...beneficiary,
                        notificationPreferences: {
                            ...task?.data?.details?.beneCall?.beneficiary
                                ?.notificationPreferences,
                            notificationMethod: {
                                action: ClaimActionTypes.UPDATE,
                                method: value,
                            },
                        },
                    });
                }}
                size="lg"
                labels={[
                    {
                        label: t('paperMail'),
                        value: ClaimCommunicationTypes.Mail,
                    },
                    { label: t('email'), value: ClaimCommunicationTypes.Email },
                    { label: t('fax'), value: ClaimCommunicationTypes.Fax },
                ]}
                disabled={readOnly}
            />
            {renderNotificationComponent()}
        </>
    );
}

export default BeneficiaryNotificationChange;
