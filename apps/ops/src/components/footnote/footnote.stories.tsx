import { Meta } from '@storybook/react';

import '@deps/styles/styles.css';

import { ProductType } from '@deps/models/policy/sor-policy';

import Footnote from './footnote';

export default {
    title: 'Components/Footnote',
    component: Footnote,
    decorators: [
        Story => (
            <div className="p-10">
                <Story />
            </div>
        ),
    ],
} as Meta<typeof Footnote>;

export const FootnoteComponent = () => {
    return <Footnote productMarketingName="Carrier" productType={ProductType.UNIVERSALLIFE} />;
};
