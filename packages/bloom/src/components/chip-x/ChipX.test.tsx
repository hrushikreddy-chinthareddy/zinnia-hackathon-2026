import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';

import { ChipX } from './ChipX';

describe('ChipX component', () => {
  it('the entire chip renders', () => {
    render(<ChipX label='Chip'/>)
  })

  it('renders label correctly', () => {
    render(<ChipX ariaLabel="delete" label="Test Label" onDelete={() => {}} />);
    expect(screen.getByText('Test Label')).toBeInTheDocument();
  });

  it('calls onDelete function on button click', () => {
    const onDeleteMock = vi.fn();
    const { getByRole } = render(<ChipX ariaLabel="delete" label="Test Label" onDelete={onDeleteMock} />);
    fireEvent.click(getByRole('button'));
    expect(onDeleteMock).toHaveBeenCalled();
  });

  it('aria label works', () => {
    render(<ChipX ariaLabel="This is a chip" label="Test Label" onDelete={() => {}} />);
    expect(screen.getByLabelText('This is a chip')).toBeInTheDocument();
  })
});