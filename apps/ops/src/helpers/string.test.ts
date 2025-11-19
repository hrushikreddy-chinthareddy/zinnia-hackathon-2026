import { Phone } from '@zinnia/api-types/types/sor';

import { DEFAULT_ERROR_STRING } from '@deps/types/constants';

import {
    calculateAge,
    cleanCurrency,
    convertKebabedDateString,
    firstNameAndLastInitial,
    formatAccountNumber,
    formatCardExpirationDate,
    formatDate,
    formatDateDescriptionList,
    formatDialNumber,
    formatPhone,
    formatSSN,
    isNullEmptyOrUndefined,
    nameToTwoLetters,
    safeString,
    toSentenceCase,
    toTitleCase,
    trimStringByCharacterCount,
    hasDigitsRegex,
    capitalizeAfterPeriod,
} from './string.helpers';

describe('String Helper', () => {
    describe('> isNullEmptyOrUndefined', () => {
        it('should be true', () => {
            const value = '';
            const isValueUndefined = isNullEmptyOrUndefined(value);

            expect(isValueUndefined).toBe(true);
        });

        it('should be false', () => {
            const value = 'test';
            const isValueUndefined = isNullEmptyOrUndefined(value);

            expect(isValueUndefined).toBe(false);
        });
    });

    describe('cleanCurrency', () => {
        it('should remove commas and dollar signs from a currency string', () => {
            // Remove commas
            expect(cleanCurrency('1,000.50')).toBe('1000.50');

            // Remove dollar sign
            expect(cleanCurrency('$500.75')).toBe('500.75');

            // Remove both commas and dollar sign
            expect(cleanCurrency('$1,234,567.89')).toBe('1234567.89');

            // Empty input should return an empty string
            expect(cleanCurrency('')).toBe('');
        });
    });

    describe('> nameToTwoLetters', () => {
        it('should be two letters', () => {
            const name = 'Frank Frankington';
            const nameLength = nameToTwoLetters(name);

            expect(nameLength).toBe('FF');
        });

        it('should return name', () => {
            const name = '';
            const value = nameToTwoLetters(name);

            expect(value).toBe(name);
        });

        it('should be one letter', () => {
            const name = 'Frank';
            const nameLength = nameToTwoLetters(name);

            expect(nameLength).toBe('F');
        });

        it('should handle multiple spaces in between first and last name', () => {
            const name = 'Frank  Frankington';
            const nameLength = nameToTwoLetters(name);

            expect(nameLength).toBe('FF');
        });
    });

    describe('> firstNameAndLastInitial', () => {
        it('should be first name and last letter', () => {
            const name = 'Frank Frankington';
            const value = firstNameAndLastInitial(name);

            expect(value).toBe('Frank F.');
        });

        it('should return name', () => {
            const name = '';
            const value = firstNameAndLastInitial(name);

            expect(value).toBe(name);
        });

        it('should be one letter', () => {
            const name = 'Frank';
            const nameLength = firstNameAndLastInitial(name);

            expect(nameLength).toBe('F');
        });

        it('should handle multiple spaces in between first and last name', () => {
            const name = 'Frank  Smith';
            const value = firstNameAndLastInitial(name);

            expect(value).toBe('Frank S.');
        });
    });

    describe('> toTitleCase', () => {
        it('should be in title case', () => {
            const name = 'frank frankington';
            const value = toTitleCase(name);

            expect(value).toBe('Frank Frankington');
        });

        it('should return name', () => {
            const name = '';
            const value = toTitleCase(name);

            expect(value).toBe(name);
        });
    });

    describe('> formatDialNumber', () => {
        it('should be in dial format', () => {
            const phone = '1234567890';
            const value = formatDialNumber(phone);

            expect(value).toBe('123-4567890');
        });

        it('should return phone', () => {
            const phone = '123';
            const value = formatDialNumber(phone);

            expect(value).toBe(phone);
        });
    });

    describe('> formatPhone', () => {
        const phone = {
            countryCode: '123',
            areaCode: '345',
            dialNumber: '4567',
        } as Phone;

        it('should be in phone format', () => {
            const value = formatPhone(phone);

            expect(value).toBe('+123 (345) 4567');
        });

        it('should return phone', () => {
            const phone = '';
            const value = formatPhone({} as Phone);

            expect(value).toBe(phone);
        });
    });

    describe('> formatDate', () => {
        const date = '12/12/2024';

        it('should be in phone format', () => {
            const value = formatDate(date);

            expect(value).toBe('December 12, 2024');
        });
    });

    describe('> convertKebabedDateString', () => {
        it('should return converted date string', () => {
            const convertedDate = convertKebabedDateString('2345-01-02');

            expect(convertedDate).toBe('1/2/2345');
        });

        it('should return the date string if the value is not in the correct format', () => {
            const badDateString = '2345--01';
            const convertedDate = convertKebabedDateString(badDateString);
            expect(convertedDate).toBe(badDateString);
        });

        it('should return an error string if an empty value is provided', () => {
            expect(convertKebabedDateString('')).toBe(DEFAULT_ERROR_STRING);
        });
    });

    describe('> formatDateDescriptionList', () => {
        it('should return formatted date', () => {
            const date = new Date('2023-05-01T00:00:00');
            const formattedDate = formatDateDescriptionList(date);

            expect(formattedDate).toBe('5/1/2023');
        });

        it('should return -- for invalid date', () => {
            const date = new Date('Invalid Date');
            const formattedDate = formatDateDescriptionList(date);

            expect(formattedDate).toBe('--');
        });

        describe('> formatSSN', () => {
            it('should return formatted SSN with dashes', () => {
                const ssn = '123456789';
                const formattedSSN = formatSSN(ssn);

                expect(formattedSSN).toBe('***-**-6789');
            });

            it('should return formatted SSN even if input is too long', () => {
                const ssn = '1234567890';
                const formattedSSN = formatSSN(ssn);

                expect(formattedSSN).toBe('***-**-7890');
            });

            it('should return -- string for empty SSN', () => {
                const ssn = '';
                const formattedSSN = formatSSN(ssn);

                expect(formattedSSN).toBe('--');
            });
        });
    });

    describe('> toSentenceCase', () => {
        it('should convert text to sentence case', () => {
            const text = 'NOT APPROVED TO SELL REQUIRED PRODUCTS';
            const sentenceCasedText = toSentenceCase(text);

            expect(sentenceCasedText).toBe(
                'Not approved to sell required products'
            );
        });

        it('should handle empty strings', () => {
            const text = '';
            const sentenceCasedText = toSentenceCase(text);

            expect(sentenceCasedText).toBe('');
        });

        it('should handle strings with only one character', () => {
            const text = 'a';
            const sentenceCasedText = toSentenceCase(text);

            expect(sentenceCasedText).toBe('A');
        });
    });

    describe('trimStringByCharacterCount', () => {
        it('should return an empty string if input is undefined or empty', () => {
            expect(trimStringByCharacterCount(undefined)).toEqual('');
            expect(trimStringByCharacterCount('')).toEqual('');
        });

        it('should return the input string if its length is less than or equal to the max character count', () => {
            const input = 'This is a short string.';
            expect(trimStringByCharacterCount(input)).toEqual(input);
        });

        it('should trim the input string and add the suffix if its length exceeds the max character count', () => {
            const input =
                'This is a very very very very very very very very very very very very long string that exceeds the maximum length of 150 extremely precise and non-negotiable characters.';
            const expectedOutput =
                'This is a very very very very very very very very very very very very long string that exceeds the maximum length of 150 extremely precise and non-neg...';
            expect(trimStringByCharacterCount(input)).toEqual(expectedOutput);
        });

        it('should trim the input string and add a custom suffix if provided', () => {
            const input =
                'This is a very very very very very very very very very very very very very very very very long string that exceeds the maximum length of 150 characters.';
            const suffix = ' [trimmed]';
            const expectedOutput =
                'This is a very very very very very very very very very very very very very very very very long string that exceeds the maximum length of 150 character [trimmed]';
            expect(trimStringByCharacterCount(input, 150, suffix)).toEqual(
                expectedOutput
            );
        });
    });

    describe('> calculatedAge', () => {
        beforeAll(() => {
            jest.useFakeTimers();
            jest.setSystemTime(new Date(2023, 5, 20));
        });

        it('should return age in years', () => {
            const birthday = `1998-04-01`;
            const yearString = 'years old';
            const expectedAge = 2023 - 1998;
            const calculatedAge = calculateAge(birthday, yearString);

            expect(calculatedAge).toBe(`${expectedAge} ${yearString}`);
        });
    });

    describe('> formatAccountNumber', () => {
        it('should mask all but last 4 digits of account number', () => {
            const accountNumber = '123456789';

            const formattedAccountNumber = formatAccountNumber(accountNumber);

            expect(formattedAccountNumber).toBe('*****6789');
        });

        it('should return only the last 4 digits if trim only is marked as true', () => {
            const accountNumber = '123456789';

            const formattedAccountNumber = formatAccountNumber(
                accountNumber,
                true
            );

            expect(formattedAccountNumber).toBe('6789');
        });
    });

    describe('> formatCardExpirationDate', () => {
        it('should return month and year (MM/YY)', () => {
            const expirationDate = '2032-05-28';

            const cardExpirationDate = formatCardExpirationDate(expirationDate);

            expect(cardExpirationDate).toBe('05/32');
        });
    });

    describe('> safeString', () => {
        it('should return the default error string for null values', () => {
            const result = safeString(null);
            expect(result).toBe(DEFAULT_ERROR_STRING);
        });

        it('should return the default error string for undefined values', () => {
            const result = safeString(undefined);
            expect(result).toBe(DEFAULT_ERROR_STRING);
        });

        it('should return the default error string for empty strings', () => {
            const result = safeString('');
            expect(result).toBe(DEFAULT_ERROR_STRING);
        });

        it('should return the original string for non-empty strings', () => {
            const result = safeString('Hello, World!');
            expect(result).toBe('Hello, World!');
        });
    });

    describe('> hasDigitsRegex', () => {
        it('should return false date is not in format YYYY', () => {
            const str = 'This string has no digits';
            const result = hasDigitsRegex.test(str);
            expect(result).toBe(false);
        });

        it('should return true if string is date', () => {
            const str = '1999-09-09';
            const result = hasDigitsRegex.test(str);
            expect(result).toBe(true);
        });

        it('should return true for dates with "/" as a separator', () => {
            const str = '1999/09/09';
            const result = hasDigitsRegex.test(str);
            expect(result).toBe(true);
        });
    });

    describe('> capitalizeAfterPeriod', () => {
        it('should capitalize letters after periods', () => {
            const text = 'hello. this is a test. another sentence.';
            const result = capitalizeAfterPeriod(text);

            expect(result).toBe('Hello. This is a test. Another sentence.');
        });

        it('should handle empty string', () => {
            const text = '';
            const result = capitalizeAfterPeriod(text);

            expect(result).toBe('');
        });

        it('should capitalize first letter of string', () => {
            const text = 'this is a test.';
            const result = capitalizeAfterPeriod(text);

            expect(result).toBe('This is a test.');
        });

        it('should handle strings with spaces before periods', () => {
            const text = 'hello . test . example';
            const result = capitalizeAfterPeriod(text);

            expect(result).toBe('Hello . Test . Example');
        });

        it('should convert entire string to lowercase first', () => {
            const text = 'HELLO. THIS IS A TEST.';
            const result = capitalizeAfterPeriod(text);

            expect(result).toBe('Hello. This is a test.');
        });
    });
});
