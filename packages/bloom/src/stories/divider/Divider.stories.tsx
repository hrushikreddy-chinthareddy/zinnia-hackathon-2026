import { Meta, StoryObj } from '@storybook/react';

import { Divider, DividerProps } from '@/components';

const meta: Meta<typeof Divider> = {
  title: 'Components/Divider',
  component: Divider,
  args: {
    color: 'default',
    direction: 'horizontal'
  }
} as Meta<typeof Divider>;

export default meta;
type StoryType = StoryObj<DividerProps>;

export const Default: StoryType = {
  render: (args) => {
    return (
      <div style={{ display: 'flex', width: '100%', backgroundColor: 'white', flexDirection: args.direction === 'vertical' ? 'row' : 'column', gap: '8px', padding: '8px'}}>
        <div>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce a nunc posuere velit fermentum commodo et ut quam. Curabitur id maximus libero, ut pharetra felis.</div>
        <Divider {...args} />
        <div>Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Cras consequat justo in erat ullamcorper, in dapibus nunc consectetur.</div>
      </div>
    )
  }
}

export const VerticalDark: StoryType = {
  render: () => {
    return (
      <div style={{ display: 'flex', width: '100%', backgroundColor: 'white', flexDirection: 'row', gap: '8px', padding: '8px'}}>
        <div>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce a nunc posuere velit fermentum commodo et ut quam. Curabitur id maximus libero, ut pharetra felis.</div>
        <Divider direction='vertical' color='dark'/>
        <div>Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Cras consequat justo in erat ullamcorper, in dapibus nunc consectetur.</div>
      </div>
    )
  }
}
