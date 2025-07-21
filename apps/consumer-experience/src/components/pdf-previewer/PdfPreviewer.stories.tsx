import { Meta, StoryObj } from '@storybook/nextjs';

import PdfPreviewer from './PdfPreviewer';
import { UserProvider } from '../providers/UserProvider';

const meta: Meta<typeof PdfPreviewer> = {
  title: 'Components/PdfPreviewer',
  component: PdfPreviewer,
  decorators: (Story) => (
    <UserProvider user={undefined}>
      <div style={{
        height: '75vh',
        width: '75vw',
        placeItems: 'stretch'
      }}>

        <Story />
      </div>
    </UserProvider>
  ),
  parameters: {
    layout: 'centered',
    nextjs: {
      appDirectory: true
    }
  }
};

export default meta;

type Story = StoryObj<typeof meta>;
export const Default: Story = {
  args: {
    fileName: 'test.pdf',
    defaultRedirectUrl: '/sample-report.pdf',
    documentDownloadUrl: '/sample-report.pdf',
  }
};