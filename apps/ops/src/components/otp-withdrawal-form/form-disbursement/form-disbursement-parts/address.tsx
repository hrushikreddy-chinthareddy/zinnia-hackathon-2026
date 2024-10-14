import React from 'react';

import { Address } from '@deps/models/case/withdrawal/case';
import { DisbursementInformation } from '@deps/models/case/withdrawal/disbursement-types';

import AddressEntry from '../../address-entry';

const BankAddress = ({ fieldName, classNames, isFormStateReadOnly, disbursementInformation, onDataChange }: DisbursementInformation) => {
    const address = disbursementInformation?.address;
    const setAddress = (val: Address) => {
        onDataChange(ogData => ({
            ...ogData,
            address: val,
        }));
    };

    return (
        <div key={fieldName} className={classNames || 'col-span-4'}>
            <AddressEntry
                isFormStateReadOnly={isFormStateReadOnly}
                onDataChange={setAddress}
                initialAddress={address}
                isPayeeAddress={true}
            />
        </div>
    );
};

export default BankAddress;
