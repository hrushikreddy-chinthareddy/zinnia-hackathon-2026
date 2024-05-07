import { Icon, IconType } from '../icon';
import { PaginationProps, calculateMdLimits, calculateSmLimits } from './utils';
import styles from './pagination.module.css';
import clsx from 'clsx';
import { useCallback, useMemo } from 'react';

export const Pagination = ({
  total,
  limit,
  offset,
  goToPage,
  ariaLabel,
}: PaginationProps) => {
  const currentPage = useMemo(
    () => Math.floor(offset / limit) + 1,
    [limit, offset]
  );
  const totalPages = useMemo(() => Math.ceil(total / limit), [limit, total]);
  const pageNumsStartZero = [...Array(totalPages).keys()];
  const { smStart, smEnd } = calculateSmLimits(currentPage, totalPages);
  const { mdStart, mdEnd } = calculateMdLimits(currentPage, totalPages);

  const goToPreviousPage = useCallback(() => {
    if (currentPage > 1) {
      goToPage(currentPage - 1);
    }
  }, [currentPage, goToPage]);

  const goToNextPage = useCallback(() => {
    if (currentPage < totalPages) {
      goToPage(currentPage + 1);
    }
  }, [currentPage, goToPage, totalPages]);

  return (
    <nav aria-label={ariaLabel || 'pagination'}>
      <ul className={styles.list}>
        <li
          className={clsx(styles.chevron, {
            [styles.inactive as string]: currentPage === 1,
          })}
          style={
            {
              '--small-order': 1,
              '--large-order': 1,
            } as React.CSSProperties
          }
        >
          <button
            tabIndex={currentPage === 1 ? -1 : 0}
            onClick={goToPreviousPage}
          >
            <Icon
              type={IconType.CHEVRON}
              width={20}
              height={20}
              className={clsx(styles.previous)}
            />
          </button>
        </li>
        <li
          className={styles.ellipsis}
          style={
            {
              '--small-order': smStart - 1,
              '--large-order': mdStart - 1,
              '--small-display': smStart === 1 ? 'none' : 'flex',
              '--large-display': mdStart === 1 ? 'none' : 'flex',
            } as React.CSSProperties
          }
        >
          <span>&#8230;</span>
        </li>
        <li
          className={styles.ellipsis}
          style={
            {
              '--small-order': smEnd + 1,
              '--large-order': mdEnd + 1,
              '--small-display': smEnd === totalPages ? 'none' : 'flex',
              '--large-display': mdEnd === totalPages ? 'none' : 'flex',
            } as React.CSSProperties
          }
        >
          <span>&#8230;</span>
        </li>
        {pageNumsStartZero.map(num => {
          const displayNum = num + 1;
          return (
            <li
              key={displayNum}
              style={
                {
                  '--small-order': displayNum,
                  '--large-order': displayNum,
                  '--small-display':
                    displayNum === 1 ||
                    displayNum === totalPages ||
                    (displayNum >= smStart && displayNum <= smEnd)
                      ? 'flex'
                      : 'none',
                  '--large-display':
                    displayNum === 1 ||
                    displayNum === totalPages ||
                    (displayNum >= mdStart && displayNum <= mdEnd)
                      ? 'flex'
                      : 'none',
                } as React.CSSProperties
              }
              className={clsx({
                [styles.selected as string]: displayNum === currentPage,
              })}
            >
              <button
                onClick={() => goToPage(displayNum)}
                tabIndex={currentPage === displayNum ? -1 : 0}
              >
                <span className={styles.hidden}>page </span>
                {displayNum}
              </button>
            </li>
          );
        })}
        <li
          className={clsx(styles.chevron, {
            [styles.inactive as string]: currentPage === totalPages,
          })}
          style={
            {
              '--small-order': totalPages,
              '--large-order': totalPages,
            } as React.CSSProperties
          }
        >
          <button
            tabIndex={currentPage === totalPages ? -1 : 0}
            onClick={goToNextPage}
          >
            <Icon
              type={IconType.CHEVRON}
              width={20}
              height={20}
              className={clsx(styles.next)}
            />
          </button>
        </li>
      </ul>
    </nav>
  );
};
