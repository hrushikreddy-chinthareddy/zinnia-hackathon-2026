import type { StoryObj } from '@storybook/react';
import { default as PomStyles } from '../../styles/pom.module.css';
import { MemoryRouter } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

export const BaseStorybookLayout: StoryObj['decorators'] = Story => (
  <QueryClientProvider client={queryClient}>
    <MemoryRouter>
      <div id={PomStyles['producer-onboarding-maintenance']}>
        <Story />
      </div>
    </MemoryRouter>
  </QueryClientProvider>
);

export default BaseStorybookLayout;
