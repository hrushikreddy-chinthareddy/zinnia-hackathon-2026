import { render } from '@testing-library/react';

import { injectRowFormDataIntoChildren } from './inject-row-form-data-into-children';

const TestComponent = ({ uiSchema }: { uiSchema?: Record<string, any> }) => {
    return <div data-testid="child" data-ui={JSON.stringify(uiSchema)} />;
};

describe('injectRowFormDataIntoChildren', () => {
    it('injects rowFormData into ui:options', () => {
        const rowFormData = { id: '123' };

        const result = injectRowFormDataIntoChildren(
            <TestComponent uiSchema={{}} />,
            rowFormData
        );

        const { getByTestId } = render(<>{result}</>);
        const uiSchema = JSON.parse(
            getByTestId('child').getAttribute('data-ui')!
        );

        expect(uiSchema['ui:options'].rowFormData).toEqual(rowFormData);
    });

    it('preserves existing ui:options', () => {
        const rowFormData = { id: '123' };

        const result = injectRowFormDataIntoChildren(
            <TestComponent uiSchema={{ 'ui:options': { foo: 'bar' } }} />,
            rowFormData
        );

        const { getByTestId } = render(<>{result}</>);
        const uiSchema = JSON.parse(
            getByTestId('child').getAttribute('data-ui')!
        );

        expect(uiSchema['ui:options']).toEqual({
            foo: 'bar',
            rowFormData,
        });
    });

    it('preserves other uiSchema properties', () => {
        const rowFormData = { id: '123' };

        const result = injectRowFormDataIntoChildren(
            <TestComponent
                uiSchema={{
                    'ui:widget': 'custom',
                    'ui:options': { foo: 'bar' },
                }}
            />,
            rowFormData
        );

        const { getByTestId } = render(<>{result}</>);
        const uiSchema = JSON.parse(
            getByTestId('child').getAttribute('data-ui')!
        );

        expect(uiSchema['ui:widget']).toBe('custom');
        expect(uiSchema['ui:options']).toEqual({
            foo: 'bar',
            rowFormData,
        });
    });

    it('returns non-element children unchanged', () => {
        const children = ['text', 42, null];

        const result = injectRowFormDataIntoChildren(children, {
            id: '123',
        });

        expect(result).toEqual(['text', 42]);
    });
});
