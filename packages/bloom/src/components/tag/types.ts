export enum TagVariant {
  Default = "default",
  White = "white",
  Information = "information",
}

export interface TagProps {
  text: string;
  isSelected?: boolean;
  variant?: TagVariant;
}
