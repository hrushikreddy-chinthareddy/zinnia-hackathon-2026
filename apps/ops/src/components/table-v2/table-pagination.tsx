import Button, {
    ButtonSize,
    ButtonType,
    ButtonVariant,
} from '../button/button';

interface TablePaginationProps {
    total: number;
    currentPage: number;
    setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
    pageSize: number;
}

const TablePagination = ({
    total,
    currentPage,
    setCurrentPage,
    pageSize,
}: TablePaginationProps) => {
    const isOnFirstPage = currentPage === 1;
    const isOnLastPage = currentPage >= total / pageSize;

    const handlePagination = (page: number) => {
        if (!isOnFirstPage || !isOnLastPage) setCurrentPage(page);
    };

    return total > pageSize ? (
        <div className="flex items-center justify-end gap-1 bg-gray-50 py-2 pr-4 xs:mt-0">
            <span className="text-gray-700">
                Showing{' '}
                <span className="font-semibold text-gray-900">
                    {(currentPage - 1) * pageSize + 1}
                </span>{' '}
                to{' '}
                <span className="font-semibold text-gray-900">
                    {isOnLastPage
                        ? (currentPage - 1) * pageSize + (total % pageSize)
                        : (currentPage - 1) * pageSize + pageSize}
                </span>{' '}
                of <span className="font-semibold text-gray-900">{total}</span>{' '}
                Entries
            </span>
            <Button
                onClick={() => handlePagination(currentPage - 1)}
                size={ButtonSize.Small}
                type={ButtonType.Primary}
                disabled={isOnFirstPage}
                variant={
                    isOnFirstPage
                        ? ButtonVariant.Inactive
                        : ButtonVariant.Default
                }
            >
                Prev
            </Button>
            <Button
                onClick={() => handlePagination(currentPage + 1)}
                size={ButtonSize.Small}
                type={ButtonType.Primary}
                disabled={isOnLastPage}
                variant={
                    isOnLastPage
                        ? ButtonVariant.Inactive
                        : ButtonVariant.Default
                }
            >
                Next
            </Button>
        </div>
    ) : null;
};

export default TablePagination;
