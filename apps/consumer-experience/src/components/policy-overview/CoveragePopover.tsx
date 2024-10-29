import styles from './PolicyOverview.module.css';
import { LabelPopover } from '../label-popover/LabelPopover';

const COVERAGE = 'Coverage';

export const CoveragePopover = () => {
  return (
    <LabelPopover title={COVERAGE}>
      <div className={styles.popoverContent}>
        <p>
          You’re insured for this amount. Your coverage amount may also be
          referred to as the "face amount," the amount of money stated in your
          insurance contract.
        </p>
      </div>
    </LabelPopover>
  );
};
