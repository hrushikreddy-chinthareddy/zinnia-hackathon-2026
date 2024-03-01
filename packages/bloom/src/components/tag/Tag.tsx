import styles from "./Tag.module.css";
import { TagProps, TagVariant } from "./types";

export const Tag: React.FC<TagProps> = ({
  text,
  isSelected = false,
  variant = TagVariant.Default,
}: TagProps) => {
  if (!text) {
    return null;
  }

  const variantClass = () => {
    switch (variant) {
      case TagVariant.White:
        return styles.white;
      case TagVariant.Information:
        return styles.information;
      default:
        return styles.default;
    }
  };

  return (
    <div className={`typography-labels-label-sm ${styles.tag} ${isSelected ? styles.selected : variantClass()}`}>
      <p>{text}</p>
    </div>
  );
};
