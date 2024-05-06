import { HTMLAttributes } from 'react';

export enum AssistiveTextVariant {
  Default = 'default',
  Success = 'success',
  Info = 'info',
  Error = 'error',
}

export interface AssistiveTextProps extends HTMLAttributes<HTMLDivElement> {
  text: string;
  variant?: AssistiveTextVariant;
}
