import { Meta, StoryObj } from '@storybook/react';
import { CaseInstanceSummary } from '@zinnia/api-types/types/case';

import { NotificationCenter } from './NotificationCenter';

const notifications: CaseInstanceSummary[] = [
  {
    id: '123251-55843',
    process: 'Payment failed',
    updatedAt: new Date().toDateString(),
    caseStatus: 'FAILED',
  },
  {
    id: '659989-32646',
    process: 'Tax documents available',
    updatedAt: new Date(2025, 0, 14).toDateString(),
    caseStatus: 'REVERSED',
  },
  {
    id: '659989-32647',
    process: 'Address removed',
    updatedAt: new Date(2025, 1, 14).toDateString(),
    caseStatus: 'COMPLETED',
  },
  {
    id: '659989-32648',
    process: 'Address added',
    updatedAt: new Date(2025, 0, 25).toDateString(),
    caseStatus: 'COMPLETED',
  },
  {
    id: '659989-32649',
    process: 'Premium processed',
    updatedAt: new Date(2025, 0, 14).toDateString(),
    caseStatus: 'COMPLETED',
  },
  {
    id: '659989-32650',
    process: 'Premium processed',
    updatedAt: new Date(2025, 0, 7).toDateString(),
    caseStatus: 'COMPLETED',
  },
];

const meta: Meta<typeof NotificationCenter> = {
  component: NotificationCenter,
  title: 'Components/NotificationCenter',
  tags: ['autodocs'],
  args: {
    initialNotifications: notifications,
  },
  parameters: {
    backgrounds: {
      default: 'subtle',
    },
  },
};

export default meta;

export const Default: StoryObj<typeof NotificationCenter> = {};

export const ActionNeeded: StoryObj<typeof NotificationCenter> = {
  args: {
    initialNotifications: notifications.map(notification => ({
      ...notification,
      caseStatus: 'IN_PROGRESS',
    })),
  },
};

export const Completed: StoryObj<typeof NotificationCenter> = {
  args: {
    initialNotifications: notifications.map(notification => ({
      ...notification,
      caseStatus: 'COMPLETED',
    })),
  },
};

export const noNotifications: StoryObj<typeof NotificationCenter> = {
  args: {
    initialNotifications: [],
  },
};
