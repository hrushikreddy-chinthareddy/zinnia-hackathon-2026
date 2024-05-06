import clsx from 'clsx';
import styles from './Badge.module.css';
import { BadgeProps, BadgeVariant } from './types';

export const Badge = ({
  label,
  variant = BadgeVariant.DEFAULT,
}: BadgeProps) => {
  return <span className={clsx(styles.badge, styles[variant])}>{label}</span>;
};
