export enum BannerVariant {
  Default = 'default',
  Error = 'error',
  Information = 'information',
  Success = 'success',
  Warning = 'warning',
}

export interface BannerAlertProps {
  bodyText: string;
  cta?: {
    href: string;
    text: string;
  };
  variant?: BannerVariant;
  canDismiss?: boolean;
  dismissLabel?: string;
  onDismiss?: () => void;
}
