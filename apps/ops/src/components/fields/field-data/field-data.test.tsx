import { faker } from '@faker-js/faker';
import { render } from '@testing-library/react';

import FieldData, { FieldDataProps, FieldDataTest } from './field-data';

describe('Field Data', () => {
    const label = faker.lorem.word();
    const value = faker.lorem.word();
    let props: FieldDataProps;
    beforeEach(() => {
        props = {
            label,
            children: value,
        };
    });
    const renderComponent = () =>
        render(<FieldData {...props}>{value}</FieldData>);

    it('renders without crashing', () => {
        const { getByTestId } = renderComponent();
        const container = getByTestId(FieldDataTest.Container);
        const label = getByTestId(FieldDataTest.Label);
        const value = getByTestId(FieldDataTest.Value);
        const requiredElements = [container, label, value];
        requiredElements.map((element) => expect(element).toBeInTheDocument());
    });

    describe('design reqs', () => {
        it('matches layout requirements', () => {
            const { getByTestId } = renderComponent();
            const container = getByTestId(FieldDataTest.Container);
            // vertical direction
            expect(container).toHaveClass('flex-col');
        });

        it.todo('use visual testing to check render');
    });
});
