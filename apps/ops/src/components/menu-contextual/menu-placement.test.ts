import {
    calculateMenuPlacement,
    PlacementRect,
    ViewportInfo,
} from './menu-placement';

describe('calculateMenuPlacement', () => {
    const defaultRect: PlacementRect = {
        top: 100,
        bottom: 140,
        left: 200,
        right: 300,
    };

    describe('normal viewport conditions', () => {
        it('should place menu below and align end when trigger is in top-left quadrant', () => {
            const rect: PlacementRect = {
                top: 100,
                bottom: 140,
                left: 200,
                right: 300,
            };
            const viewport: ViewportInfo = {
                scrollY: 200,
                innerHeight: 800,
                innerWidth: 1200,
            };

            const result = calculateMenuPlacement(rect, viewport);

            expect(result).toEqual({
                side: 'bottom',
                align: 'start',
            });
        });

        it('should place menu below and align end when trigger is in top-right quadrant', () => {
            const rect: PlacementRect = {
                top: 100,
                bottom: 140,
                left: 800,
                right: 900,
            };
            const viewport: ViewportInfo = {
                scrollY: 200,
                innerHeight: 800,
                innerWidth: 1200,
            };

            const result = calculateMenuPlacement(rect, viewport);

            expect(result).toEqual({
                side: 'bottom',
                align: 'end',
            });
        });

        it('should place menu above when trigger is in bottom half of viewport', () => {
            const rect: PlacementRect = {
                top: 500,
                bottom: 540,
                left: 200,
                right: 300,
            };
            const viewport: ViewportInfo = {
                scrollY: 200,
                innerHeight: 800,
                innerWidth: 1200,
            };

            const result = calculateMenuPlacement(rect, viewport);

            expect(result).toEqual({
                side: 'top', // Center-based logic: trigger center (520) > viewport center (400)
                align: 'start',
            });
        });
    });

    describe('constrained viewport conditions', () => {
        it('should place menu on right side when near top with limited vertical space', () => {
            const rect: PlacementRect = {
                top: 50,
                bottom: 90,
                left: 100,
                right: 200,
            };
            const viewport: ViewportInfo = {
                scrollY: 10, // Near top (threshold is 150)
                innerHeight: 200, // Small viewport to trigger constrained condition
                innerWidth: 1200,
            };

            const result = calculateMenuPlacement(rect, viewport);

            expect(result).toEqual({
                side: 'right',
                align: 'start',
            });
        });

        it('should place menu on left side when more space available on left', () => {
            const rect: PlacementRect = {
                top: 50,
                bottom: 90,
                left: 800, // Far right, more space on left
                right: 900,
            };
            const viewport: ViewportInfo = {
                scrollY: 10,
                innerHeight: 200, // Very small viewport to trigger constrained condition
                innerWidth: 1200,
            };

            const result = calculateMenuPlacement(rect, viewport);

            expect(result).toEqual({
                side: 'left',
                align: 'start',
            });
        });

        it('should fallback to bottom when insufficient horizontal space on both sides', () => {
            const rect: PlacementRect = {
                top: 50,
                bottom: 90,
                left: 200,
                right: 500, // Only 200px on left, 200px on right (both < 320px)
            };
            const viewport: ViewportInfo = {
                scrollY: 10,
                innerHeight: 400,
                innerWidth: 700, // Small width
            };

            const result = calculateMenuPlacement(rect, viewport);

            expect(result).toEqual({
                side: 'bottom',
                align: 'start', // Trigger center (350) < viewport center (350)
            });
        });

        it('should fallback to bottom with end alignment when trigger is right of center', () => {
            const rect: PlacementRect = {
                top: 50,
                bottom: 90,
                left: 400,
                right: 500, // Center at 450, viewport center at 350
            };
            const viewport: ViewportInfo = {
                scrollY: 10,
                innerHeight: 400,
                innerWidth: 700,
            };

            const result = calculateMenuPlacement(rect, viewport);

            expect(result).toEqual({
                side: 'bottom',
                align: 'end',
            });
        });
    });

    describe('edge cases', () => {
        it('should handle zero scroll position', () => {
            const rect = defaultRect;
            const viewport: ViewportInfo = {
                scrollY: 0,
                innerHeight: 200, // Small viewport to trigger constrained condition
                innerWidth: 1200,
            };

            const result = calculateMenuPlacement(rect, viewport);

            expect(result).toEqual({
                side: 'right',
                align: 'start',
            });
        });

        it('should handle exact threshold scroll position', () => {
            const rect = defaultRect; // bottom = 140
            const viewport: ViewportInfo = {
                scrollY: 0,
                innerHeight: 180, // Only 40px available below (180-140), which is 13% of 300px (less than 70%)
                innerWidth: 1200,
            };

            const result = calculateMenuPlacement(rect, viewport);

            expect(result).toEqual({
                side: 'right', // Should use side placement since bottom would be significantly cut off
                align: 'start',
            });
        });

        it('should handle very small viewport', () => {
            const rect: PlacementRect = {
                top: 10,
                bottom: 50,
                left: 10,
                right: 100,
            };
            const viewport: ViewportInfo = {
                scrollY: 0,
                innerHeight: 200,
                innerWidth: 300,
            };

            const result = calculateMenuPlacement(rect, viewport);

            expect(result).toEqual({
                side: 'bottom',
                align: 'start',
            });
        });

        it('should handle trigger at viewport edges', () => {
            const rect: PlacementRect = {
                top: 0,
                bottom: 40,
                left: 0,
                right: 100,
            };
            const viewport: ViewportInfo = {
                scrollY: 0,
                innerHeight: 200, // Small viewport to trigger constrained condition
                innerWidth: 1200,
            };

            const result = calculateMenuPlacement(rect, viewport);

            expect(result).toEqual({
                side: 'right',
                align: 'start',
            });
        });
    });

    describe('boundary conditions', () => {
        it('should prefer right side when right has more space available', () => {
            const rect: PlacementRect = {
                top: 50,
                bottom: 90,
                left: 300, // Left has 300px, right has 500px
                right: 400,
            };
            const viewport: ViewportInfo = {
                scrollY: 10,
                innerHeight: 200, // Small viewport to trigger constrained condition
                innerWidth: 900,
            };

            const result = calculateMenuPlacement(rect, viewport);

            expect(result).toEqual({
                side: 'right',
                align: 'start',
            });
        });

        it('should require exactly 320px for side placement', () => {
            const rect: PlacementRect = {
                top: 50,
                bottom: 90,
                left: 319, // Exactly 319px on left (< 320px required)
                right: 400,
            };
            const viewport: ViewportInfo = {
                scrollY: 10,
                innerHeight: 200, // Small viewport to trigger constrained condition
                innerWidth: 1000,
            };

            const result = calculateMenuPlacement(rect, viewport);

            expect(result).toEqual({
                side: 'right', // Right side has 600px (> 320px)
                align: 'start',
            });
        });
    });
});
