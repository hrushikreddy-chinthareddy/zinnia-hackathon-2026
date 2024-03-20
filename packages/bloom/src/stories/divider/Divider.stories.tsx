import { Meta, StoryObj } from '@storybook/react';

import { Divider, DividerProps } from '@/components';

const meta: Meta<typeof Divider> = {
  title: 'Components/Divider',
  component: Divider,
  args: {
    color: 'default',
    direction: 'horizontal'
  },
  render: (args) => (
    <div style={{ display: 'flex', width: '100%', backgroundColor: 'var(--color-base-surface-surface-primary)', flexDirection: args.direction === 'vertical' ? 'row' : 'column', gap: 'var(--measure-dimension-z-space-2)', padding: 'var(--measure-dimension-z-space-2)' }}>
      <div>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce a nunc posuere velit fermentum commodo et ut quam. Curabitur id maximus libero, ut pharetra felis.</div>
      <Divider {...args} />
      <div>Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Cras consequat justo in erat ullamcorper, in dapibus nunc consectetur.</div>
    </div>
  )
} as Meta<typeof Divider>;

export default meta;
type StoryType = StoryObj<DividerProps>;

export const Default: StoryType = {}

export const Primary: StoryType = {
  args: {
    color: 'primary'
  }
}

export const Subtle: StoryType = {
  args: {
    color: 'subtle'
  }
}

export const Dark: StoryType = {
  args: {
    color: 'dark'
  }
}

export const Darker: StoryType = {
  args: {
    color: 'darker'
  }
}

export const Vertical: StoryType = {
  args: {
    direction: 'vertical'
  }
}

export const VerticalPrimary: StoryType = {
  args: {
    ...Vertical.args,
    ...Primary.args
  }
}

export const VerticalSubtle: StoryType = {
  args: {
    ...Vertical.args,
    ...Subtle.args
  }
}

export const VerticalDark: StoryType = {
  args: {
    ...Vertical.args,
    ...Dark.args
  }
}

export const VerticalDarker: StoryType = {
  args: {
    ...Vertical.args,
    ...Darker.args
  }
}
