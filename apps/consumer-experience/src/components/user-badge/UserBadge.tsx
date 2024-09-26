'use client';

import { CompanyName } from '@/types/carriers';
import styles from './UserBadge.module.css';
import clsx from 'clsx';
import Cookies from 'js-cookie';
import { THEME_COOKIE } from '@/utils/serverClientUtils';
import { useEffect, useState } from 'react';

const firstLetter = (val: string) => {
  if (!val) {
    return '';
  }

  return val.charAt(0).toUpperCase();
};

const themeColor = (theme?: CompanyName) => {
  // TODO: update these to use color variables
  switch (theme) {
    case CompanyName.EVERLY:
      return {
        backgroundColor: '#072041',
        color: '#fff',
      };
    case CompanyName.WELLABE:
      return {
        backgroundColor: '#EFC416',
        color: '#000',
      };
    default:
      return {
        backgroundColor: '#072041',
        color: '#fff',
      };
  }
};

export const UserBadge = ({
  firstName,
  lastName,
}: {
  firstName: string;
  lastName: string;
}) => {
  const [themeStyles, setThemeStyles] = useState(themeColor());

  useEffect(() => {
    const themeCookie = Cookies.get(THEME_COOKIE);

    setThemeStyles(themeColor(themeCookie as CompanyName));
  }, []);

  const badgeClasses = clsx(
    styles.userBadge,
    'typography-content-body-sm-bold'
  );

  return (
    <span className={badgeClasses} style={themeStyles}>
      <span>{`${firstLetter(firstName)}${firstLetter(lastName)}`}</span>
    </span>
  );
};
