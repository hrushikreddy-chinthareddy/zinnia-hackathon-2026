import { useTranslation } from 'next-i18next';
import { useEffect, useState, useContext } from 'react';

import CheckboxText from '@deps/components/checkbox/checkbox-text/checkbox-text';
import {
    FieldSize,
    FieldType,
    FieldVariant,
} from '@deps/components/fields/field';
import FieldDateSelect from '@deps/components/fields/field-date-select/field-date-select';
import CardContainer from '@deps/containers/card-container/card-container';
import { FormDataContext } from '@deps/contexts/OtpWithdrawalFormContext';
import {
    getFormattedDate,
    getFormattedZaharaDate,
} from '@deps/helpers/date.helpers';
import { PartyRoles } from '@deps/models/case/withdrawal/case';

import AddressEntry, { DEFAULT_ADDRESS } from './address-entry';

export interface TaxAcknowledgementProps {
    isFormStateReadOnly?: boolean;
    shouldShowDOBInOl4573?: boolean;
}
const TaxOL4753Attachment = ({
    isFormStateReadOnly,
    shouldShowDOBInOl4573,
}: TaxAcknowledgementProps) => {
    const { formOL4753Data, setFormOL4753Data, formParty } =
        useContext(FormDataContext);

    const contractOwnerDetails = formParty?.parties?.find(
        (item) => item.partyRoleType === PartyRoles.OWNER
    );
    const combinedAddress = `${
        contractOwnerDetails?.addresses[0].addressLine1
            ? contractOwnerDetails?.addresses[0].addressLine1
            : ''
    } ${
        contractOwnerDetails?.addresses[0].addressLine2
            ? contractOwnerDetails?.addresses[0].addressLine2
            : ''
    } ${
        contractOwnerDetails?.addresses[0].addressLine3
            ? contractOwnerDetails?.addresses[0].addressLine3
            : ''
    }`;

    const { t } = useTranslation(undefined, {
        keyPrefix: 'caseWithdrawal.request.OL4753Data',
    });
    const [isOL4753Attached, setOL4753Attached] = useState(
        formOL4753Data?.isAttached?.text || false
    );
    const [address, setAddress] = useState(
        formOL4753Data?.address ||
            contractOwnerDetails?.addresses[0] ||
            DEFAULT_ADDRESS
    );
    const dob =
        getFormattedDate(
            formOL4753Data?.dob?.text,
            'TaxOL4753::formOL4753Data DOB'
        ) ||
        getFormattedDate(
            contractOwnerDetails?.dob?.text,
            'TaxOL4753::contractOwner DOB'
        );
    const [dateOfBirth, setDateOfBirth] = useState(dob);

    useEffect(() => {
        const formOl4753 = {
            isAttached: {
                text: isOL4753Attached,
            },
            address: address,
            ...(shouldShowDOBInOl4573 && {
                dob: dateOfBirth
                    ? {
                          text: getFormattedZaharaDate(
                              dateOfBirth,
                              'TaxOL4753::output DOB'
                          ),
                      }
                    : { text: null },
            }),
        };
        setFormOL4753Data(isOL4753Attached ? formOl4753 : null);
    }, [
        address,
        dateOfBirth,
        isOL4753Attached,
        shouldShowDOBInOl4573,
        setFormOL4753Data,
    ]);

    return (
        <CardContainer
            containerClassNames="border-b-2 border-gray-100"
            classNames="w-full"
        >
            <div className=" flex flex-wrap gap-8 max-md:flex-col">
                <CheckboxText
                    label={t('isOL4753Attached')}
                    checked={isOL4753Attached}
                    onChange={() => setOL4753Attached(!isOL4753Attached)}
                    isDisabled={isFormStateReadOnly}
                />
            </div>

            {isOL4753Attached && (
                <div className="my-4">
                    <AddressEntry
                        onDataChange={setAddress}
                        initialAddress={address}
                        isFormStateReadOnly={isFormStateReadOnly}
                        isOL4753={true}
                        combinedAddress={combinedAddress}
                    />
                    {shouldShowDOBInOl4573 && (
                        <div className="max-w-lg">
                            <FieldDateSelect
                                label={t('dob') as string}
                                id="dateOfBirth"
                                data-testid="dateOfBirth"
                                isFutureDateDisabled={false}
                                onChange={(e) => {
                                    setDateOfBirth(e.target.value);
                                }}
                                size={FieldSize.Small}
                                type={FieldType.BaseActive}
                                value={dateOfBirth}
                                disabled={isFormStateReadOnly}
                                variant={
                                    isFormStateReadOnly
                                        ? FieldVariant.Inactive
                                        : FieldVariant.Default
                                }
                            />
                        </div>
                    )}
                </div>
            )}
        </CardContainer>
    );
};

export default TaxOL4753Attachment;
