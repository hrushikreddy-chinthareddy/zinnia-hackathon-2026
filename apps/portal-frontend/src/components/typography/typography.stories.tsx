import { Meta } from '@storybook/react';

import Typography, { TypographyVariant } from '@deps/components/typography/typography';

export const TypographyComponent = (args: any) => {
    return (
        <div className="flex flex-col gap-5">
            <Typography {...args} />
        </div>
    );
};

const meta: Meta<typeof Typography> = {
    component: Typography,
    args: {
        children: 'Heading',
        variant: TypographyVariant.H1,
    },
    argTypes: {
        className: {
            table: {
                disable: true,
            },
        },
        variant: {
            options: [TypographyVariant.H1, TypographyVariant.H2, TypographyVariant.H2acc, TypographyVariant.H3, TypographyVariant.H4],
        },
        asTag: {
            options: ['h1', 'h2', 'h3', 'h4', 'h5', 'label', 'p'],
        },
    },
};

export default meta;
