import React, { ReactElement } from 'react';

import PageNumbers from '@deps/components/pagination/page-numbers/page-numbers';
import Truncate from '@deps/components/pagination/truncate/truncate';

const calculateSmLimits = (
    currentPage: number,
    totalPages: number
): { smStart: number; smEnd: number } => {
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

const calculateMdLimits = (
    currentPage: number,
    totalPages: number
): { mdStart: number; mdEnd: number } => {
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

export const generatePageNumbers = (
    currentPage: number,
    totalPages: number,
    goToPage: (pageNumber: number) => void
): { sm: ReactElement[]; md: ReactElement[] } => {
    const mdPageElements: ReactElement[] = [];
    const smPageElements: ReactElement[] = [];

    // Logic ensures that on md/lg devices, only show ellipses if there are two pages btwn range and end page number
    // And show 3 pages on either side of active page when in mid range

    const { smStart, smEnd } = calculateSmLimits(currentPage, totalPages);
    const { mdStart, mdEnd } = calculateMdLimits(currentPage, totalPages);

    if (mdStart > 1) {
        mdPageElements.push(
            <PageNumbers
                key={1}
                pageNumber={1}
                currentPage={currentPage}
                onClick={() => {
                    goToPage(1);
                }}
            />
        );
        mdPageElements.push(<Truncate key="truncate-start" />);
    }

    if (smStart > 1) {
        smPageElements.push(
            <PageNumbers
                key={1}
                pageNumber={1}
                currentPage={currentPage}
                onClick={() => {
                    goToPage(1);
                }}
            />
        );
        smPageElements.push(<Truncate key="truncate-start" />);
    }

    for (let i = mdStart; i <= mdEnd; i++) {
        mdPageElements.push(
            <PageNumbers
                key={i}
                pageNumber={i}
                currentPage={currentPage}
                onClick={() => {
                    goToPage(i);
                }}
            />
        );
    }

    for (let i = smStart; i <= smEnd; i++) {
        smPageElements.push(
            <PageNumbers
                key={i}
                pageNumber={i}
                currentPage={currentPage}
                onClick={() => {
                    goToPage(i);
                }}
            />
        );
    }

    if (mdEnd < totalPages) {
        mdPageElements.push(<Truncate key="truncate-end" />);
        mdPageElements.push(
            <PageNumbers
                key={totalPages}
                pageNumber={totalPages}
                currentPage={currentPage}
                onClick={() => {
                    goToPage(totalPages);
                }}
            />
        );
    }

    if (smEnd < totalPages) {
        smPageElements.push(<Truncate key="truncate-end" />);
        smPageElements.push(
            <PageNumbers
                key={totalPages}
                pageNumber={totalPages}
                currentPage={currentPage}
                onClick={() => {
                    goToPage(totalPages);
                }}
            />
        );
    }

    return { sm: smPageElements, md: mdPageElements };
};
