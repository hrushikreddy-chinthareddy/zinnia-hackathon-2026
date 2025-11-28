import { fireEvent, render } from '@testing-library/react';

import ActionButton from './action-button';

const mockHandleMessageSend = jest.fn();
const mockHandleStopResponse = jest.fn();

jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => {
            const translations: Record<string, string> = {
                'chat.send': 'Send',
                'chat.stop': 'Stop',
            };
            return translations[key] || key;
        },
    }),
}));

describe('ActionButton', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    const defaultProps = {
        message: 'Test message',
        handleMessageSend: mockHandleMessageSend,
        handleStopResponse: mockHandleStopResponse,
    };

    it('renders the button', () => {
        const { getByRole } = render(<ActionButton {...defaultProps} />);
        expect(getByRole('button')).toBeInTheDocument();
    });

    it('renders with default aria-label when not streaming', () => {
        const { getByRole } = render(<ActionButton {...defaultProps} />);
        const button = getByRole('button');
        expect(button).toHaveAttribute('aria-label', 'send-button');
    });

    it('renders with default aria-label when streaming', () => {
        const { getByRole } = render(
            <ActionButton {...defaultProps} isStreaming={true} />
        );
        const button = getByRole('button');
        expect(button).toHaveAttribute('aria-label', 'stop-button');
    });

    it('renders with custom aria-label when provided', () => {
        const { getByRole } = render(
            <ActionButton {...defaultProps} ariaLabel="custom-label" />
        );
        const button = getByRole('button');
        expect(button).toHaveAttribute('aria-label', 'custom-label');
    });

    it('renders send icon when not streaming', () => {
        const { container } = render(<ActionButton {...defaultProps} />);
        const svg = container.querySelector('svg');
        expect(svg).toBeInTheDocument();
        const paths = container.querySelectorAll('svg path');
        expect(paths.length).toBeGreaterThan(0);
    });

    it('renders stop icon when streaming', () => {
        const { container } = render(
            <ActionButton {...defaultProps} isStreaming={true} />
        );
        const svg = container.querySelector('svg');
        expect(svg).toBeInTheDocument();
        const rect = container.querySelector('svg rect');
        expect(rect).toBeInTheDocument();
    });

    it('displays "Send" text when not streaming', () => {
        const { getByText } = render(<ActionButton {...defaultProps} />);
        expect(getByText('Send')).toBeInTheDocument();
    });

    it('displays "Stop" text when streaming', () => {
        const { getByText } = render(
            <ActionButton {...defaultProps} isStreaming={true} />
        );
        expect(getByText('Stop')).toBeInTheDocument();
    });

    it('calls handleMessageSend when clicked and not streaming', () => {
        const { getByRole } = render(<ActionButton {...defaultProps} />);
        const button = getByRole('button');

        fireEvent.click(button);

        expect(mockHandleMessageSend).toHaveBeenCalledWith('Test message');
        expect(mockHandleMessageSend).toHaveBeenCalledTimes(1);
        expect(mockHandleStopResponse).not.toHaveBeenCalled();
    });

    it('calls handleStopResponse when clicked and streaming', () => {
        const { getByRole } = render(
            <ActionButton {...defaultProps} isStreaming={true} />
        );
        const button = getByRole('button');

        fireEvent.click(button);

        expect(mockHandleStopResponse).toHaveBeenCalledTimes(1);
        expect(mockHandleMessageSend).not.toHaveBeenCalled();
    });

    it('is disabled when disabled prop is true', () => {
        const { getByRole } = render(
            <ActionButton {...defaultProps} disabled={true} />
        );
        const button = getByRole('button');
        expect(button).toBeDisabled();
    });

    it('is enabled when disabled prop is false', () => {
        const { getByRole } = render(
            <ActionButton {...defaultProps} disabled={false} />
        );
        const button = getByRole('button');
        expect(button).not.toBeDisabled();
    });

    it('is enabled by default when disabled prop is not provided', () => {
        const { getByRole } = render(<ActionButton {...defaultProps} />);
        const button = getByRole('button');
        expect(button).not.toBeDisabled();
    });

    it('renders dotsBorder div', () => {
        const { container } = render(<ActionButton {...defaultProps} />);
        const button = container.querySelector('button');
        const divs = button?.querySelectorAll('div');
        expect(divs?.length).toBeGreaterThan(0);
    });

    it('renders textButton span', () => {
        const { getByText } = render(<ActionButton {...defaultProps} />);
        const textButton = getByText('Send');
        expect(textButton).toBeInTheDocument();
        expect(textButton.tagName).toBe('SPAN');
    });

    it('renders stopIconWrap when streaming', () => {
        const { container } = render(
            <ActionButton {...defaultProps} isStreaming={true} />
        );
        const rect = container.querySelector('svg rect');
        expect(rect).toBeInTheDocument();
    });

    it('does not render stop icon when not streaming', () => {
        const { container } = render(<ActionButton {...defaultProps} />);
        const rect = container.querySelector('svg rect');
        expect(rect).not.toBeInTheDocument();
    });
});
