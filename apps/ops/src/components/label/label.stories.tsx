import { Meta } from '@storybook/react';

import Label, { LabelVariant } from '@deps/components/label/label';

export default {
    title: 'Components/Label',
    component: Label,
    decorators: [
        Story => (
            <div className="container">
                <Story />
            </div>
        ),
    ],
} as Meta<typeof Label>;

export const LabelComponent = () => {
    return (
        <div className="flex flex-col gap-5">
            <Label label="All caps label" variant={LabelVariant.LabelCaps} />
            <Label label="Field Label" variant={LabelVariant.FieldLabel} />
            <Label label="Field Label All Caps" variant={LabelVariant.FieldLabelCaps} />
            <Label label="A large label" variant={LabelVariant.LabelLg} />
            <Label label="A large Alt label" variant={LabelVariant.LabelLgAlt} />
            <Label label="A medium label" variant={LabelVariant.LabelMd} />
            <Label label="A medium alt label" variant={LabelVariant.LabelMdAlt} />
            <Label label="A small label" variant={LabelVariant.LabelSm} />
            <Label label="A small alt label" variant={LabelVariant.LabelSmAlt} />
            <Label label="Field Label with tooltip" variant={LabelVariant.FieldLabel} tooltipBody="I'm a tooltip!" />
        </div>
    );
};
