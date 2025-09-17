import { ClientDetailsDto } from '@xd/api-types/dist/generated-types/knowledgebase';
import { formatDateTime } from '@xd/utils/src/dates';
import {
  Pagination, Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
  Loader,
  Icon,
  IconType
} from '@zinnia/bloom/components';
import React, { useEffect, useState, useMemo, ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';

import Field from '@deps/components/fields/field';
import Typography, {
  TypographyVariant,
} from '@deps/components/typography/typography';
import { TranslationFiles } from '@deps/config/translations';
import { getAllClientDetails } from '@deps/queries/api/knowledge-base';
import { SortDirection } from '@deps/types/knowledge-base';
import { browserLogError } from '@deps/utils/browser-logging';

const PAGE_SIZE = 10;

enum SortFields {
  CREATED = 'created',
  UPDATED = 'updated',
}

type SortConfig = {
  field: SortFields;
  direction: SortDirection;
} | null;

const TenantsTab = () => {
  const { t } = useTranslation(TranslationFiles.COMMON, {
    keyPrefix: 'zinniaAiAssistant'
  });
  const [tenantDetails, setTenants] = useState<ClientDetailsDto[]>([]);
  const [sortConfig, setSortConfig] = useState<SortConfig>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);

  const fetchTenants = async () => {
    setLoading(true);
    try {
      const data = await getAllClientDetails();
      if (!data) {
        throw new Error('No client data returned');
      }
      setTenants(data ?? []);
    } catch (err) {
      browserLogError(
        err instanceof Error
          ? err.message
          : 'Unexpected error while loading tenant data.'
      );
      setTenants([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenants();
  }, []);

  useEffect(() => {
    setPage(0);
  }, [searchTerm]);

  const handleGoToPage = (nextPage: number) => {
    setPage(nextPage - 1);
    return nextPage - 1;
  };

  const toggleSort = (field: SortFields) => {
    setSortConfig((prev) => {
      if (prev?.field === field) {
        return {
          field,
          direction: prev.direction === SortDirection.Asc ? SortDirection.Desc : SortDirection.Asc,
        } as SortConfig;
      }
      return { field, direction: SortDirection.Asc } as SortConfig;
    });
  };

  const filteredTenants = useMemo(() => {
    if (!searchTerm.trim()) return tenantDetails;
    const term = searchTerm.toLowerCase();
    return tenantDetails.filter(({ client }) =>
      client?.acronym?.toLowerCase().includes(term)
    );
  }, [tenantDetails, searchTerm]);

  const sortedTenants = useMemo(() => {
    if (!sortConfig) return filteredTenants;
    const { field, direction } = sortConfig;
    return [...filteredTenants].sort((a, b) => {
      const dateA = new Date(
        field === SortFields.CREATED
          ? (a.client?.createdDateTime ?? 0)
          : (a.client?.lastModifiedDateTime ?? 0)
      ).getTime();
      const dateB = new Date(
        field === SortFields.CREATED
          ? (b.client?.createdDateTime ?? 0)
          : (b.client?.lastModifiedDateTime ?? 0)
      ).getTime();
      return direction === SortDirection.Asc ? dateA - dateB : dateB - dateA;
    });
  }, [filteredTenants, sortConfig]);

  const start = page * PAGE_SIZE;
  const paginatedTenants = sortedTenants.slice(start, start + PAGE_SIZE);

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
          {t('admin.tenants.header')}
        </Typography>
        <div className="flex gap-4">
          <Field
            placeholder={
              t('admin.tenants.search') || ''
            }
            value={searchTerm}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setSearchTerm(e.target.value)
            }
            startIcon={
              <Icon type={IconType.SEARCH} className="mr-1" />
            }
            className="py-1"
            onClear={() => setSearchTerm('')}
            isClearable
          />
        </div>
      </div>
      {paginatedTenants.length > 0 ? (
        <div>
          <Table>
            <React.Fragment key=".0">
              <TableHeader>
                <TableRow>
                  <TableHeaderCell
                    sortable={true}
                    className="typography-content-body-sm-bold"
                  >
                    {t('admin.tenants.tenantId')}
                  </TableHeaderCell>
                  <TableHeaderCell
                    sortable={true}
                    onClick={() => toggleSort(SortFields.CREATED)}
                    className="typography-content-body-sm-bold"
                  >
                    {t('admin.tenants.createdDate')}
                  </TableHeaderCell>
                  <TableHeaderCell
                    sortable={true}
                    onClick={() => toggleSort(SortFields.UPDATED)}
                    className="typography-content-body-sm-bold"
                  >
                    {t('admin.tenants.updatedDate')}
                  </TableHeaderCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedTenants?.map((tenant) => {
                  return (
                    <TableRow key={tenant?.client?.acronym}>
                      <TableCell className="typography-content-body-sm">
                        {tenant?.client?.acronym}
                      </TableCell>
                      <TableCell className="typography-content-body-sm" data-testid="tenant-created-date">
                        {formatDateTime(
                          tenant?.client?.createdDateTime || ''
                        )}
                      </TableCell>
                      <TableCell className="typography-content-body-sm" data-testid="tenant-updated-date">
                        {formatDateTime(
                          tenant?.client?.lastModifiedDateTime || ''
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
              total={sortedTenants.length}
              goToPage={handleGoToPage}
            />
          </div>
        </div>
      ) : (
        <Typography
          variant={TypographyVariant.H3}
          className="text-gray-500"
        >
          {t('admin.tenants.noTenantsFound')}
        </Typography>
      )}
    </div>
  );
};

export default TenantsTab;