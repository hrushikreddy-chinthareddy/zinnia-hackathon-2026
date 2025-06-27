import { Party, Policy } from '@zinnia/api-types/types/sor';

import { Case } from '@deps/models/case/case';
import { LifeCadParty } from '@deps/models/case/lifecad-party';

import {
    caseSanitizer,
    caseSearchSanitizer,
    lcPartyResponseSanitizer,
    policyResponseSanitizer,
    policySanitizer,
} from './sanitizers';

jest.mock('@deps/utils/server-logging');

const mockCaseParties = [
    { ssn: '123-45-6789', fullName: 'John Doe' },
    { ssn: '987-65-4321', fullName: 'Jane Smith' },
    { fullName: 'James Bond NoSsn' },
];
const mockCaseInput = {
    parties: mockCaseParties,
    otherStuff: ['there', 'is', 'stuff', 'in', 'here'],
} as unknown as Case;

const expectedCaseOutput = {
    parties: [
        { ssn: '***-**-6789', fullName: 'John Doe' },
        { ssn: '***-**-4321', fullName: 'Jane Smith' },
        { fullName: 'James Bond NoSsn' },
    ],
    otherStuff: ['there', 'is', 'stuff', 'in', 'here'],
};

const mockPolicyParties = [
    {
        fullName: 'John Smith',
        bankDetails: [
            {
                internationalBankAccountNumber: '987654321',
                accountNumber: '0123456789',
                routingNumber: 'do not modify',
            },
            {
                internationalBankAccountNumber: null,
                accountNumber: '2468101214',
                otherValue: 'do not touch this',
            },
        ],
        identifications: [
            { identificationType: 'SSN', identificationValue: '123-45-6789' },
            {
                identificationType: 'DriverLicense',
                identificationValue: '867-5309',
            },
        ],
        otherStuff: ['there', 'is', 'stuff', 'in', 'here'],
    },
    {
        fullName: 'Jane Doe',
        bankDetails: [],
        identifications: [],
        otherStuff: ['there', 'is', 'stuff', 'in', 'here'],
    },
] as unknown as Party[];

const mockPolicy = {
    parties: mockPolicyParties,
    otherStuff: ['there', 'is', 'stuff', 'in', 'here'],
} as unknown as Policy;

const expectedPolicyOutput = {
    parties: [
        {
            fullName: 'John Smith',
            bankDetails: [
                {
                    internationalBankAccountNumber: '*****4321',
                    accountNumber: '******6789',
                    routingNumber: 'do not modify',
                },
                {
                    internationalBankAccountNumber: null,
                    accountNumber: '******1214',
                    otherValue: 'do not touch this',
                },
            ],
            identifications: [
                {
                    identificationType: 'SSN',
                    identificationValue: '***-**-6789',
                },
                {
                    identificationType: 'DriverLicense',
                    identificationValue: '867-5309',
                },
            ],
            otherStuff: ['there', 'is', 'stuff', 'in', 'here'],
        },
        {
            fullName: 'Jane Doe',
            bankDetails: [],
            identifications: [],
            otherStuff: ['there', 'is', 'stuff', 'in', 'here'],
        },
    ],
    otherStuff: ['there', 'is', 'stuff', 'in', 'here'],
};

const mockLcParty = [
    {
        FirstName: 'FakeFirst',
        LastName: 'FakeLast',
        TaxID: 128675309,
    },
    {
        FirstName: 'FakeFirst2',
        LastName: 'FakeLast2',
        TaxID: 867530999,
    },
] as unknown as LifeCadParty[];

const expectedLcOutput = [
    {
        FirstName: 'FakeFirst',
        LastName: 'FakeLast',
        TaxID: '***-**-5309',
    },
    {
        FirstName: 'FakeFirst2',
        LastName: 'FakeLast2',
        TaxID: '***-**-0999',
    },
] as unknown as LifeCadParty[];

describe('sanitizers', () => {
    describe('caseSanitizer', () => {
        it('should mask SSNs in the parties array', () => {
            expect(caseSanitizer(mockCaseInput)).toEqual(expectedCaseOutput);
        });
    });

    describe('caseSearchSanitizer', () => {
        it('should mask SSNs for cases in the data array', () => {
            const otherStuff = {
                limit: 10,
                count: 10,
                offset: 0,
                status: 200,
                message: 'OK',
                total: 1,
            };
            expect(
                caseSearchSanitizer({ data: [mockCaseInput], ...otherStuff })
            ).toEqual({ data: [expectedCaseOutput], ...otherStuff });
        });
    });

    describe('policySanitizer', () => {
        it('should mask SSNs and bankDetails in the parties array', () => {
            expect(policySanitizer(mockPolicy)).toEqual(expectedPolicyOutput);
        });
    });
    describe('policyResponseSanitizer', () => {
        it('should call policySanitizer on the `data` property of a policy response', () => {
            const otherStuff = { message: 'This is the message', status: 200 };
            expect(
                policyResponseSanitizer({ data: mockPolicy, ...otherStuff })
            ).toEqual({ ...otherStuff, data: expectedPolicyOutput });
        });
    });

    describe('lcPartyResponseSanitizer', () => {
        it('should sanitize the TaxIDs in the LC Party response', () => {
            expect(lcPartyResponseSanitizer(mockLcParty)).toEqual(
                expectedLcOutput
            );
        });
    });
});
