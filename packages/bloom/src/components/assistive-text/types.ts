export enum AssistiveTextVariant {
  Default = "default",
  Success = "success",
  Info = "info",
  Error = "error",
}

export interface AssistiveTextProps {
  text: string;
  variant?: AssistiveTextVariant;
}
