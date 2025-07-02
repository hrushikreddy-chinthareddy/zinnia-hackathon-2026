import clsx from 'clsx';
import { FC, HTMLAttributes, PropsWithChildren, ReactNode } from 'react';

import styles from './CardListHistory.module.css';

interface CardListProps extends PropsWithChildren {
  isPending?: boolean;
}

type CardListHistoryProps = FC<
  PropsWithChildren<HTMLAttributes<HTMLDivElement>>
> & {
  Header: ({ children }: { children: ReactNode }) => ReactNode;
  ListItems: ({ children, isPending }: CardListProps) => ReactNode;
};

const CardListHeader: FC<PropsWithChildren> = ({ children }) => {
  return <div className={styles.headerContainer}>{children}</div>;
};

const CardListItems = ({ children, isPending }: CardListProps) => {
  return (
    <ul
      className={clsx(styles.cardListContainer, {
        [styles.pending as string]: isPending,
      })}
    >
      {children}
    </ul>
  );
};

export const CardListHistory: CardListHistoryProps = ({
  // honestly idk how to fix this
  // eslint-disable-next-line react/prop-types
  children,
  ...restProps
}) => {
  return <div {...restProps}>{children}</div>;
};

CardListHistory.Header = CardListHeader;
CardListHistory.ListItems = CardListItems;
