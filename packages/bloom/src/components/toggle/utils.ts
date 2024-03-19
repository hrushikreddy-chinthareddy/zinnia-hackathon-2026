export interface ToggleProps
  extends React.HTMLAttributes<HTMLButtonElement> {
    text?: string;
    isDisabled?: boolean;
    onClick?: () => void;
    pressed?: boolean;
    labelId?: string;
  }