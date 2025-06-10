import { Meta, StoryObj } from '@storybook/nextjs';
import { Button } from '@zinnia/bloom/components';

import { NotificationCenterSidesheet } from './NotificatonCenterSidesheet';

const meta: Meta<typeof NotificationCenterSidesheet> = {
  component: NotificationCenterSidesheet,
  title: 'Components/NotificationCenter/Sidesheet',
  tags: ['autodocs'],
};

export default meta;

export const Default: StoryObj<typeof NotificationCenterSidesheet> = {
  args: {
    children: <Button mode="link">More info</Button>,
    title: 'Case Details',
    caseId: '123456',
    fields: [
      {
        label: 'Case ID',
        value: '123456',
      },
      {
        label: 'Case Status',
        value: 'Pending',
      },
      {
        label: 'Completion Date',
        value: '01/01/2023',
      },
    ],
  },
};
