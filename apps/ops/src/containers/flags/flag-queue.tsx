import { Table, TableBody, Pagination } from '@zinnia/bloom/components';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { TranslationFiles } from '@deps/config/translations';

import FlagQueueTableHeader from './flag-queue-header';
import FlagQueueTableRow from './flag-queue-table-row';

const ROWS_PER_PAGE = 20;

const FlagQueue = ({ featureFlagDecisions }: any) => {
    const allKeys = Object.keys(featureFlagDecisions);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    const filteredKeys = allKeys.filter((key) =>
        key.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const startIndex = (currentPage - 1) * ROWS_PER_PAGE;
    const paginatedKeys = filteredKeys.slice(
        startIndex,
        startIndex + ROWS_PER_PAGE
    );
    const totalPages = Math.ceil(filteredKeys.length / ROWS_PER_PAGE);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
        setCurrentPage(1);
    };
    const { t } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: 'feature',
    });

    return (
        <div className="my-1">
            <div className="mb-4">
                <input
                    placeholder={t('flagQueueSearchPlaceholder') as string}
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className="w-[200px] p-2 border rounded"
                />
            </div>

            <Table>
                <FlagQueueTableHeader />
                <TableBody>
                    {paginatedKeys.map((key, index) => (
                        <FlagQueueTableRow
                            key={`${key}-${index}`}
                            featureFlag={key}
                        />
                    ))}
                </TableBody>
            </Table>

            {totalPages > 1 && (
                <Pagination
                    total={filteredKeys.length}
                    limit={ROWS_PER_PAGE}
                    offset={startIndex}
                    goToPage={(page: number) => setCurrentPage(page)}
                />
            )}
        </div>
    );
};

export default FlagQueue;
