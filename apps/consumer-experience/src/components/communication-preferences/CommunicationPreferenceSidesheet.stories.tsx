import { Meta, StoryObj } from '@storybook/nextjs';

import { PolicyProfile } from '@/types/policy';
import { Country, EmailType, State } from '@zinnia/api-types/types/sor';

import { CommunicationPreferenceSidesheet } from './CommunicationPreferenceSidesheet';

const mockPolicyProfile = {
  addresses: [
    {
      addressId: '1',
      addressLine1: '123 Main St',
      city: 'Anytown',
      state: State.CA,
      zipCode: '12345',
      country: Country.US,
      isPreferred: true,
    },
  ],
  emails: [
    {
      emailId: '1',
      emailAddress: 'test@test.com',
      emailType: EmailType.PERSONAL,
    },
    {
      emailId: '2',
      emailAddress: 'test2@test.com',
      emailType: EmailType.BUSINESS,
    },
  ],
};

const meta: Meta<typeof CommunicationPreferenceSidesheet> = {
  component: CommunicationPreferenceSidesheet,
  title:
    'Components/Communication Preferences/CommunicationPreferenceSidesheet',
  parameters: {
    nextjs: {
      appDirectory: true,
      navigation: {
        segments: [
          ['policy', 'TEST-POLICY'],
          ['plan', 'TEST-PLAN'],
        ],
      },
    },
  },
  decorators: [
    Story => {
      return (
        <div
          style={{
            backgroundColor: 'white',
            padding: '1rem',
            borderRadius: '0.25rem',
          }}
        >
          <Story />
        </div>
      );
    },
  ],
  args: {
    profileData: mockPolicyProfile as PolicyProfile,
  },
};

export default meta;
type StoryType = StoryObj<typeof meta>;

export const Default: StoryType = {};
