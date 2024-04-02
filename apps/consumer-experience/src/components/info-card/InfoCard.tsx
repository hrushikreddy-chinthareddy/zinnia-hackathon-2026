import { Icon, IconType } from '@zinnia/bloom/internal/components';
import { HTMLAttributes, ReactNode } from 'react';

import styles from './InfoCard.module.css';
import { ClickableCardContainer } from '../clickable-card-container/ClickableCardContainer';

interface InfoCardProps extends HTMLAttributes<HTMLDivElement> {
  iconType: IconType;
}

export const InfoCard = ({ iconType, children, className }: InfoCardProps) => {
  return (
    <ClickableCardContainer className={className}>
      <div className={styles.infoCard}>
        <div>
          <Icon type={iconType} />
        </div>
        <p className="typography-content-body-sm">{children}</p>
      </div>
    </ClickableCardContainer>
  );
};
