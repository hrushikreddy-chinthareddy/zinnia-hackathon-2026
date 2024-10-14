import { render, screen, fireEvent } from '@testing-library/react';

import CardInfo from './card-info';

const mockProps = {
    className: 'custom-class',
    cta: {
        action: jest.fn(),
        text: 'Learn More',
    },
    icon: <div>Icon</div>,
    secondaryCta: <div>Secondary CTA</div>,
    subtitle: 'Subtitle Text',
    title: 'Title Text',
};

describe('CardInfo', () => {
    test('renders CardInfo component with provided props', () => {
        render(<CardInfo {...mockProps} />);

        expect(screen.getByText('Title Text')).toBeInTheDocument();
        expect(screen.getByText('Subtitle Text')).toBeInTheDocument();
        expect(screen.getByText('Icon')).toBeInTheDocument();
        expect(screen.getByText('Learn More')).toBeInTheDocument();
        expect(screen.getByText('Secondary CTA')).toBeInTheDocument();
    });

    test('renders CardInfo component without a secondary CTA', () => {
        const propsWithoutSecondaryCta = {
            ...mockProps,
            secondaryCta: undefined,
        };

        render(<CardInfo {...propsWithoutSecondaryCta} />);

        expect(screen.queryByText('Secondary CTA')).toBeNull();
    });

    test('calls the ctaAction when the button is clicked', () => {
        render(<CardInfo {...mockProps} />);

        fireEvent.click(screen.getByText('Learn More'));

        expect(mockProps.cta.action).toHaveBeenCalledTimes(1);
    });

    test('renders CardInfo component with custom className', () => {
        render(<CardInfo {...mockProps} />);

        expect(screen.getByRole('article')).toHaveClass('custom-class');
    });
});
