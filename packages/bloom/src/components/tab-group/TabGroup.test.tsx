import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';

import { TabTrigger } from './TabGroup';

describe('Card Columns Component', () => {
  it('TabTrigger renders children correctly', () => {
    render(
      <TabTrigger value="test-value">
        <span>Test Children</span>
      </TabTrigger>
    );
    expect(screen.getByText('Test Children')).toBeInTheDocument();
  });
});

// test('TabTrigger applies correct className', () => {
//   const { container } = render(
//     <TabTrigger value="test-value">
//       <span>Test Children</span>
//     </TabTrigger>
//   );
//   expect(container.firstChild).toHaveClass('tabItem');
// });

// test('TabTrigger sets ref based on comparison', () => {
//   const tabContext = {
//     selectedTab: 'test-value',
//     selectedTabRef: { current: null },
//   };
//   const { container } = render(<TabTrigger value="test-value" />, {
//     wrapper: ({ children }) => <div>{children}</div>,
//   });
//   const triggerElement = container.firstChild;
//   expect(triggerElement).toHaveProperty('ref', tabContext.selectedTabRef);
// });
