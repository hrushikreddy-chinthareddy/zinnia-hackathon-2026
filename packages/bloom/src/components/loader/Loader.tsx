import styles from "./Loader.module.css";
import { LoaderProps, LoaderVariant } from "./types.js";

export const Loader: React.FC<LoaderProps> = ({
  hide = false,
  variant = LoaderVariant.Default
}: LoaderProps) => {
  if (hide) {
    return null;
  }

  const variantClass = () => {
    switch (variant) {
      case LoaderVariant.CTA:
        return styles.cta;
      default:
        return styles.default;
    }
  };

  return (
    <div className={`${styles.loader} ${variantClass()}`}></div>
  );
};
