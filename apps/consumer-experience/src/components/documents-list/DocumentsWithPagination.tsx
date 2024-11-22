'use client';

import { LineOfBusiness } from '@zinnia/api-types/types/sor';
import { Pagination } from '@zinnia/bloom/components';
import { useCallback, useMemo, useState } from 'react';

import {
  DocumentCategory,
  ExtendedDocumentMeta,
  TaxDocument,
} from '@/types/document';

import DocumentsList from './DocumentsList';
import styles from './documentsList.module.css';
import DocumentsListTax from './DocumentsListTax';

export default function DocumentsWithPagination({
  docCategory,
  documents,
  planCode,
  policyNumber,
  lineOfBusiness,
}: {
  docCategory: DocumentCategory;
  documents: ExtendedDocumentMeta[] | TaxDocument[];
  planCode: string;
  policyNumber: string;
  lineOfBusiness: LineOfBusiness;
}) {
  const limit = 10;
  const [offset, setOffset] = useState(0);
  const goToPage = useCallback(
    (pageNumber: number) => {
      window.scroll(0, 0);
      setOffset((pageNumber - 1) * limit);
    },
    [setOffset]
  );

  const paginatedDocs = useMemo(() => {
    return documents.slice(offset, offset + limit);
  }, [offset, limit, documents]);

  return (
    <>
      <div className={styles.documentsListContainer}>
        {docCategory === DocumentCategory.TAX && (
          <DocumentsListTax
            documents={paginatedDocs as TaxDocument[]}
            planCode={planCode}
            policyNumber={policyNumber}
            lineOfBusiness={lineOfBusiness}
          />
        )}

        {(docCategory === DocumentCategory.DOCUMENTS ||
          docCategory === DocumentCategory.STATEMENTS) && (
          <DocumentsList
            documents={paginatedDocs}
            planCode={planCode}
            policyNumber={policyNumber}
            lineOfBusiness={lineOfBusiness}
            docCategory={docCategory}
          />
        )}
      </div>
      {documents.length > limit && (
        <Pagination
          total={documents.length}
          offset={offset}
          limit={limit}
          goToPage={goToPage}
        />
      )}
    </>
  );
}
