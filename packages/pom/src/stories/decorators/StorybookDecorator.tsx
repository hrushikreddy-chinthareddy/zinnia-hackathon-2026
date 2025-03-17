import type { StoryObj } from '@storybook/react';
import { default as PomStyles } from '../../styles/pom.module.css';
import { MemoryRouter } from 'react-router';
export const BaseStorybookLayout: StoryObj['decorators'] = Story => (
  <MemoryRouter>
    <div id={PomStyles['producer-onboarding-maintenance']}>
      <Story />
    </div>
  </MemoryRouter>
);

export default BaseStorybookLayout;
