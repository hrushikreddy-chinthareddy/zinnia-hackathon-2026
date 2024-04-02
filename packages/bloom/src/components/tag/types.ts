import { HTMLAttributes } from 'react';

export enum TagVariant {
  Default = 'default',
  White = 'white',
  Information = 'information',
}

export interface TagProps extends HTMLAttributes<HTMLDivElement> {
  text: string;
  isSelected?: boolean;
  variant?: TagVariant;
}
