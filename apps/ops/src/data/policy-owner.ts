import { isEndDated } from '@deps/helpers/date.helpers';
import {
    convertKebabedDateString,
    toTitleCase,
    buildFullName,
} from '@deps/helpers/string.helpers';
import { DataDefinition } from '@deps/types/data';
import {
    Address,
    Email,
    EmailType,
    IdentificationType,
    Party,
    Phone,
} from '@zinnia/api-types/types/sor';

export interface PolicyOwnerDto {
    fullName: string;
    ssn?: string;
    birthDate: string;
    primaryPhone?: Phone;
    email?: Email;
    emailType?: EmailType;
    mailingAddress?: Address;
}

export const toPolicyOwnerDto = ({
    firstName,
    middleName,
    lastName,
    suffix,
    identifications,
    dateOfBirth,
    phones,
    addresses,
    emails,
}: Party): PolicyOwnerDto => {
    return {
        fullName: buildFullName(firstName, middleName, lastName, suffix),
        ssn: identifications?.find(
            (ids) => ids.identificationType === IdentificationType.SSN
        )?.identificationValue,
        birthDate: convertKebabedDateString(dateOfBirth),
        primaryPhone: phones?.find((phone) => !isEndDated(phone.endDate)),
        email: emails?.find(
            (email) =>
                email.emailType === 'PERSONAL' && !isEndDated(email.endDate)
        ),
        emailType: emails?.find(
            (email) => email.emailType && !isEndDated(email.endDate)
        )?.emailType,
        mailingAddress: addresses?.find(
            (address) => !isEndDated(address.endDate)
        ),
    };
};

export const PolicyOwnerInfoColDefs: DataDefinition<PolicyOwnerDto>[] = [
    {
        key: 'fullName',
        label: 'Full name',
        format: toTitleCase,
    },
    {
        key: 'birthDate',
        label: 'Birth date',
    },
    {
        key: 'email',
        label: 'Email',
    },
    {
        key: 'ssn',
        label: 'Social Security number',
        format: (value: string) => {
            if (!value) return value;

            const ssnArray = value.split('-');
            if (ssnArray.length !== 3) return value;
            return `***-**-${ssnArray[2]}`;
        },
        col: 2,
    },
    {
        key: 'primaryPhone',
        label: 'Primary phone',
        col: 2,
    },
    {
        key: 'mailingAddress',
        label: 'Mailing address',
        col: 2,
    },
];
