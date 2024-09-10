import { shouldNavbarOverlay } from './page-layout';

describe('shouldNavbarOverlay', () => {
    it('should return true if isLargeScreen is false and isOpenOverride is true', () => {
        const isLargeScreen = false;
        const isOpenOverride = true;
        expect(shouldNavbarOverlay(isLargeScreen, isOpenOverride)).toBe(true);
    });

    it('should return true if isLargeScreen is true and isOpenOverride is false', () => {
        const isLargeScreen = true;
        const isOpenOverride = false;
        expect(shouldNavbarOverlay(isLargeScreen, isOpenOverride)).toBe(true);
    });

    it('should return true if isLargeScreen is false and isOpenOverride is false', () => {
        const isLargeScreen = false;
        const isOpenOverride = false;
        expect(shouldNavbarOverlay(isLargeScreen, isOpenOverride)).toBe(true);
    });

    it('should return true if isLargeScreen is false and isOpenOverride is null', () => {
        const isLargeScreen = false;
        const isOpenOverride = null;
        expect(shouldNavbarOverlay(isLargeScreen, isOpenOverride)).toBe(true);
    });

    it('should return false for all other conditions', () => {
        const isLargeScreen = true;
        let isOpenOverride: boolean | null = true;
        expect(shouldNavbarOverlay(isLargeScreen, isOpenOverride)).toBe(false);

        isOpenOverride = null;
        expect(shouldNavbarOverlay(isLargeScreen, isOpenOverride)).toBe(false);
    });
});
