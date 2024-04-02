import clsx from 'clsx';
import styles from './Tag.module.css';
import { TagProps, TagVariant } from './types';

const variantClass = (variant: TagVariant) => {
  switch (variant) {
    case TagVariant.White:
      return styles.white;
    case TagVariant.Information:
      return styles.information;
    default:
      return '';
  }
};

export const Tag = ({
  text,
  isSelected = false,
  variant = TagVariant.Default,
  className,
}: TagProps) => {
  if (!text) {
    return null;
  }

  return (
    <div
      className={clsx(
        styles.tag,
        isSelected ? styles.selected : variantClass(variant),
        className
      )}
    >
      <p>{text}</p>
    </div>
  );
};
