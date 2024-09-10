import { render } from '@testing-library/react';

import AssistiveText, { AssistiveTextVariant } from './assistive-text';

describe('AssistiveText', () => {
    it('renders a default variant', () => {
        const { getByText, getByTestId } = render(<AssistiveText text="No Variant" data-testid={'assistiveTextComponent'} />);
        const assistiveTextComponent = getByTestId('assistiveTextComponent');
        const icon = getByTestId('check-icon');
        const text = getByText('No Variant');

        expect(assistiveTextComponent).toHaveClass('caption-selected flex w-full flex-row items-start gap-1');
        expect(icon).toBeInTheDocument();
        expect(icon).toHaveAttribute('width', '16');
        expect(icon).toHaveAttribute('height', '16');
        expect(text).toBeInTheDocument();
    });

    it('renders a brand Variant', () => {
        const { getByText, getByTestId } = render(
            <AssistiveText text="Brand Text" variant={AssistiveTextVariant.Brand} data-testid={'assistiveTextComponent'} />
        );
        const assistiveTextComponent = getByTestId('assistiveTextComponent');
        const icon = getByTestId('check-icon');
        const text = getByText('Brand Text');

        expect(assistiveTextComponent).toHaveClass('text-secondary');
        expect(icon).toBeInTheDocument();
        expect(icon).toHaveAttribute('width', '16');
        expect(icon).toHaveAttribute('height', '16');
        expect(text).toBeInTheDocument();
    });

    it('renders default variant with default check icon', () => {
        const { getByText, getByTestId } = render(
            <AssistiveText text="Default Text" variant={AssistiveTextVariant.Default} data-testid={'assistiveTextComponent'} />
        );
        const assistiveTextComponent = getByTestId('assistiveTextComponent');
        const icon = getByTestId('check-icon');
        const text = getByText('Default Text');

        expect(assistiveTextComponent).toHaveClass('text-gray-900');
        expect(icon).toBeInTheDocument();
        expect(icon).toHaveAttribute('width', '16');
        expect(icon).toHaveAttribute('height', '16');
        expect(text).toBeInTheDocument();
    });

    it('renders warning variant with default circle info icon', () => {
        const { getByTestId } = render(
            <AssistiveText text="Warning Text" variant={AssistiveTextVariant.Warning} data-testid={'assistiveTextComponent'} />
        );
        const assistiveTextComponent = getByTestId('assistiveTextComponent');
        const icon = getByTestId('circle-info-icon');

        expect(assistiveTextComponent).toHaveClass('text-semantic-warning');
        expect(icon).toBeInTheDocument();
        expect(icon).toHaveAttribute('width', '16');
        expect(icon).toHaveAttribute('height', '16');
    });

    it('renders info variant with alert exclamation icon', () => {
        const { getByTestId } = render(
            <AssistiveText text="Info Text" variant={AssistiveTextVariant.Info} data-testid={'assistiveTextComponent'} />
        );
        const assistiveTextComponent = getByTestId('assistiveTextComponent');
        const icon = getByTestId('alert-exclamation-icon');

        expect(assistiveTextComponent).toHaveClass('text-semantic-info');
        expect(icon).toBeInTheDocument();
        expect(icon).toHaveAttribute('width', '16');
        expect(icon).toHaveAttribute('height', '16');
    });

    it('renders error variant with hex exclamation icon', () => {
        const { getByTestId } = render(
            <AssistiveText text="Error Text" variant={AssistiveTextVariant.Error} data-testid={'assistiveTextComponent'} />
        );
        const assistiveTextComponent = getByTestId('assistiveTextComponent');
        const icon = getByTestId('hex-exclamation-icon');

        expect(assistiveTextComponent).toHaveClass('text-semantic-error');
        expect(icon).toBeInTheDocument();
        expect(icon).toHaveAttribute('width', '16');
        expect(icon).toHaveAttribute('height', '16');
    });

    it('renders success variant with custom icon override', () => {
        const customIcon = <span data-testid="custom-icon">Custom Icon</span>;
        const { getByTestId, queryByTestId } = render(
            <AssistiveText
                text="Success Text"
                variant={AssistiveTextVariant.Success}
                iconOverride={customIcon}
                data-testid={'assistiveTextComponent'}
            />
        );
        const assistiveTextComponent = getByTestId('assistiveTextComponent');
        const icon = queryByTestId('circle-check-icon');
        const customIconElement = getByTestId('custom-icon');

        expect(assistiveTextComponent).toHaveClass('text-semantic-success');
        expect(icon).not.toBeInTheDocument();
        expect(customIconElement).toBeInTheDocument();
        expect(customIconElement).toHaveTextContent('Custom Icon');
    });
});
