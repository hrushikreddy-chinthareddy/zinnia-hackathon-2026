import { render, screen, fireEvent } from '@testing-library/react';

import BannerAlert, { BannerVariant } from './banner-alert';

describe('BannerAlert component', () => {
    const bodyText = 'Test body text';

    it('renders banner with correct text and styles when given no variant', () => {
        render(<BannerAlert>{bodyText}</BannerAlert>);

        expect(screen.getByText(bodyText)).toBeInTheDocument();
        expect(screen.getByTestId('banner-alert')).toHaveClass(
            'text-white bg-gray-900'
        );
    });

    it('renders banner with correct styles when given error variant', () => {
        render(
            <BannerAlert variant={BannerVariant.Error}>{bodyText}</BannerAlert>
        );

        expect(screen.getByTestId('banner-alert')).toHaveClass(
            'text-semantic-error border-semantic-error bg-semantic-error-light'
        );
    });

    it('renders banner with correct styles when given information variant', () => {
        render(
            <BannerAlert variant={BannerVariant.Information}>
                {bodyText}
            </BannerAlert>
        );

        expect(screen.getByTestId('banner-alert')).toHaveClass(
            'text-semantic-info border-semantic-info bg-semantic-info-light'
        );
    });

    it('renders banner with correct styles when given success variant', () => {
        render(
            <BannerAlert variant={BannerVariant.Success}>
                {bodyText}
            </BannerAlert>
        );

        expect(screen.getByTestId('banner-alert')).toHaveClass(
            'text-semantic-success border-semantic-success bg-semantic-success-light'
        );
    });

    it('renders banner with correct styles when given warning variant', () => {
        render(
            <BannerAlert variant={BannerVariant.Warning}>
                {bodyText}
            </BannerAlert>
        );

        expect(screen.getByTestId('banner-alert')).toHaveClass(
            'text-semantic-warning border-semantic-warning bg-semantic-warning-light'
        );
    });

    it('renders banner with correct cta text and href when given cta', () => {
        const cta = {
            href: '/this-is-a-test',
            text: 'CTA text',
        };

        render(<BannerAlert cta={cta}>{bodyText}</BannerAlert>);

        expect(screen.getByText(cta.text)).toBeInTheDocument();
        expect(screen.getByText(cta.text).closest('a')).toHaveAttribute(
            'href',
            cta.href
        );
    });

    it('removes banner from dom when close button is clicked', () => {
        render(<BannerAlert>{bodyText}</BannerAlert>);

        fireEvent.click(screen.getByLabelText('close'));

        expect(screen.queryByText(bodyText)).not.toBeInTheDocument();
    });

    it('renders banner without a close button', () => {
        render(<BannerAlert canDismiss={false}>{bodyText}</BannerAlert>);

        expect(screen.queryByLabelText('close')).not.toBeInTheDocument();
    });
});
