'use client';

import { useQuery } from '@tanstack/react-query';
import { Pagination } from '@zinnia/bloom/components';
import { useCallback, useMemo, useState } from 'react';

import { useFeatureFlags } from '@/hooks/use-feature-flags';
import { getCarrierConfig } from '@/queries/carrier-config-queries';
import { QueryKeys } from '@/queries/query-keys';
import { DocumentsVersion } from '@/types/carrier-config';
import {
  DocumentCategory,
  DocumentV3SearchItem,
  ExtendedDocumentMeta,
  TaxDocument,
} from '@/types/document';
import { FEATURE_FLAGS } from '@/utils/optimizely/flags';
import { LineOfBusiness } from '@zinnia/api-types/types/sor';

import DocumentsList from './DocumentsList';
import styles from './documentsList.module.css';
import DocumentsListTax from './DocumentsListTax';

export default function DocumentsWithPagination({
  docCategory,
  documents,
  planCode,
  policyNumber,
  lineOfBusiness,
  carrierId,
}: {
  docCategory: DocumentCategory;
  documents: ExtendedDocumentMeta[] | TaxDocument[] | DocumentV3SearchItem[];
  planCode: string;
  policyNumber: string;
  lineOfBusiness: LineOfBusiness;
  carrierId: string;
}) {
  const { data: featureFlags } = useFeatureFlags();

  const { data: documentsVersion } = useQuery({
    queryKey: [QueryKeys.CARRIER_CONFIG],
    queryFn: () => getCarrierConfig(),
    select: data => data.documents.version,
  });

  const shouldUseV2 =
    !featureFlags?.[FEATURE_FLAGS.DOCUMENTS_V3] ||
    documentsVersion === DocumentsVersion.V2;

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
            carrierId={carrierId}
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
            shouldUseV2={shouldUseV2}
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
