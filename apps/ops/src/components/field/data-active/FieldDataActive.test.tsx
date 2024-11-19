import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { Label } from '@zinnia/bloom/components';

import { FieldDataActive } from './FieldDataActive';
import { FieldDataActiveTestIds, FieldStatus } from '../types';

const firstName = 'First Name';
const errorMessage = 'This field is required';

const label = <Label>label</Label>;

describe('<FieldDataActive />', () => {
  it('should render the label correctly', () => {
    render(<FieldDataActive label={label} name={firstName} />);
  });

  it('should not render the error message when one is not provided', async () => {
    render(
      <FieldDataActive
        label={label}
        name={firstName}
        fieldStatus={FieldStatus.ERROR}
      />
    );

    expect(screen.queryByText(FieldDataActiveTestIds.ERROR_MESSAGE)).toBeNull();
  });

  it('should render the error message when there is an error', async () => {
    render(
      <FieldDataActive
        label={label}
        name={firstName}
        errorMessage={errorMessage}
        fieldStatus={FieldStatus.ERROR}
      />
    );

    const error = await screen.getByTestId(
      FieldDataActiveTestIds.ERROR_MESSAGE
    );
    expect(error).toBeInTheDocument();
  });

  it('should render the input with the correct border color when there is no error', () => {
    render(<FieldDataActive label={label} name={firstName} />);
    expect(
      screen.getByTestId(FieldDataActiveTestIds.LABEL)
    ).toBeInTheDocument();
    expect(screen.getByTestId(FieldDataActiveTestIds.INPUT)).not.toHaveClass(
      'fieldError'
    );
  });
});
