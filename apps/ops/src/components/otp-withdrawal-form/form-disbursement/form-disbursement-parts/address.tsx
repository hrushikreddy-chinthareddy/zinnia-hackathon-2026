import { useEffect, useRef } from 'react';

import { Address } from '@deps/models/case/withdrawal/case';
import { DisbursementInformation } from '@deps/models/case/withdrawal/disbursement-types';

import AddressEntry from '../../address-entry';

const BankAddress = ({
    fieldName,
    classNames,
    isFormStateReadOnly,
    disbursementInformation,
    onDataChange,
    isAddressLine2Required = false,
    annuitantAddress,
}: DisbursementInformation) => {
    const isAnnuitant = disbursementInformation?.isAnnuitant;
    const address =
        !isFormStateReadOnly && isAnnuitant && annuitantAddress
            ? annuitantAddress
            : disbursementInformation?.address;

    const setAddress = (val: Address) => {
        onDataChange((ogData) => ({
            ...ogData,
            address: val,
        }));
    };

    // Track when address is reset to empty to force remount
    const resetCounterRef = useRef(0);
    const prevAddressRef = useRef(address);

    useEffect(() => {
        const prevAddress = prevAddressRef.current;
        const currentAddress = address;

        // Check if previous address had data
        const prevHadData =
            prevAddress?.addressLine1 ||
            prevAddress?.city ||
            prevAddress?.state ||
            prevAddress?.zip;

        // Check if current address is empty
        const currentIsEmpty =
            !currentAddress?.addressLine1 &&
            !currentAddress?.city &&
            !currentAddress?.state &&
            !currentAddress?.zip;

        // If we're transitioning from filled to empty, increment counter
        if (prevHadData && currentIsEmpty) {
            resetCounterRef.current += 1;
        }

        prevAddressRef.current = currentAddress;
    }, [address]);

    // Use resetCounter in key to force remount only when reset happens
    const addressKey = `${fieldName}-${resetCounterRef.current}`;

    return (
        <div key={fieldName} className={classNames || 'col-span-4'}>
            <AddressEntry
                key={addressKey}
                isFormStateReadOnly={isFormStateReadOnly}
                onDataChange={setAddress}
                initialAddress={address}
                isPayeeAddress={true}
                isAddressLine2Required={isAddressLine2Required}
            />
        </div>
    );
};

export default BankAddress;
