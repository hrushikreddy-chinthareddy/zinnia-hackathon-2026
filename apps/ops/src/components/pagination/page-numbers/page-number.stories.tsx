import { Meta } from '@storybook/react';

import PageNumber, { PageNumberProps } from './page-numbers';
import '@deps/styles/styles.css';

export default {
    title: 'Components/Pagination/PageNumbers',
    component: PageNumber,
} as Meta<typeof PageNumber>;

const PageNumberTemplate: React.VFC<PageNumberProps> = args => <PageNumber {...args} />;

export const CurrentPage = {
    ...PageNumberTemplate,
    args: {
        pageNumber: 1,
        currentPage: 1,
        // eslint-disable-next-line
        onClick: () => {},
    },
};

export const NotCurrentPage = {
    ...PageNumberTemplate,
    args: {
        pageNumber: 1,
        currentPage: 2,
        // eslint-disable-next-line
        onClick: () => {},
    },
};

export const CurrentPageDoubleDigit = {
    ...PageNumberTemplate,
    args: {
        pageNumber: 10,
        currentPage: 10,
        // eslint-disable-next-line
        onClick: () => {},
    },
};

export const NotCurrentPageDoubleDigit = {
    ...PageNumberTemplate,
    args: {
        pageNumber: 10,
        currentPage: 9,
        // eslint-disable-next-line
        onClick: () => {},
    },
};
