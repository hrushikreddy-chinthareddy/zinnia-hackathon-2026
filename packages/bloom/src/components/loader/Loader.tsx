import styles from "./Loader.module.css";
import { LoaderProps, LoaderVariant } from "./types";

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
    <span className={`${styles.loader} ${variantClass()}`}></span>
  );
};
