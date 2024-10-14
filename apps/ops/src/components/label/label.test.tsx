import { composeStories } from '@storybook/react';
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';

import Label, { LabelVariant } from './label';
import * as stories from './label.stories';

expect.extend(toHaveNoViolations);

describe('Label Typography Without PII wrapper', () => {
    const { LabelComponent } = composeStories(stories);

    it('renders a LabelCaps label with correct class name', () => {
        const { getByText } = render(<Label label="Label 1" variant={LabelVariant.LabelCaps} />);
        const myLabel = getByText('Label 1');
        expect(myLabel.tagName).toBe('DIV');
        expect(myLabel.className).toBe('font-primary text-base font-medium uppercase');
    });

    it('renders FieldLabel label with correct class name and should be sentance case', () => {
        const { getByText } = render(<Label label="A Sentence Case Field Label" variant={LabelVariant.FieldLabel} />);
        const myLabel = getByText('A sentence case field label');
        expect(myLabel.tagName).toBe('DIV');
        expect(myLabel.className).toBe('font-primary text-field-label font-bold');
        expect(myLabel.textContent).toBe('A sentence case field label');
    });

    it('renders FieldLabelCaps label with correct class name', () => {
        const { getByText } = render(<Label label="Label 1" variant={LabelVariant.FieldLabelCaps} />);

        // Uppercase is tested by the "uppercase" class
        const myLabel = getByText('Label 1');
        expect(myLabel.tagName).toBe('DIV');
        expect(myLabel.className).toBe('font-secondary text-sm font-medium uppercase');
    });

    it('renders Label-LG label with correct class name', () => {
        const { getByText } = render(<Label label="Label With Sentance Case" variant={LabelVariant.LabelLg} />);
        const myLabel = getByText('Label with sentance case');
        expect(myLabel.tagName).toBe('DIV');
        expect(myLabel.className).toBe('font-primary text-base font-semibold');
        expect(myLabel.textContent).toBe('Label with sentance case');
    });

    it('renders Label-LG-Alt label with correct class name', () => {
        const { getByText } = render(<Label label="label with sentance case" variant={LabelVariant.LabelLgAlt} />);
        const myLabel = getByText('Label with sentance case');
        expect(myLabel.tagName).toBe('DIV');
        expect(myLabel.className).toBe('font-primary text-base font-medium');
        expect(myLabel.textContent).toBe('Label with sentance case');
    });

    it('renders Label-Md label with correct class name', () => {
        const { getByText } = render(<Label label="Label With Sentance Case" variant={LabelVariant.LabelMd} />);
        const myLabel = getByText('Label with sentance case');
        expect(myLabel.tagName).toBe('DIV');
        expect(myLabel.className).toBe('font-primary text-md font-semibold');
        expect(myLabel.textContent).toBe('Label with sentance case');
    });

    it('renders Label-Md-Alt label with correct class name', () => {
        const { getByText } = render(<Label label="Label With Sentance Case" variant={LabelVariant.LabelMdAlt} />);
        const myLabel = getByText('Label with sentance case');
        expect(myLabel.tagName).toBe('DIV');
        expect(myLabel.className).toBe('font-primary text-md font-medium');
        expect(myLabel.textContent).toBe('Label with sentance case');
    });

    it('renders Label-Sm label with correct class name', () => {
        const { getByText } = render(<Label label="Label With Sentance Case" variant={LabelVariant.LabelSm} />);
        const myLabel = getByText('Label with sentance case');
        expect(myLabel.tagName).toBe('DIV');
        expect(myLabel.className).toBe('font-primary text-sm font-semibold');
        expect(myLabel.textContent).toBe('Label with sentance case');
    });

    it('renders Label-Md-Alt label with correct class name', () => {
        const { getByText } = render(<Label label="Label With Sentance Case" variant={LabelVariant.LabelSmAlt} />);
        const myLabel = getByText('Label with sentance case');
        expect(myLabel.tagName).toBe('DIV');
        expect(myLabel.className).toBe('font-primary text-sm font-medium');
        expect(myLabel.textContent).toBe('Label with sentance case');
    });

    it('Should have no accessibility violations', async () => {
        const { container } = render(<LabelComponent />);

        const results = await axe(container);
        expect(results).toHaveNoViolations();
    });
});

describe('Label Typography With PII wrapper', () => {
    const { LabelComponent } = composeStories(stories);

    it('renders a LabelCaps label with correct class name', () => {
        const { getByText } = render(<Label pii={true} label="Label 1" variant={LabelVariant.LabelCaps} />);
        const myLabel = getByText('Label 1');
        expect(myLabel.parentElement?.tagName).toBe('DIV');
        expect(myLabel.parentElement?.className).toBe('font-primary text-base font-medium uppercase');
    });

    it('renders FieldLabel label with correct class name and should be sentance case', () => {
        const { getByText } = render(<Label pii={true} label="A Sentence Case Field Label" variant={LabelVariant.FieldLabel} />);
        const myLabel = getByText('A sentence case field label');
        expect(myLabel.parentElement?.tagName).toBe('DIV');
        expect(myLabel.parentElement?.className).toBe('font-primary text-field-label font-bold');
        expect(myLabel.parentElement?.textContent).toBe('A sentence case field label');
    });

    it('renders FieldLabelCaps label with correct class name', () => {
        const { getByText } = render(<Label pii={true} label="Label 1" variant={LabelVariant.FieldLabelCaps} />);

        // Uppercase is tested by the "uppercase" class
        const myLabel = getByText('Label 1');
        expect(myLabel.parentElement?.tagName).toBe('DIV');
        expect(myLabel.parentElement?.className).toBe('font-secondary text-sm font-medium uppercase');
    });

    it('renders Label-LG label with correct class name', () => {
        const { getByText } = render(<Label pii={true} label="Label With Sentance Case" variant={LabelVariant.LabelLg} />);
        const myLabel = getByText('Label with sentance case');
        expect(myLabel.parentElement?.tagName).toBe('DIV');
        expect(myLabel.parentElement?.className).toBe('font-primary text-base font-semibold');
        expect(myLabel.parentElement?.textContent).toBe('Label with sentance case');
    });

    it('renders Label-LG-Alt label with correct class name', () => {
        const { getByText } = render(<Label pii={true} label="label with sentance case" variant={LabelVariant.LabelLgAlt} />);
        const myLabel = getByText('Label with sentance case');
        expect(myLabel.parentElement?.tagName).toBe('DIV');
        expect(myLabel.parentElement?.className).toBe('font-primary text-base font-medium');
        expect(myLabel.parentElement?.textContent).toBe('Label with sentance case');
    });

    it('renders Label-Md label with correct class name', () => {
        const { getByText } = render(<Label pii={true} label="Label With Sentance Case" variant={LabelVariant.LabelMd} />);
        const myLabel = getByText('Label with sentance case');
        expect(myLabel.parentElement?.tagName).toBe('DIV');
        expect(myLabel.parentElement?.className).toBe('font-primary text-md font-semibold');
        expect(myLabel.parentElement?.textContent).toBe('Label with sentance case');
    });

    it('renders Label-Md-Alt label with correct class name', () => {
        const { getByText } = render(<Label pii={true} label="Label With Sentance Case" variant={LabelVariant.LabelMdAlt} />);
        const myLabel = getByText('Label with sentance case');
        expect(myLabel.parentElement?.tagName).toBe('DIV');
        expect(myLabel.parentElement?.className).toBe('font-primary text-md font-medium');
        expect(myLabel.parentElement?.textContent).toBe('Label with sentance case');
    });

    it('renders Label-Sm label with correct class name', () => {
        const { getByText } = render(<Label pii={true} label="Label With Sentance Case" variant={LabelVariant.LabelSm} />);
        const myLabel = getByText('Label with sentance case');
        expect(myLabel.parentElement?.tagName).toBe('DIV');
        expect(myLabel.parentElement?.className).toBe('font-primary text-sm font-semibold');
        expect(myLabel.parentElement?.textContent).toBe('Label with sentance case');
    });

    it('renders Label-Md-Alt label with correct class name', () => {
        const { getByText } = render(<Label pii={true} label="Label With Sentance Case" variant={LabelVariant.LabelSmAlt} />);
        const myLabel = getByText('Label with sentance case');
        expect(myLabel.parentElement?.tagName).toBe('DIV');
        expect(myLabel.parentElement?.className).toBe('font-primary text-sm font-medium');
        expect(myLabel.parentElement?.textContent).toBe('Label with sentance case');
    });

    it('Should have no accessibility violations', async () => {
        const { container } = render(<LabelComponent />);

        const results = await axe(container);
        expect(results).toHaveNoViolations();
    });
});
