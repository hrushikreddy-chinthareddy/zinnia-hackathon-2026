import { UserResponse } from '@xd/api-types/dist/generated-types/knowledgebase';
import { formatDateTime } from '@xd/utils/src/dates';
import {
    Pagination,
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableHeaderCell,
    TableRow,
    Loader,
    Icon,
    IconType,
} from '@zinnia/bloom/components';
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import Field from '@deps/components/fields/field';
import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import { TranslationFiles } from '@deps/config/translations';
import {
    getAllUserDetails,
    searchUser,
} from '@deps/queries/api/knowledge-base';
import { SortBy, SortDirection, SortFields } from '@deps/types/knowledge-base';
import { browserLogError } from '@deps/utils/browser-logging';

const PAGE_SIZE = 10;
const MIN_SEARCH_TERM_LENGTH = 3;

interface SortConfig {
    field: SortFields;
    direction: SortDirection;
}

const SystemUsersTab = () => {
    const { t } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: 'zinniaAiAssistant',
    });
    const [users, setUsers] = useState<UserResponse[]>([]);
    const [page, setPage] = useState(0);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState<SortConfig>({
        field: SortFields.Created,
        direction: SortDirection.Desc,
    });

    const fetchUsers = useCallback(
        async (searchTerm: string) => {
            setLoading(true);
            try {
                if (searchTerm.length >= MIN_SEARCH_TERM_LENGTH) {
                    const allMatches = await searchUser(searchTerm);
                    if (allMatches) {
                        const start = page * PAGE_SIZE;
                        const end = start + PAGE_SIZE;
                        const pagedUsers = allMatches.slice(start, end);
                        setUsers(pagedUsers);
                        setTotal(allMatches.length);
                    } else {
                        browserLogError('No search results returned');
                    }
                } else if (searchTerm.length === 0) {
                    const resp = await getAllUserDetails(
                        page,
                        PAGE_SIZE,
                        sortConfig.field === SortFields.Created
                            ? SortBy.CreatedAt
                            : SortBy.UpdatedAt,
                        sortConfig.direction === SortDirection.Asc
                            ? SortDirection.Asc
                            : SortDirection.Desc
                    );
                    if (resp) {
                        setUsers(resp.content);
                        setTotal(resp.totalElements);
                    } else {
                        browserLogError('No user data returned');
                    }
                }
            } catch (err) {
                browserLogError(
                    err instanceof Error
                        ? err.message
                        : 'Unknown error while fetching users'
                );
                setUsers([]);
                setTotal(0);
            } finally {
                setLoading(false);
            }
        },
        [page, sortConfig]
    );

    useEffect(() => {
        const handler = setTimeout(() => {
            setPage(0);
            fetchUsers(searchTerm);
        }, 300);
        return () => clearTimeout(handler);
    }, [searchTerm, fetchUsers]);

    const toggleSort = (field: SortFields) => {
        setSortConfig((prev) => {
            if (prev.field === field) {
                return {
                    field,
                    direction:
                        prev.direction === SortDirection.Asc
                            ? SortDirection.Desc
                            : SortDirection.Asc,
                };
            }
            return { field, direction: SortDirection.Asc };
        });
    };

    const sortedUsers = useMemo(() => {
        if (sortConfig.field === SortFields.Name) {
            const data = [...users];
            data.sort((a, b) => {
                const cmp = (a?.name || '').localeCompare(b?.name || '');
                return sortConfig.direction === SortDirection.Asc ? cmp : -cmp;
            });
            return data;
        }
        return users;
    }, [users, sortConfig]);

    const handleGoToPage = (nextPage: number) => {
        setPage(nextPage - 1);
        return nextPage - 1;
    };

    const handleSearchChange = (value: string) => {
        setSearchTerm(value);
        setPage(0);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader />
            </div>
        );
    }

    return (
        <div>
            <div className="flex justify-between pb-8">
                <Typography variant={TypographyVariant.H2} className="pl-4">
                    {t('admin.users.header')}
                </Typography>
                <div className="flex gap-4">
                    <Field
                        placeholder={t('admin.users.search') || ''}
                        value={searchTerm}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        startIcon={
                            <Icon type={IconType.SEARCH} className="mr-1" />
                        }
                        className="py-1"
                        onClear={() => setSearchTerm('')}
                        isClearable
                    />
                </div>
            </div>
            {sortedUsers.length > 0 ? (
                <div>
                    <Table>
                        <React.Fragment key=".0">
                            <TableHeader>
                                <TableRow>
                                    <TableHeaderCell
                                        sortable={true}
                                        onClick={() =>
                                            toggleSort(SortFields.Name)
                                        }
                                        className="typography-content-body-sm-bold"
                                    >
                                        {t('admin.users.name')}
                                    </TableHeaderCell>
                                    <TableHeaderCell
                                        sortable={true}
                                        className="typography-content-body-sm-bold"
                                    >
                                        {t('admin.users.email')}
                                    </TableHeaderCell>
                                    <TableHeaderCell
                                        sortable={true}
                                        className="typography-content-body-sm-bold"
                                    >
                                        {t('admin.users.role')}
                                    </TableHeaderCell>
                                    <TableHeaderCell
                                        sortable={true}
                                        onClick={() =>
                                            toggleSort(SortFields.Created)
                                        }
                                        className="typography-content-body-sm-bold"
                                    >
                                        {t('admin.users.createdDate')}
                                    </TableHeaderCell>
                                    <TableHeaderCell
                                        sortable={true}
                                        onClick={() =>
                                            toggleSort(SortFields.Updated)
                                        }
                                        className="typography-content-body-sm-bold"
                                    >
                                        {t('admin.users.updatedDate')}
                                    </TableHeaderCell>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {sortedUsers.map((user) => {
                                    return (
                                        <TableRow key={user.email}>
                                            <TableCell
                                                className="typography-content-body-sm"
                                                data-testid="system-user-name"
                                            >
                                                {user.name}
                                            </TableCell>
                                            <TableCell className="typography-content-body-sm">
                                                {user.email}
                                            </TableCell>
                                            <TableCell className="typography-content-body-sm">
                                                {user.role}
                                            </TableCell>
                                            <TableCell
                                                className="typography-content-body-sm"
                                                data-testid="system-user-created-date"
                                            >
                                                {formatDateTime(
                                                    user?.createdAt || ''
                                                )}
                                            </TableCell>
                                            <TableCell
                                                className="typography-content-body-sm"
                                                data-testid="system-user-updated-date"
                                            >
                                                {formatDateTime(
                                                    user?.updatedAt || ''
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </React.Fragment>
                    </Table>
                    <div className="pt-4">
                        <Pagination
                            limit={PAGE_SIZE}
                            offset={page * PAGE_SIZE}
                            total={total}
                            goToPage={handleGoToPage}
                        />
                    </div>
                </div>
            ) : (
                <Typography
                    variant={TypographyVariant.H3}
                    className="text-gray-500"
                >
                    {t('admin.users.noUsersFound')}
                </Typography>
            )}
        </div>
    );
};

export default SystemUsersTab;
