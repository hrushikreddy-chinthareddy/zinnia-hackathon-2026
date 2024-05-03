export enum BadgeVariant {
  DEFAULT = 'default',
  WARNING = 'warning',
  SUCCESS = 'success',
  PENDING = 'pending',
  ERROR = 'error',
  INACTIVE = 'inactive',
  INFO = 'info',
}

export interface BadgeProps {
  label: string;
  variant: BadgeVariant;
}
