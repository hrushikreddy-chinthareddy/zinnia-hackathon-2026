'use client';

import { IconType, Pagination } from '@zinnia/bloom/components';
import { useCallback, useState } from 'react';

import { ClickableListContainer } from '@/components/clickable-card-container/ClickableCardContainer';
import { FieldData } from '@/components/field-data/FieldData';
import { NoDataAvailable } from '@/components/no-data-available/NoDataAvailable';
import { ExtendedDocumentMeta } from '@/types/document';
import { checkIfNull } from '@/utils/data';
import { standardDateMonthDayYear } from '@/utils/dates';

import styles from './documentsList.module.css';

export default function DocumentsList({
  docCategory,
  documents,
  planCode,
  policyNumber,
}: {
  docCategory: string;
  documents: ExtendedDocumentMeta[];
  planCode: string;
  policyNumber: string;
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

  if (!documents?.length) {
    return (
      <NoDataAvailable
        message={`No ${docCategory ?? 'documents'} available.`}
        iconType={IconType.DOCUMENT_DUPLICATE}
      />
    );
  }
  return (
    <>
      <div className={styles.documentsListContainer}>
        <ClickableListContainer
          listItems={documents.slice(offset, offset + limit).map(d => {
            return {
              content: (
                <>
                  <div className={styles.content}>
                    <FieldData
                      caption={standardDateMonthDayYear(d.documentDate)}
                    >
                      <p className="typography-labels-label-md-alt">
                        {checkIfNull(d.displayName)}
                      </p>
                    </FieldData>
                  </div>
                </>
              ),
              linkTo: {
                isInternal: true,
                newTab: true,
                url: `/policies/${planCode}/${policyNumber}/documents/${d.documentId ?? d.documentID}?clientCode=${d.clientCode}&source=${d.downloadSource}&fileName=${d?.displayName?.replace(/[^A-Z0-9]/gi, '') ?? d.documentId ?? d.documentID}`,
                label: `View Document - ${d.displayName}`,
                ctaText: 'View',
              },
            };
          })}
        />
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
