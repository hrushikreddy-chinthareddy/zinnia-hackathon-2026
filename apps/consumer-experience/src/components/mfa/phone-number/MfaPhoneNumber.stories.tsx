import { Meta, StoryObj } from '@storybook/nextjs';

import { MfaPhoneNumber } from './MfaPhoneNumber';

/**
 * This formats the phone number the user used to enroll in MFA.
 *
 * It includes the PII wrapper so our analytics views will not see
 * any part of the phone number.
 */
const meta: Meta<typeof MfaPhoneNumber> = {
  title: 'Components/MfaPhoneNumber',
  component: MfaPhoneNumber,
  args: {
    phoneNumber: 'XXXXXX1234',
  },
};

export default meta;

export const Default: StoryObj<typeof MfaPhoneNumber> = {
  args: {},
};
