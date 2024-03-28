import { FC, HTMLAttributes, PropsWithChildren, ReactNode } from 'react';

import styles from './CardListHistory.module.css';

type CardListHistoryProps = FC<
  PropsWithChildren<HTMLAttributes<HTMLDivElement>>
> & {
  Header: ({ children }: { children: ReactNode }) => ReactNode;
  ListItems: ({ children }: { children: ReactNode }) => ReactNode;
};

const CardListHeader: FC<PropsWithChildren> = ({ children }) => {
  return <div className={styles.headerContainer}>{children}</div>;
};

const CardListItems: FC<PropsWithChildren> = ({ children }) => {
  return <ul className={styles.cardListContainer}>{children}</ul>;
};

export const CardListHistory: CardListHistoryProps = ({
  children,
  ...restProps
}) => {
  return <div {...restProps}>{children}</div>;
};

CardListHistory.Header = CardListHeader;
CardListHistory.ListItems = CardListItems;
