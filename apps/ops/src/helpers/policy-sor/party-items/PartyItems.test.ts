import { mockPolicy } from '@deps/services/mocks/sor-policy-iul';

import { Addresses } from './Addresses';
import { Banks } from './Banks';
import { Emails } from './Emails';
import { Phones } from './Phones';

const firstParty = mockPolicy?.parties?.[0];
let addresses: Addresses;
let banks: Banks;
let emails: Emails;
let phones: Phones;
describe('PartyItems', () => {
    describe('Addresses', () => {
        beforeAll(() => {
            addresses = new Addresses(firstParty?.addresses);
        });
        it('should return the preferred address', () => {
            expect(addresses.preferred).toBe(firstParty?.addresses?.[0]);
        });
        it('should return the best available address', () => {
            expect(addresses.bestAvailable).toBe(firstParty?.addresses?.[0]);
        });
        it('should have current and historical addresses', () => {
            expect(addresses.currentList).toHaveLength(1);
            expect(addresses.historicalList).toHaveLength(1);
        });
        it('should not blow up if passed undefined', () => {
            const noAddresses = new Addresses(undefined);
            expect(noAddresses.preferred).toBeUndefined();
            expect(noAddresses.bestAvailable).toBeUndefined();
            expect(noAddresses.currentList).toHaveLength(0);
            expect(noAddresses.historicalList).toHaveLength(0);
            expect(noAddresses.getById('12351236')).toBeUndefined();
        });
    });

    describe('Banks', () => {
        beforeAll(() => {
            banks = new Banks(firstParty?.bankDetails);
        });
        it('should return the preferred address', () => {
            expect(banks.preferred).toBe(firstParty?.bankDetails?.[0]);
        });
        it('should return the best available address', () => {
            expect(banks.bestAvailable).toBe(firstParty?.bankDetails?.[0]);
        });
        it('should have current and historical Banks', () => {
            expect(banks.currentList).toHaveLength(1);
            expect(banks.historicalList).toHaveLength(1);
        });
        it('should not blow up if passed undefined', () => {
            const noBanks = new Banks(undefined);
            expect(noBanks.preferred).toBeUndefined();
            expect(noBanks.bestAvailable).toBeUndefined();
            expect(noBanks.currentList).toHaveLength(0);
            expect(noBanks.historicalList).toHaveLength(0);
            expect(noBanks.getById('12351236')).toBeUndefined();
        });
    });

    describe('Emails', () => {
        beforeAll(() => {
            emails = new Emails(firstParty?.emails);
        });
        it('should return the preferred address', () => {
            expect(emails.preferred).toBe(firstParty?.emails?.[0]);
        });
        it('should return the best available address', () => {
            expect(emails.bestAvailable).toBe(firstParty?.emails?.[0]);
        });
        it('should have current and historical Emails', () => {
            expect(emails.currentList).toHaveLength(1);
            expect(emails.historicalList).toHaveLength(1);
        });
        it('should not blow up if passed undefined', () => {
            const noEmails = new Emails(undefined);
            expect(noEmails.preferred).toBeUndefined();
            expect(noEmails.bestAvailable).toBeUndefined();
            expect(noEmails.currentList).toHaveLength(0);
            expect(noEmails.historicalList).toHaveLength(0);
            expect(noEmails.getById('12351236')).toBeUndefined();
        });
    });

    describe('Phones', () => {
        beforeAll(() => {
            phones = new Phones(firstParty?.phones);
        });
        it('should return the preferred address', () => {
            expect(phones.preferred).toBe(firstParty?.phones?.[0]);
        });
        it('should return the best available address', () => {
            expect(phones.bestAvailable).toBe(firstParty?.phones?.[0]);
        });
        it('should have current and historical Phones', () => {
            expect(phones.currentList).toHaveLength(1);
            expect(phones.historicalList).toHaveLength(1);
        });
        it('should not blow up if passed undefined', () => {
            const noPhones = new Phones(undefined);
            expect(noPhones.preferred).toBeUndefined();
            expect(noPhones.bestAvailable).toBeUndefined();
            expect(noPhones.currentList).toHaveLength(0);
            expect(noPhones.historicalList).toHaveLength(0);
            expect(noPhones.getById('12351236')).toBeUndefined();
        });
    });
});
