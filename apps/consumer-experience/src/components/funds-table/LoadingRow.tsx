import { TableRow, TableCell } from '@zinnia/bloom/components';

import { SkeletonLoader } from '../skeleton-loader/SkeletonLoader';

export const LoadingRow = ({ cellCount = 1 }: { cellCount?: number }) => {
  return (
    <TableRow>
      {Array.from({ length: cellCount }).map((_, index) => (
        <TableCell key={`loader-${index}`}>
          <SkeletonLoader width="100px" height="14px" />
        </TableCell>
      ))}
    </TableRow>
  );
};
