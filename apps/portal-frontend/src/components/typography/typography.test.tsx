import { render } from '@testing-library/react';

import Typography, { TypographyVariant } from './typography';

describe('Typography', () => {
    it('renders h1 with correct class name and children', () => {
        const { getByText } = render(
            <Typography variant={TypographyVariant.H1} className="custom-class">
                Heading 1
            </Typography>
        );
        const typography = getByText('Heading 1');
        expect(typography.tagName).toBe('H1');
        expect(typography.className).toContain('custom-class');
    });
    it('renders h2 with correct class name and children', () => {
        const { getByText } = render(
            <Typography variant={TypographyVariant.H2} className="custom-class">
                Heading 2
            </Typography>
        );
        const typography = getByText('Heading 2');
        expect(typography.tagName).toBe('H2');
        expect(typography.className).toContain('custom-class');
    });
    it('renders h2acc with correct class name and children', () => {
        const { getByText } = render(
            <Typography variant={TypographyVariant.H2acc} className="custom-class">
                Heading 2 Accented
            </Typography>
        );
        const typography = getByText('Heading 2 Accented');
        expect(typography.tagName).toBe('H2');
        expect(typography.className).toContain('custom-class');
    });
    it('renders h3 with correct class name and children', () => {
        const { getByText } = render(
            <Typography variant={TypographyVariant.H3} className="custom-class">
                Heading 3
            </Typography>
        );
        const typography = getByText('Heading 3');
        expect(typography.tagName).toBe('H3');
        expect(typography.className).toContain('custom-class');
    });
    it('renders a correctly styled h2 with label styling', () => {
        const { getByText } = render(
            <Typography variant={TypographyVariant.LabelAlt} className="custom-class" asTag="h2">
                Heading 2
            </Typography>
        );
        const typography = getByText('Heading 2');
        expect(typography.tagName).toBe('H2');
        expect(typography.className).toContain('custom-class');
        expect(typography.className).toContain('font-primary text-[12px] font-medium md:text-[14px] lg:text-[16px]');
    });
});
