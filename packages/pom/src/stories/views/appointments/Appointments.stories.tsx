import type { Meta, StoryObj } from '@storybook/react';
import Appointments from '../../../views/licenses-appointments/appointments/Appointments';

const meta = {
  title: 'Views/Appointments',
  component: Appointments,
  parameters: {
    // More on how to position stories at: https://storybook.js.org/docs/configure/story-layout
    layout: 'padded',
  },
} satisfies Meta<typeof Appointments>;

export default meta;

type StoryType = StoryObj<typeof Appointments>;

export const Page: StoryType = {
  args: {},
};
