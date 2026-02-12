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

    // Create a unique key based on address values to force remount when address resets
    const addressKey = `${address?.addressLine1 || ''}-${address?.city || ''}-${
        address?.state || ''
    }-${address?.zip || ''}`;

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
