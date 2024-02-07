import '@testing-library/jest-dom';

import { render, screen } from '@testing-library/react';

import { Icon, IconType } from './Icon';

describe('Icon', () => {
  it('renders a title if alt text is passed', () => {
    render(<Icon type={IconType.CLOUD} alt="cloud icon" />);

    const iconText = screen.getByTitle('cloud icon');

    expect(iconText).toBeInTheDocument();
  });
});
