import { Meta, StoryObj } from '@storybook/react';

import { ReactComponent as CogIcon } from '@deps/styles/elements/icons/icons_outlined/cog.svg';
import { ReactComponent as ErrorIcon } from '@deps/styles/elements/icons/icons_outlined/exclamation-alert.svg';

import CardInfoComponent, { CardInfoProps } from './card-info';

interface CardInfoStoryProps extends CardInfoProps {
    showSecondaryCta?: boolean;
}

const meta: Meta<typeof CardInfoComponent> = {
    component: CardInfoComponent,
    title: 'Components/CardInfo',
};

export default meta;
type Story = StoryObj<CardInfoStoryProps>;

export const Default: Story = {
    args: {
        title: 'Remove address?',
        subtitle: "If you remove the policy's mailing address, one will be chosen for you.",
        cta: {
            action: () => console.log('Clicked cta'),
            text: 'Remove residential address',
        },
        showSecondaryCta: true,
    },
    render: ({ cta, subtitle, title, showSecondaryCta }) => (
        <CardInfoComponent
            icon={<ErrorIcon className="text-primary" height={50} width={50} />}
            title={title}
            subtitle={subtitle}
            cta={cta}
            secondaryCta={
                showSecondaryCta ? (
                    <button
                        aria-label="Cancel and go back"
                        className="font-primary text-[14px] font-semibold leading-6 text-secondary"
                        onClick={() => console.log('Clicked secondaryCta')}
                    >
                        Cancel and go back
                    </button>
                ) : null
            }
        />
    ),
};

export const WithBorder: Story = {
    args: {
        title: 'Search Error',
        subtitle: 'Your search could not be completed. Please refine your search criteria and try again.',
    },
    render: ({ subtitle, title }) => (
        <div className="flex h-[500px] w-full items-center justify-center rounded border-2 border-dashed border-semantic-error bg-white shadow-sm">
            <CardInfoComponent
                icon={<CogIcon className="text-semantic-error" height={50} width={50} />}
                title={title}
                subtitle={subtitle}
            />
        </div>
    ),
};
