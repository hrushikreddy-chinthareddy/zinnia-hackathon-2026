export enum LoaderVariant {
  Default = "default",
  CTA = "cta",
}

export interface LoaderProps {
  hide?: boolean;
  variant?: LoaderVariant;
}
