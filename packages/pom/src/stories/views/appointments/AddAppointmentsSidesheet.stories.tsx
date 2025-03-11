import type { Meta, StoryObj } from '@storybook/react';
import { AddAppointmentSidesheet } from '../../../views/licenses-appointments/appointments/add/AddAppointmentSidesheet';
import { default as PomStyles } from '../../../styles/pom.module.css';
const meta = {
  title: 'Views/Appointments/Sidesheets/Add Appointments Sidesheet',
  component: AddAppointmentSidesheet,
  decorators: [
    Story => (
      <div id={PomStyles['producer-onboarding-maintenance']}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof AddAppointmentSidesheet>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
