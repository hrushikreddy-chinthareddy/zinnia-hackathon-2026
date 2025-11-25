import { SkipLink } from './SkipLink';

import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof SkipLink> = {
    title: 'Components/SkipLink',
    component: SkipLink,
    parameters: {
        docs: {
            description: {
                component:
                    'A skip link component for accessibility. Hidden by default, becomes visible when focused via keyboard navigation. Allows users to skip directly to main content.',
            },
        },
    },
    argTypes: {
        href: {
            control: 'text',
            description: 'Target element ID to skip to',
        },
        tabIndex: {
            control: 'number',
            description: 'Tab index for keyboard navigation order',
        },
        size: {
            control: 'select',
            options: ['small', 'medium', 'large'],
            description: 'Button size variant',
        },
    },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        href: '#main',
        tabIndex: 0,
        size: 'small',
    },
    parameters: {
        docs: {
            description: {
                story: 'Default skip link. Press Tab to focus and see the skip link appear at the top of the screen.',
            },
        },
    },
};

export const CustomTarget: Story = {
    args: {
        href: '#content',
        tabIndex: 0,
        size: 'small',
    },
    parameters: {
        docs: {
            description: {
                story: 'Skip link with custom target element ID.',
            },
        },
    },
};

export const WithMainContent: Story = {
    args: {
        href: '#demo-main',
        tabIndex: 0,
        size: 'small',
    },
    render: (args) => (
        <div>
            <SkipLink {...args} />
            <div
                style={{
                    padding: '20px',
                    border: '1px solid #ccc',
                    marginTop: '20px',
                }}
            >
                <p>
                    Press Tab to focus the skip link above, then press Enter to
                    skip to main content below.
                </p>
            </div>
            <main
                id="demo-main"
                style={{
                    padding: '20px',
                    backgroundColor: '#f5f5f5',
                    marginTop: '20px',
                }}
            >
                <h2>Main Content</h2>
                <p>
                    This is the main content area that the skip link will jump
                    to.
                </p>
                <p>
                    The skip link helps keyboard users bypass navigation and get
                    directly to the main content.
                </p>
            </main>
        </div>
    ),
    parameters: {
        docs: {
            description: {
                story: 'Complete example showing skip link functionality with actual main content to skip to.',
            },
        },
    },
};
