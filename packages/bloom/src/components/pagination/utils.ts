export interface PaginationProps 
  extends React.HTMLAttributes<HTMLDivElement> {
    limit: number;
    offset: number;
    total: number;
    goToPage: (pageNum: number) => void;
    ariaLabel?: string;
  }

export const calculateSmLimits = (currentPage: number, totalPages: number): { smStart: number; smEnd: number } => {
    let smStart = Math.max(currentPage - 1, 1);
    let smEnd = Math.min(currentPage + 1, totalPages);

    if (currentPage <= 3) {
        smStart = 1;
        smEnd = Math.min(4, totalPages); // Set the end value to 4
    } else if (currentPage >= totalPages - 2) {
        smStart = Math.max(totalPages - 3, 1);
        smEnd = totalPages;
    }

    if (currentPage === totalPages) {
        smStart = Math.max(totalPages - 3, 1);
        smEnd = totalPages;
    }

    return {
        smStart,
        smEnd,
    };
};

export const calculateMdLimits = (currentPage: number, totalPages: number): { mdStart: number; mdEnd: number } => {
    let mdStart = Math.max(currentPage - 3, 1);
    let mdEnd = Math.min(currentPage + 3, totalPages);

    if (currentPage <= 6) {
        mdStart = 1;
        mdEnd = Math.min(8, totalPages); // Set the mdEnd value to 8
    } else if (currentPage >= totalPages - 5) {
        mdStart = Math.max(totalPages - 7, 1);
        mdEnd = totalPages;
    }

    // Adjust mdStart and mdEnd indices when the currentPage is the final page
    if (currentPage === totalPages) {
        mdStart = Math.max(totalPages - 7, 1);
        mdEnd = totalPages;
    }

    return {
        mdStart,
        mdEnd,
    };
};
  