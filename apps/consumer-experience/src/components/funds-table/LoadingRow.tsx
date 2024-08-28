import { TableCell, TableRow } from '@zinnia/bloom/components';

import { SkeletonLoader } from '../skeleton-loader/SkeletonLoader';
export const LoadingRow = () => {
  return (
    <TableRow>
      <TableCell>
        <SkeletonLoader width="100px" height="14px" />
      </TableCell>
      <TableCell>
        <SkeletonLoader width="100px" height="14px" />
      </TableCell>

      <TableCell>
        <SkeletonLoader width="100px" height="14px" />
      </TableCell>
      <TableCell>
        <SkeletonLoader width="100px" height="14px" />
      </TableCell>
    </TableRow>
  );
};
