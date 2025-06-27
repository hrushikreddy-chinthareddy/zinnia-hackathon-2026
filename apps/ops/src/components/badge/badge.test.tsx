import { render, screen } from '@testing-library/react';

import { BadgeTest } from '@deps/jest/constants/test-id-constants';

import Badge from './badge';
import '@testing-library/jest-dom';
import { BadgeVariant } from './badge.helpers';

describe('Badge Component', () => {
    it('should render without crashing', () => {
        render(<Badge variant={BadgeVariant.Info} label="Test Label" />);
        const badge = screen.getByTestId(BadgeTest.Badge);
        expect(badge).toBeInTheDocument();
    });

    it('should display the correct label', () => {
        render(<Badge variant={BadgeVariant.Info} label="Test Label" />);
        const label = screen.getByText('Test Label');
        expect(label.textContent).toBe('Test Label');
    });

    it('should have the correct styling based on the variant prop', () => {
        const { rerender } = render(
            <Badge variant={BadgeVariant.Info} label="Test Label" />
        );
        let badge = screen.getByTestId(BadgeTest.Badge);
        expect(badge).toHaveClass('border-semantic-info text-semantic-info');

        rerender(<Badge variant={BadgeVariant.Positive} label="Test Label" />);
        badge = screen.getByTestId(BadgeTest.Badge);
        expect(badge).toHaveClass(
            'border-semantic-success text-semantic-success'
        );

        rerender(<Badge variant={BadgeVariant.Warning} label="Test Label" />);
        badge = screen.getByTestId(BadgeTest.Badge);
        expect(badge).toHaveClass(
            'border-semantic-warning text-semantic-warning'
        );

        rerender(<Badge variant={BadgeVariant.Negative} label="Test Label" />);
        badge = screen.getByTestId(BadgeTest.Badge);
        expect(badge).toHaveClass('border-semantic-error text-semantic-error');

        rerender(<Badge variant={BadgeVariant.Urgent} label="Test Label" />);
        badge = screen.getByTestId(BadgeTest.Badge);
        expect(badge).toHaveClass('border-semantic-error text-semantic-error');

        rerender(<Badge variant={BadgeVariant.Neutral} label="Test Label" />);
        badge = screen.getByTestId(BadgeTest.Badge);
        expect(badge).toHaveClass('border-gray-600 text-gray-600');
    });

    it('should display an icon if provided', () => {
        const icon = <i data-testid="test-icon" className="icon-test" />;
        render(
            <Badge variant={BadgeVariant.Info} label="Test Label" icon={icon} />
        );
        const testIcon = screen.getByTestId('test-icon');
        expect(testIcon).toBeInTheDocument();
    });

    it('should have the correct rounded or non-rounded styling based on the rounded prop', () => {
        const { rerender } = render(
            <Badge variant={BadgeVariant.Info} label="Test Label" rounded />
        );
        let badge = screen.getByTestId(BadgeTest.Badge);
        expect(badge).toHaveClass('rounded-full');

        rerender(
            <Badge
                variant={BadgeVariant.Info}
                label="Test Label"
                rounded={false}
            />
        );
        badge = screen.getByTestId(BadgeTest.Badge);
        expect(badge).toHaveClass('rounded');
    });
});
