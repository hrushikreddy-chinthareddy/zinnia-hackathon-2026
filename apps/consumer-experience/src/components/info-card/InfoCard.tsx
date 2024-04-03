import { Icon, IconType } from '@zinnia/bloom/internal/components';
import { HTMLAttributes } from 'react';

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
        <div className="typography-content-body-sm">{children}</div>
      </div>
    </ClickableCardContainer>
  );
};
