import { Meta, StoryObj } from '@storybook/nextjs';
import {
  Icon,
  IconType,
  Popover,
  PopoverPlacement,
  Tag,
  TagVariant,
} from '@zinnia/bloom/components';

import { HeaderLink, HeaderLinkProps } from './HeaderLink';

const meta: Meta<typeof HeaderLink> = {
  component: HeaderLink,
  title: 'Components/HeaderLink',
  args: {
    title: 'Coverage',
  },
};

export default meta;

export const Default: StoryObj<HeaderLinkProps> = {
  args: {},
};

export const AsLink = { args: { link: { url: '#', label: 'Coverage' } } };

export const WithAdditionalElements = {
  args: {
    children: (
      <>
        <Popover
          title="popover"
          trigger={
            <Icon
              type={IconType.CIRCLE_INFO}
              color="var(--color-base-icon-icon-tooltip, #ff7500)"
            />
          }
          placement={PopoverPlacement.BottomRight}
        >
          content
        </Popover>
        <Tag text="Tag" variant={TagVariant.Information} />
      </>
    ),
  },
};
