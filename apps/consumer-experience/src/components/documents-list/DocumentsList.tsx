'use client';

import { LineOfBusiness } from '@zinnia/api-types/types/sor';
import { IconType } from '@zinnia/bloom/components';

import { ClickableListContainer } from '@/components/clickable-card-container/ClickableCardContainer';
import { FieldData } from '@/components/field-data/FieldData';
import { NoDataAvailable } from '@/components/no-data-available/NoDataAvailable';
import {
  DocumentCategory,
  DocumentV3SearchItem,
  ExtendedDocumentMeta,
} from '@/types/document';
import { checkIfNull, lineOfBusinessUrlPath } from '@/utils/data';
import { standardDateMonthDayYear } from '@/utils/dates';
import { createQueryString } from '@/utils/strings';

import styles from './documentsList.module.css';

const documentCategoryDisplayName = {
  [DocumentCategory.DOCUMENTS]: 'documents',
  [DocumentCategory.STATEMENTS]: 'statements',
  [DocumentCategory.TAX]: 'tax documents',
};

export default function DocumentsList({
  docCategory,
  documents,
  planCode,
  policyNumber,
  lineOfBusiness,
  shouldUseV2 = false,
}: {
  docCategory: DocumentCategory;
  documents: ExtendedDocumentMeta[] | DocumentV3SearchItem[];
  planCode: string;
  policyNumber: string;
  lineOfBusiness: LineOfBusiness;
  shouldUseV2?: boolean;
}) {
  if (!documents?.length) {
    return (
      <NoDataAvailable
        message={`No ${documentCategoryDisplayName[docCategory] ?? 'documents'} available.`}
        iconType={IconType.DOCUMENT_DUPLICATE}
        correlationId={undefined}
      />
    );
  }

  return (
    <ClickableListContainer
      listItems={documents.map(d => {
        const queryParams = {
          clientCode:
            (d as ExtendedDocumentMeta)?.clientCode ??
            (d as DocumentV3SearchItem)?.parentCarrierCode,
          source:
            (d as ExtendedDocumentMeta)?.downloadSource ??
            (d as DocumentV3SearchItem)?.documentClassification,
          documentClassification:
            d.documentClassification ||
            (d as ExtendedDocumentMeta)?.downloadSource,
          ...(shouldUseV2 && {
            fileName:
              d?.displayName?.replace(/[^A-Z0-9]/gi, '') ??
              d.documentId ??
              d.documentID,
          }),
          docCategory,
        };

        const queryString = createQueryString(queryParams);

        return {
          content: (
            <>
              <div className={styles.content}>
                <FieldData caption={standardDateMonthDayYear(d.documentDate)}>
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
            url: `/coverage/${lineOfBusinessUrlPath(lineOfBusiness)}/${planCode}/${policyNumber}/documents/${d.documentId ?? d.documentID}?${queryString}`,
            label: `View Document - ${d.displayName}`,
            ctaText: 'View',
          },
        };
      })}
    />
  );
}
