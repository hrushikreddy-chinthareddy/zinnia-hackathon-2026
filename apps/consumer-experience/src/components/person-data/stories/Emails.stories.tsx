import { Meta, StoryObj } from '@storybook/react';

import { Emails } from '../Emails';
import { EmailProps, EmailType } from '../types';

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
        recordID: 1,
        emailType: EmailType.Personal,
        emailAddress: 'secben585+0502v1@gmail.com',
        endDate: null,
      },
      {
        recordID: 1,
        emailType: EmailType.Business,
        emailAddress: 'secben585+0502v1@gmail.com',
        endDate: null,
      },
      {
        recordID: 1,
        emailType: EmailType.Other,
        emailAddress: 'secben585+0502v1@gmail.com',
        endDate: null,
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
        recordID: 1,
        emailType: EmailType.Personal,
        emailAddress: 'secben585+0502v1@gmail.com',
        endDate: null,
      },
    ],
  },
};
