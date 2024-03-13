import styles from "./Tag.module.css";
import { TagProps, TagVariant } from "./types";

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
}: TagProps) => {
  if (!text) {
    return null;
  }

  return (
    <div className={`typography-labels-label-sm ${styles.tag} ${isSelected ? styles.selected : variantClass(variant)}`}>
      <p>{text}</p>
    </div>
  );
};
