import { datadogRum } from '@datadog/browser-rum';
import { Phone, Party } from '@zinnia/api-types/types/sor';
import dayjs from 'dayjs';
import { TFunction } from 'next-i18next';

import { DEFAULT_DATE_FORMAT, DEFAULT_ERROR_STRING, ZAHARA_API_DATE_FORMAT } from '@deps/types/constants';

import { calculateAgeNumber } from './age.helpers';

export const isNullEmptyOrUndefined = (value?: any) => {
    return value === null || value === undefined || value === '';
};

export const cleanCurrency = (value: string) => {
    if (!value) return value;

    return value.replaceAll(',', '').replaceAll('$', '');
};

export const nameToTwoLetters = (name?: string | null) => {
    if (!name) return name;

    const names = name.split(' ').filter(n => n.trim() !== '');

    if (names.length < 2) return names[0][0];

    return `${names[0][0]}${names[1][0]}`;
};

export const firstNameAndLastInitial = (name?: string | null) => {
    if (!name) return name;

    const names = name.split(' ').filter(n => n.trim() !== '');

    if (names.length < 2) return names[0][0];

    return `${names[0]} ${names[1][0]}.`;
};

export const buildFullName = (firstName?: string, middleName?: string, lastName?: string, suffix?: string) => {
    const first = firstName || '';
    const middle = middleName ? `${middleName.charAt(0)}.` : '';
    const last = lastName || '';
    const suffixString = suffix || '';
    const space = first && middleName ? ' ' : '';

    return `${first}${space}${middle} ${last} ${suffixString}`;
};

export const buildFullNameFromParty = (party?: Party | Party | null) => {
    if (!party) return DEFAULT_ERROR_STRING;

    if (party.fullName) return party.fullName;

    let nameString = '';
    if (party.firstName) {
        nameString += toTitleCase(party.firstName);
    }
    if (party.middleName) {
        nameString += ` ${toTitleCase(party.middleName.charAt(0))}.`;
    }
    if (party.lastName) {
        nameString += ` ${toTitleCase(party.lastName)}`;
    }
    if (party.suffix) {
        nameString += ` ${toTitleCase(party.suffix)}`;
    }

    return nameString;
};

export const toTitleCase = (value?: string): string => {
    if (!value) return '';

    return value.replace(/\w\S*/g, function (txt) {
        return txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase();
    });
};

export const formatDialNumber = (value: string | undefined) => {
    if (!value || value.length <= 4) return value;

    let newValue = value;

    const cleanedValue = value.replace(/\D[^.]/g, '');
    newValue = cleanedValue.slice(0, 3) + '-' + cleanedValue.slice(3);

    return newValue;
};

export const formatPhone = (phone: Phone) => {
    if (!phone) return ''; // TODO: should this return a default error string or null instead of empty string?

    let phoneNumber = '';
    if (!isNullEmptyOrUndefined(phone.countryCode)) {
        phoneNumber += `+${phone.countryCode} `;
    }

    if (!isNullEmptyOrUndefined(phone.areaCode)) {
        phoneNumber += `(${phone.areaCode}) `;
    }

    if (!isNullEmptyOrUndefined(phone.dialNumber)) {
        phoneNumber += `${formatDialNumber(phone?.dialNumber?.toString())}`;
    }

    return phoneNumber;
};

export const formatPhoneWithAreacode = (phone: Phone) => {
    if (!phone) return '';

    let phoneNumber = '';

    if (!isNullEmptyOrUndefined(phone.areaCode)) {
        phoneNumber += `(${phone.areaCode}) `;
    }

    if (!isNullEmptyOrUndefined(phone.dialNumber)) {
        phoneNumber += `${formatFaxNumber(phone?.dialNumber?.toString())}`;
    }

    return phoneNumber;
};

export const formatFaxNumber = (faxNumber: string | undefined) => {
    if (!faxNumber || typeof faxNumber !== 'string') {
      return DEFAULT_ERROR_STRING;
    }
    const digits = faxNumber.replace(/\D/g, '');
    if (digits.length !== 10) {
      return DEFAULT_ERROR_STRING;
    }
    return `(${digits.substring(0, 3)}) ${digits.substring(3, 6)}-${digits.substring(6, 10)}`;
  };

export const formatDate = (date: string | undefined) => {
    if (date === '' || date == null) return DEFAULT_ERROR_STRING;

    const dt = new Date(date + ' ');

    if (isNaN(Number(dt))) return DEFAULT_ERROR_STRING;
    const month = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
    ];
    return month[dt.getMonth()] + ' ' + dt.getDate() + ', ' + dt.getFullYear();
};

export const parseAndFormatDate = (inputFormat: string, outputFormat: string, date?: string) => {
    if (dayjs(date, inputFormat).isValid()) return dayjs(date, inputFormat).format(outputFormat);
    return date;
};

export const formatDateTime = (dateTime?: string) => {
    if (dateTime) return new Date(dateTime).toISOString();
    return null;
};

export const hasDigitsRegex = new RegExp(/\d+/);

// Converts yyyy-mm-dd strings into m/d/yyyy
export const convertKebabedDateString = (date: string | undefined): string => {
    if (date === '' || typeof date !== 'string') return DEFAULT_ERROR_STRING;

    const [year, month, day] = date.split('-');
    if (!year || !month || !day) {
        return date;
    }
    const formattedDate = dayjs(date, ZAHARA_API_DATE_FORMAT).format(DEFAULT_DATE_FORMAT);
    if (!hasDigitsRegex.test(formattedDate)) {
        const error = new Error(`Invalid Date. Tried to parse ${date}`);
        datadogRum.addError(error);
        return DEFAULT_ERROR_STRING;
    }

    return formattedDate;
};

// Format date for createdAt and updatedAt
export const formatDateDescriptionList = (date: Date): string => {
    if (isNaN(date.getTime())) return DEFAULT_ERROR_STRING;

    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
    }).format(date);
};

export const formatDateForAriaLabel = (date: Date) => {
    const formatter = new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    return formatter.format(date);
};

export const getFormattedDateTime = (date: Date) => {
    const formatter = new Intl.DateTimeFormat('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
        timeZone: 'CST',
    });
    return formatter.format(date);
};

// Format SSN return ****-**-1234
export const formatSSN = (ssn?: string | null): string => {
    if (!ssn) return DEFAULT_ERROR_STRING;

    // Remove any non-numeric characters except asterisks
    const cleanedSSN = ssn.replace(/[^\d*]/g, '');

    // Get the last 4 digits
    const last4Digits = cleanedSSN.slice(-4);

    // Append the last 4 digits to the static string
    return `***-**-${last4Digits}`;
};

export const formatSSNFull = (value = ''): string => {
    if (isNullEmptyOrUndefined(value) || value.length <= 3) return value;

    const numbers = value.replace(/\D/g, ''); // Remove any non-numeric characters
    const groups = [];

    // add first three numbers
    groups.push(numbers.substring(0, 3));

    // add next two numbers
    if (numbers.length > 3) {
        groups.push(numbers.substring(3, 5));
    }

    // add last four numbers
    if (numbers.length > 5) {
        groups.push(numbers.substring(5));
    }

    // Join the numbers with hyphens
    const ssn = groups.join('-');

    return ssn;
};

// Function to convert text to sentence case
export const toSentenceCase = (text: string | undefined): string => {
    if (text === '' || text == null) return '';

    return text?.charAt(0)?.toUpperCase() + text?.slice(1)?.toLowerCase();
};

export const trimStringByCharacterCount = (input?: string, maxCharacterCount = 150, suffix = '...'): string => {
    if (!input) return '';

    if (input.length <= maxCharacterCount) {
        return input;
    } else {
        return input.substring(0, maxCharacterCount) + suffix;
    }
};

export const calculateAge = (birthday: string | undefined, yearString: string): string => {
    if (isNullEmptyOrUndefined(birthday) || !dayjs(birthday, ZAHARA_API_DATE_FORMAT).isValid()) return DEFAULT_ERROR_STRING;
    const age = calculateAgeNumber(birthday);
    if (age === undefined) {
        return DEFAULT_ERROR_STRING;
    }
    return age + ` ${yearString}`;
};

// Format bank account number
export const formatAccountNumber = (value = '', trimOnly = false): string => {
    if (isNullEmptyOrUndefined(value) || value.length <= 4) return value;

    if (trimOnly === true) {
        return value.substring(value.length - 4);
    }

    const cleanedAccount = value.replace(/\D/g, ''); // Remove any non-numeric characters

    // Mask the start of the string with asterisks, leaving the last 4 characters visible
    const maskedAccount =
        cleanedAccount.substring(0, cleanedAccount.length - 4).replace(/./g, '*') + cleanedAccount.substring(cleanedAccount.length - 4);

    return maskedAccount;
};

// Format bank card expiration date
export const formatCardExpirationDate = (expirationDate: string | undefined) => {
    if (expirationDate) {
        const date = new Date(expirationDate);
        const month = ('0' + (date.getMonth() + 1)).slice(-2);
        const year = date.getFullYear().toString().slice(-2);
        return `${month}/${year}`;
    }
    return null;
};

export const translateYearOrYears = (age: number | undefined, t?: TFunction): string => {
    if (isNullEmptyOrUndefined(age as number) || !t) {
        return DEFAULT_ERROR_STRING;
    }
    if (age === 1) {
        return t('temporal.oneYear');
    }

    return t('temporal.nYears', { n: age });
};

export const escapeRegExp = (text: string): string => {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
};

export const safeString = (value?: string | null): string => {
    return !isNullEmptyOrUndefined(value) ? (value as string) : DEFAULT_ERROR_STRING;
};

// otp withdrawals boolean to string
export const stringifyTrueFalseNull = (val?: string | boolean | null): string => {
    return val?.toString ? val.toString() : 'null';
};

export const deStringifyTrueFalseNull = (val: string | null): string | boolean | null => {
    if (val === 'true') {
        return true;
    }
    if (val === 'false') {
        return false;
    }
    if (val === 'null') {
        return null;
    }
    return val;
};

export const getSlug = (val: string): string => {
    return val.replace(/ /g, '_').toLowerCase();
};

export const reverseNameOrder = (name: string) => {
    return name.split(', ').reverse().join(' ');
};

export const formatRelationshipEnum = (value: string): string => {
    if (!value) return '';

    const relationshipMap: Record<string, string> = {
        TRUSTEE: 'Trustee',
        TRUSTEEOFMINOR: 'Trustee of Minor',
        TRUSTEEOFINCOMPETENT: 'Trustee of Incompetent Person',
        POWEROFATTORNEY: 'Power of Attorney',
        CONTROLLINGPERSONOFENTITY: 'Controlling Person of Entity',
        BROTHER: 'Brother',
        CHILD: 'Child',
        DAUGHTER: 'Daughter',
        DOMESTICPARTNER: 'Domestic Partner',
        EXECUTORS: 'Executor(s)',
        FATHER: 'Father',
        FIANCE: 'Fiancé/Fiancée',
        GRANDCHILD: 'Grandchild',
        LIFEPARTNER: 'Life Partner',
        MOTHER: 'Mother',
        SISTER: 'Sister',
        SON: 'Son',
        SPOUSE: 'Spouse',
        STEPFATHER: 'Stepfather',
        STEPMOTHER: 'Stepmother',
        SELF: 'Self',
        OTHER: 'Other',
    };

    return relationshipMap[value] || toTitleCase(value.replace(/_/g, ' '));
};

export const formatPercentage = (value: number | undefined) => {
    if (!value) return '';
    return `${value}%`;
};
