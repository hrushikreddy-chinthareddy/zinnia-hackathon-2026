'use client';

import { Icon, IconType } from '@zinnia/bloom/components';
import styles from './UserBadge.module.css';
import clsx from 'clsx';

const firstLetter = (val: string) => {
  if (!val) {
    return '';
  }

  return val.charAt(0).toUpperCase();
};

export const UserBadge = ({
  firstName,
  lastName,
}: {
  firstName?: string;
  lastName?: string;
}) => {
  const badgeClasses = clsx(
    styles.userBadge,
    'typography-content-body-sm-bold'
  );

  const inner =
    firstName && lastName ? (
      <span>{`${firstLetter(firstName)}${firstLetter(lastName)}`}</span>
    ) : (
      <Icon type={IconType.USER} width={20} height={20} />
    );

  return <span className={badgeClasses}>{inner}</span>;
};
