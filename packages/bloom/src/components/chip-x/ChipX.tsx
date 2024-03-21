import { Icon, IconType } from "../icon";

import styles from "./ChipX.module.css";
import { ChipXProps } from "./types";

export const ChipX = ({ ariaLabel, label, onDelete }: ChipXProps) => {
  return (
    <div className={styles.chipX}>
      <div className="typography-buttons-button-sm">{label}</div>
      <button
        aria-label={ariaLabel}
        className={styles.button}
        onClick={onDelete}
      >
        <Icon height={18} type={IconType.CLOSE} width={18} />
      </button>
    </div>
  );
};
