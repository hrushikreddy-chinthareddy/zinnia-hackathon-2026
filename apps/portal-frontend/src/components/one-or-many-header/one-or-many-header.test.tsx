import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';

import OneOrManyHeader from './one-or-many-header';

describe('OneOrManyHeader', () => {
    it('should display -- when no entities are provided', () => {
        const entities = [] as { name: string; ssn: string }[];
        render(<OneOrManyHeader entities={entities} />);
        expect(screen.getByText('--')).toBeInTheDocument();
    });

    it('should display a single entity when only one entity is provided', () => {
        const entities = [{ name: 'Entity 1', ssn: '***-**-1234' }];
        render(<OneOrManyHeader entities={entities} />);
        expect(screen.getByText('Entity 1')).toBeInTheDocument();
    });

    it('should display entities from multiple pairs', () => {
        const entities = [
            { name: 'Entity 1', ssn: 'Entity 2' },
            { name: 'Entity 3', ssn: 'Entity 4' },
        ];
        render(<OneOrManyHeader entities={entities} />);
        expect(screen.getByText('Entity 1')).toBeInTheDocument();
        expect(screen.getByTestId('plus-number')).toHaveTextContent('+1');
    });
});
