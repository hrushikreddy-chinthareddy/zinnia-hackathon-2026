import { NextPageContext } from 'next';
import Error from 'next/error';

interface ErrorProps {
    statusCode: number;
}

const Page = ({ statusCode }: ErrorProps) => {
    return (
        <Error statusCode={statusCode}>
            {statusCode
                ? `An error ${statusCode} occurred on server`
                : 'An error occurred on client'}
        </Error>
    );
};

Page.getInitialProps = ({ res, err }: NextPageContext) => {
    const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
    return { statusCode };
};

export default Page;
