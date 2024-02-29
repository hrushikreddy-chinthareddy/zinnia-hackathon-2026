import styles from './allocationColorBar.module.css';
import {
  AllocationColorBarProps,
  primaryColorOrder,
  contingentColorOrder,
} from './utils';

export const AllocationColorBar = ({
  type,
  allocations,
}: AllocationColorBarProps) => {
  if (!allocations) {
    return null;
  }

  const colorArray =
    type === 'contingent' ? contingentColorOrder : primaryColorOrder;

  // TODO: what should happen if the values dont equal 100? is that possible?
  return (
    <div className={styles.container} aria-hidden>
      {allocations?.map((allocation, index) => (
        <span
          style={{
            display: 'inline-block',
            // Subtract margin size from allocation, so bar remains on one line
            width: `calc(${allocation}% - var(--measure-dimension-z-space-0, 0.125rem))`,
            height: '100%',
            backgroundColor: colorArray[index],
          }}
        ></span>
      ))}
    </div>
  );
};
