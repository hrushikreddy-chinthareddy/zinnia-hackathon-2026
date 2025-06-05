import { Meta, StoryObj } from '@storybook/react';
import { EmailType } from '@zinnia/api-types/types/sor';

import { Emails } from '../Emails';
import { EmailProps } from '../types';

const meta: Meta<typeof Emails> = {
  component: Emails,
  title: 'Components/PersonData/Emails',
  decorators: [
    Story => (
      <div
        style={{
          backgroundColor: 'white',
          padding: '1rem',
          borderRadius: '0.25rem',
        }}
      >
        <Story />
      </div>
    ),
  ],
  args: {
    emails: [
      {
        emailId: '1',
        emailType: EmailType.PERSONAL,
        emailAddress: 'secben585+0502v1@gmail.com',
        // endDate: null,
      },
      {
        emailId: '1',
        emailType: EmailType.BUSINESS,
        emailAddress: 'secben585+0502v1@gmail.com',
        // endDate: null,
      },
      {
        emailId: '1',
        emailType: EmailType.OTHER,
        emailAddress: 'secben585+0502v1@gmail.com',
        // endDate: null,
      },
    ],
    title: 'Email',
  },
  tags: ['autodocs'],
};

export default meta;
type StoryType = StoryObj<EmailProps>;

export const Default: StoryType = {};

export const Single: StoryType = {
  args: {
    emails: [
      {
        emailId: '1',
        emailType: EmailType.PERSONAL,
        emailAddress: 'secben585+0502v1@gmail.com',
        // endDate: null,
      },
    ],
  },
};
