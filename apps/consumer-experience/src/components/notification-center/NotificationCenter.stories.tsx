import { Meta, StoryObj } from '@storybook/react';

import { NotificationCenter, Notification } from './NotificationCenter';

const onClick = () => {};

const notifications: Notification[] = [
  {
    id: '123251-55843',
    title: 'Payment failed',
    date: new Date(),
    completed: false,
    link: {
      url: '#',
      label: 'Case ID 123251-55844',
    },
    priority: true,
    onClick,
  },
  {
    id: '659989-32646',
    title: 'Tax documents available',
    date: new Date(2025, 0, 14),
    completed: false,
    link: {
      url: '#',
      label: 'Case ID 123251-55843',
    },
    priority: false,
    onClick,
  },
  {
    id: '659989-32647',
    title: 'Address removed',
    date: new Date(),
    completed: true,
    link: {
      url: '#',
      label: 'More info',
    },
    priority: false,
    onClick,
  },
  {
    id: '659989-32648',
    title: 'Address added',
    date: new Date(2025, 0, 25),
    completed: true,
    link: {
      url: '#',
      label: 'More info',
    },
    priority: false,
    onClick,
  },
  {
    id: '659989-32649',
    title: 'Premium processed',
    date: new Date(2025, 0, 14),
    completed: true,
    link: {
      url: '#',
      label: 'More info',
    },
    priority: false,
    onClick,
  },
  {
    id: '659989-32650',
    title: 'Premium processed',
    date: new Date(2025, 0, 7),
    completed: true,
    link: {
      url: '#',
      label: 'More info',
    },
    priority: false,
    onClick,
  },
];

const meta: Meta<typeof NotificationCenter> = {
  component: NotificationCenter,
  title: 'Components/NotificationCenter',
  tags: ['autodocs'],
  args: {
    notifications: notifications,
  },
  parameters: {
    backgrounds: {
      default: 'subtle',
    },
  },
};

export default meta;

export const Default: StoryObj<typeof NotificationCenter> = {};

export const noNotifications: StoryObj<typeof NotificationCenter> = {
  args: {
    notifications: [],
  },
};
