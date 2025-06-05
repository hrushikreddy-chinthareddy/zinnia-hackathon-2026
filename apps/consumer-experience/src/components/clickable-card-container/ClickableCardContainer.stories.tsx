import { Meta, StoryObj } from '@storybook/react';

import { ClickableCardContainer, Props } from './ClickableCardContainer';

const meta: Meta<typeof ClickableCardContainer> = {
  component: ClickableCardContainer,
  title: 'Components/ClickableCardContainer',
  tags: ['autodocs'],
};

export default meta;

export const Default: StoryObj<Props> = {
  args: {
    linkTo: {
      url: '#',
      label: 'go to link',
      isInternal: true,
    },
    children: <div className="typography-content-value">Card</div>,
  },
};

export const WithList = {
  args: {
    linkTo: {
      url: '#',
      label: 'go to link',
      isInternal: true,
    },
    children: <div className="typography-content-value">Card With List</div>,
    listItems: [
      {
        content: (
          <div>
            <div className="typography-labels-field-label">
              Insert title here
            </div>
            <div className="typography-content-caption">Caption text</div>
          </div>
        ),
        linkTo: {
          url: '#',
          label: 'go to link',
          isInternal: true,
          disabled: false,
        },
      },
      {
        content: (
          <div>
            <div className="typography-labels-field-label">
              Insert title here
            </div>
            <div className="typography-content-caption">Caption text</div>
          </div>
        ),
        linkTo: {
          url: '#',
          label: 'go to link',
          isInternal: true,
        },
      },
    ],
  },
};
