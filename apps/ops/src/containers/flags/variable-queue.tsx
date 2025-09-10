import { Table, TableBody, Pagination } from '@zinnia/bloom/components';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { TranslationFiles } from '@deps/config/translations';

import VariableQueueTableHeader from './variable-queue-header';
import VariableQueueTableRow from './variable-queue-table-row';

const ROWS_PER_PAGE = 20;

const VariableQueue = ({
    featureFlagVariables,
}: {
    featureFlagVariables: {
        [key: string]: {
            enabled: boolean;
            variables: any;
        };
    };
}) => {
    const allKeys = Object.keys(featureFlagVariables);
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
                    placeholder={t('variableSearchPlaceholder') as string}
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className="w-[200px] p-2 border rounded"
                />
            </div>

            <Table>
                <VariableQueueTableHeader />
                <TableBody>
                    {paginatedKeys.map((key: string, index: number) => (
                        <VariableQueueTableRow
                            key={`${key}-${index}`}
                            featureVariable={key}
                            featureVariableObject={featureFlagVariables[key]}
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

export default VariableQueue;
