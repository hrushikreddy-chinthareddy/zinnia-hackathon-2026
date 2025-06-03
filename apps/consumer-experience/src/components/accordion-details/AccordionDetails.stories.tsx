import * as Accordion from '@radix-ui/react-accordion';
import { Meta, StoryObj } from '@storybook/nextjs';
import { Button } from '@zinnia/bloom/components';

import AccordionDetails from './AccordionDetails';
import { AccordionType } from './utils';

const meta = {
  component: AccordionDetails,
  title: 'Components/AccordionDetails',
  tags: ['autodocs'],
} satisfies Meta<typeof AccordionDetails>;

export default meta;

type Story = StoryObj<typeof meta>;

const accordionItems = [
  {
    value: 'item-1',
    trigger: 'Policy parties',
    content: 'other...',
  },
  {
    value: 'item-2',
    trigger: <b>Other policy parties</b>,
    content: (
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '120px 120px',
          rowGap: '16px',
        }}
      >
        <Button mode="link" size="small">
          Flora Williams
        </Button>
        <Button mode="link" size="small">
          Cindy Williams
        </Button>
        <Button mode="link" size="small">
          John Williams
        </Button>
      </div>
    ),
  },
];

export const Default: Story = {
  args: {
    items: accordionItems,
    defaultValue: 'item-1',
    type: AccordionType.Single,
    collapsible: true,
  },
};

export const MultipleSelection: Story = {
  args: {
    items: accordionItems,
    type: AccordionType.Multiple,
    defaultValue: ['item-1', 'item-2'],
  },
};

export const NonCollapsible: Story = {
  args: {
    items: [
      {
        value: 'item-1',
        trigger: 'Item 1',
        content: "I don't close",
      },
      {
        value: 'item-2',
        trigger: 'Item 2',
        content: "I don't close",
      },
    ],
    defaultValue: 'item-2',
    collapsible: false,
  },
};

export const FullyCustomizable: Story = {
  args: {
    children: (
      <>
        <Accordion.Item value="item-1">
          <Accordion.Trigger>Is it accessible?</Accordion.Trigger>
          <Accordion.Content>
            Yes. It adheres to the WAI-ARIA design pattern.
          </Accordion.Content>
        </Accordion.Item>
        <Accordion.Item value="item-2">
          <Accordion.Trigger>Is it unstyled?</Accordion.Trigger>
          <Accordion.Content style={{ backgroundColor: 'red' }}>
            Yes. It's unstyled by default, giving you freedom over the look and
            feel.
          </Accordion.Content>
        </Accordion.Item>
        <Accordion.Item value="item-3">
          <Accordion.Trigger>Can it be animated?</Accordion.Trigger>
          <Accordion.Content className="content">
            <style>
              {`
                .content {
                  overflow: hidden;
                }
                .content[data-state="open"] {
                  animation: slideDown 0.2s ease-out;
                }
                .content[data-state="closed"] {
                  animation: slideUp 0.2s ease-out;
                }
                @keyframes slideDown {
                  from { height: 0; }
                  to { height: var(--radix-accordion-content-height); }
                }
                @keyframes slideUp {
                  from { height: var(--radix-accordion-content-height); }
                  to { height: 0; }
                }
              `}
            </style>
            <div>
              Yes! You can animate the Accordion with CSS or JavaScript.
            </div>
          </Accordion.Content>
        </Accordion.Item>
      </>
    ),
  },
};
