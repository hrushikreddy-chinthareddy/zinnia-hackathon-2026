import type { StoryObj } from '@storybook/react';
import { default as PomStyles } from '../../styles/pom.module.css';
export const BaseStorybookLayout: StoryObj['decorators'] = Story => (
  <div id={PomStyles['producer-onboarding-maintenance']}>
    <Story />
  </div>
);

export default BaseStorybookLayout;
