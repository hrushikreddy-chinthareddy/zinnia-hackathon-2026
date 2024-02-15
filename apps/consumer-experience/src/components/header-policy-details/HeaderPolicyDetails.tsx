import clsx from 'clsx';

import styles from './HeaderPolicyDetails.module.css';

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  expanded?: boolean;
}

export const HeaderPolicyDetails = ({
  className,
  expanded = false,
  style,
}: Props) => {
  return (
    <div
      className={clsx(styles.container, { [`${className}`]: className })}
      style={style}
    >
      <p className="typography-labels-label-lg-alt">
        Everly Life - Universal Life
      </p>
      <div className={styles.policyDetails}>
        <p className="typography-labels-label-md-alt">Policy No. AU22029654</p>
        {expanded && (
          <>
            <p className="typography-labels-label-md-alt">
              Insured: Michael Williams
            </p>
            <p className="typography-labels-label-md-alt">
              Policy status:{' '}
              <span className="text-semantic-success">Active</span>
            </p>
          </>
        )}
      </div>
    </div>
  );
};
