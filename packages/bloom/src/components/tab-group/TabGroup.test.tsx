import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';

import { TabGroup, TabTrigger } from './TabGroup';
import { createRef } from 'react';

describe('TabGroup Component', () => {
  it('renders without crashing', () => {
    render(<TabGroup />);
  });

  it('renders children', () => {
    render(
      <TabGroup>
        <div>Child Component</div>
      </TabGroup>
    );
    expect(screen.getByText('Child Component')).toBeInTheDocument();
  });

  it('forwards ref', () => {
    const ref = createRef<HTMLDivElement>();
    render(<TabGroup ref={ref} />);
    expect(ref.current).not.toBeNull();
  });
});

describe('TabTrigger Component', () => {
  it('Should throw an error if used outside of TabsContextProvider', () => {
    expect(() =>
      render(
        <TabTrigger value="test-value">
          <span>Test Children</span>
        </TabTrigger>
      )
    ).toThrow('useTabs must be used within a TabsContextProvider');
  });
});
