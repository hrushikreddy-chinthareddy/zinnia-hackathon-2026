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
        isAnnuitant && annuitantAddress
            ? annuitantAddress
            : disbursementInformation?.address;

    const setAddress = (val: Address) => {
        onDataChange((ogData) => ({
            ...ogData,
            address: val,
        }));
    };

    // Generate a unique key based on the current disbursement option to reset address fields when switching options.
    // Only generate a dynamic key when disbursement option flags are being used (at least one is explicitly set to true/false).
    // This ensures backward compatibility with implementations that don't use these flags.
    const disbursementFlags = [
        disbursementInformation?.isAnnuitant,
        disbursementInformation?.isPayeeFinancialIns,
        disbursementInformation?.isPayeeCharity,
        disbursementInformation?.isThirdPartyDisbursement,
        disbursementInformation?.isAddressDifferent,
    ];
    const hasDisbursementFlags = disbursementFlags.some(
        (flag) => flag !== undefined
    );
    const addressEntryKey = hasDisbursementFlags
        ? disbursementFlags.join('-')
        : 'default';

    return (
        <div key={fieldName} className={classNames || 'col-span-4'}>
            <AddressEntry
                key={addressEntryKey}
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
