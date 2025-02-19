import type { Meta, StoryObj } from '@storybook/react';
import { AddAppointmentSidesheet } from '../../../views/licenses-appointments/appointments/add/AddAppointmentSidesheet';

const meta = {
  title: 'Views/Appointments/Add Appointments Sidesheet',
  component: AddAppointmentSidesheet,
} satisfies Meta<typeof AddAppointmentSidesheet>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
  decorators: [
    (Story) => (
      <div id="sidesheet-content">
        <Story />
      </div>
    ),
  ],
};
