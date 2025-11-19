import {
  Tag,
  TagVariant,
  Button,
  Icon,
  IconType,
} from '@zinnia/bloom/components';

import styles from './ComparisonField.module.css';
import { ComparisonFieldProps } from './types';

export const ComparisonField = ({
  header,
  subtext,
  isNew,
  onEdit,
}: ComparisonFieldProps) => {
  return (
    <div className={styles.comparisonFieldContainer}>
      <div className={styles.content}>
        {header && (
          <div className={styles.headerContainer}>
            <b>{header}</b>
            {onEdit && (
              <Button
                onClick={onEdit}
                mode="link"
                size="small"
                className={styles.editButton}
              >
                <Icon type={IconType.EDIT_ALT} small />
              </Button>
            )}
          </div>
        )}
        {subtext}
      </div>
      {isNew && (
        <Tag
          text="New"
          variant={TagVariant.Information}
          className={styles.newTag}
        />
      )}
    </div>
  );
};
