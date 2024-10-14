import { useTranslation } from 'next-i18next';
import { useEffect, useState } from 'react';

import PaginationControls from '@deps/components/pagination/pagination';
import Typography, { TypographyVariant } from '@deps/components/typography/typography';

export default function DocumentResultsPagination(props: {
    goToPage: (pageNumber: number) => void;
    offset: number;
    total: number;
    limit: number;
    loading: boolean | null;
}) {
    const { t } = useTranslation();
    const [goToPage, setGoToPage] = useState(() => {
        return props.goToPage;
    });
    const [offset, setOffset] = useState(props.offset);
    const [limit, setLimit] = useState(props.limit);
    const [total, setTotal] = useState(props.total);
    const [loading, setLoading] = useState(props.loading);

    useEffect(() => {
        setGoToPage(() => {
            return props.goToPage;
        });
    }, [props.goToPage]);
    useEffect(() => {
        setOffset(props.offset);
    }, [props.offset]);
    useEffect(() => {
        setLimit(props.limit);
    }, [props.limit]);
    useEffect(() => {
        setTotal(props.total);
    }, [props.total]);
    useEffect(() => {
        setLoading(props.loading);
    }, [props.loading]);

    return (
        <>
            {!!total && (
                <div className="align-center mx-auto grid grid-cols-4 lg:grid-cols-12">
                    <div className="order-2 col-span-4 mt-8 flex items-center justify-center gap-1 pb-[120px] lg:order-1 lg:col-span-2 lg:mt-0 lg:justify-start lg:pb-0">
                        <Typography variant={TypographyVariant.BodySm} className="pb-1">
                            {t('policy.documents.xToYOfZ', { x: offset + 1, y: Math.min(offset + limit, total), z: total })}
                        </Typography>
                    </div>
                    {total > limit && (
                        <div className="order-1 col-span-4 lg:order-2 lg:col-span-8">
                            <PaginationControls goToPage={goToPage} limit={limit} offset={offset} total={total} />
                        </div>
                    )}
                </div>
            )}
            {!total && !loading && (
                <div>
                    <Typography variant={TypographyVariant.BodySm} className="pb-1">
                        {t('policy.documents.results', { total })}
                    </Typography>
                </div>
            )}
        </>
    );
}
