'use client';

import { LineOfBusiness } from '@zinnia/api-types/types/sor';
import { IconType } from '@zinnia/bloom/components';

import { ClickableListContainer } from '@/components/clickable-card-container/ClickableCardContainer';
import { FieldData } from '@/components/field-data/FieldData';
import { DocumentCategory, TaxDocument } from '@/types/document';
import { checkIfNull, lineOfBusinessUrlPath } from '@/utils/data';
import { standardDateMonthDayYear } from '@/utils/dates';

import styles from './documentsList.module.css';
import { NoDataAvailable } from '../no-data-available/NoDataAvailable';

// TODO: move this to a util file somewhere...not the utils/url file because that
// uses headers :/
const createQueryString = (obj: Record<string, unknown>) =>
  Object.entries(obj)
    .map(([key, value]) => `${key}=${value}`)
    .join('&');

export default function DocumentsListTax({
  documents,
  planCode,
  policyNumber,
  lineOfBusiness,
  carrierId,
}: {
  documents: TaxDocument[];
  planCode: string;
  policyNumber: string;
  lineOfBusiness: LineOfBusiness;
  carrierId: string;
}) {
  if (!documents?.length) {
    return (
      <NoDataAvailable
        message="No tax documents available."
        iconType={IconType.DOCUMENT_DUPLICATE}
      />
    );
  }

  return (
    <ClickableListContainer
      listItems={documents.map(d => {
        const queryParams = {
          clientCode: carrierId,
          fChar: d.fChar,
          taxYear: d.taxYear,
          docCategory: DocumentCategory.TAX,
        };
        const queryString = createQueryString(queryParams);

        return {
          content: (
            <div className={styles.content}>
              <FieldData caption={standardDateMonthDayYear(d.taxYear)}>
                <p className="typography-labels-label-md-alt">
                  {checkIfNull(d.name)}
                </p>
              </FieldData>
            </div>
          ),
          linkTo: {
            isInternal: true,
            newTab: true,
            url: `/coverage/${lineOfBusinessUrlPath(lineOfBusiness)}/${planCode}/${policyNumber}/documents/${d.formId}?${queryString}`,
            label: `View Document - ${d.name} - ${d.taxYear}`,
            ctaText: 'View',
          },
        };
      })}
    />
  );
}
