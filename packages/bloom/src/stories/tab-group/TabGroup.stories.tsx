import { Meta, StoryObj } from '@storybook/react';

import {
  TabGroup,
  TabList,
  TabTrigger,
  TabContent,
  TabsProps,
} from '@/components/tab-group';
import { Icon, IconType } from '@/components';
import { cardStyles } from '@/components/card';

const meta: Meta<typeof TabGroup> = {
  title: 'Components/TabGroup',
  component: TabGroup,
  tags: ['autodocs'],
  args: {
    defaultValue: 'tab1',
    value: 'tab1',
    onValueChange: value => console.log(value),
    activationMode: 'manual',
    children: (
      <>
        <TabGroup defaultValue="tab1" activationMode="manual">
          <TabList>
            <TabTrigger value="tab1">
              <Icon type={IconType.DOCUMENT_TEXT} /> One
            </TabTrigger>
            <TabTrigger value="tab2">
              <Icon type={IconType.DOCUMENT_TEXT} /> Two
            </TabTrigger>
            <TabTrigger value="tab3">
              <Icon type={IconType.DOCUMENT_TEXT} /> Three
            </TabTrigger>
          </TabList>
          <TabContent value="tab1" className={cardStyles.card}>
            Content for tab 1
          </TabContent>
          <TabContent value="tab2" className={cardStyles.card}>
            Content for tab 2
          </TabContent>
          <TabContent value="tab3" className={cardStyles.card}>
            Content for tab 3
          </TabContent>
        </TabGroup>
      </>
    ),
  },
};

export default meta;
type StoryType = StoryObj<TabsProps>;

export const Default: StoryType = {};
