'use client';

import { LineOfBusiness } from '@zinnia/api-types/types/sor';
import Link from 'next/link';
import useWindowSize from 'react-use/lib/useWindowSize';

import documentStyles from '@/app/(authenticated)/coverage/shared-styles/Documents.module.css';
import { ClientOnly } from '@/components/client-only/ClientOnly';
import { DocumentCategory } from '@/types/document';
import { lineOfBusinessUrlPath } from '@/utils/data';

export const DocumentsTabs = ({
  lineOfBusiness,
  planCode,
  policyNumber,
  activeTab,
  showTaxDocuments,
}: {
  lineOfBusiness: LineOfBusiness;
  planCode: string;
  policyNumber: string;
  activeTab: DocumentCategory;
  showTaxDocuments: boolean;
}) => {
  const lineOfBusinessPath = lineOfBusinessUrlPath(lineOfBusiness);
  const { width } = useWindowSize();

  return (
    <ClientOnly>
      <ul className={documentStyles.nav}>
        <li>
          <Link
            href={`/coverage/${lineOfBusinessPath}/${planCode}/${policyNumber}/documents`}
            className={`${activeTab === DocumentCategory.DOCUMENTS ? documentStyles.active : ''}`}
          >
            Correspondence
          </Link>
        </li>
        <li>
          <Link
            href={`/coverage/${lineOfBusinessPath}/${planCode}/${policyNumber}/documents?type=${DocumentCategory.STATEMENTS}`}
            className={`${activeTab === DocumentCategory.STATEMENTS ? documentStyles.active : ''}`}
          >
            Statements
          </Link>
        </li>
        {showTaxDocuments && (
          <li>
            <Link
              href={`/coverage/${lineOfBusinessPath}/${planCode}/${policyNumber}/documents?type=${DocumentCategory.TAX}`}
              className={`${activeTab === DocumentCategory.TAX ? documentStyles.active : ''}`}
            >
              {width < 768 ? 'Tax' : 'Tax Documents'}
            </Link>
          </li>
        )}
      </ul>
    </ClientOnly>
  );
};
