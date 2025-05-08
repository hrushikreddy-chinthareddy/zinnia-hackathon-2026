import { isAccountNumberValid, isRoutingNumberValid } from './bank-validation.helpers';

describe('Bank Validation Helper', () => {
    describe('isAccountNumberValid', () => {
        it('should return true when the account number is at least 8 digits', () => {
            expect(isAccountNumberValid('12345678')).toBe(true);
        });

        it('should return true when the account number is up to 17 digits', () => {
            expect(isAccountNumberValid('12345678901234567')).toBe(true);
        });

        it('should return false when the account number is under 8 digits', () => {
            expect(isAccountNumberValid('1234567')).toBe(false);
        });

        it('should return false when the account number is over 17 digits', () => {
            expect(isAccountNumberValid('123456789012345678')).toBe(false);
        });
    });

    describe('isRoutingNumberValid', () => {
        it('should return true when the routing number is 9 digits', () => {
            expect(isRoutingNumberValid('123456789')).toBe(true);
        });

        it('should return false when the routing number is under 9 digits', () => {
            expect(isRoutingNumberValid('12345678')).toBe(false);
        });

        it('should return false when the routing number is over 9 digits', () => {
            expect(isRoutingNumberValid('1234567890')).toBe(false);
        });
    });
});
