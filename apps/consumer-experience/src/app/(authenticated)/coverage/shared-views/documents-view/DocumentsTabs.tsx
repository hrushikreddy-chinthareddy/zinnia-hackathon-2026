'use client';

import { LineOfBusiness } from '@zinnia/api-types/types/sor';
import useWindowSize from 'react-use/lib/useWindowSize';

import documentStyles from '@/app/styles/unthemedTabsWrapper.module.css';
import { ClientOnly } from '@/components/client-only/ClientOnly';
import { Link } from '@/components/link/Link';
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
      <ul className={documentStyles.unthemedTabsWrapper}>
        <li>
          <Link
            isInternal
            href={`/coverage/${lineOfBusinessPath}/${planCode}/${policyNumber}/documents`}
            className={`${activeTab === DocumentCategory.DOCUMENTS ? documentStyles.selected : ''}`}
          >
            Correspondence
          </Link>
        </li>
        <li>
          <Link
            isInternal
            href={`/coverage/${lineOfBusinessPath}/${planCode}/${policyNumber}/documents?type=${DocumentCategory.STATEMENTS}`}
            className={`${activeTab === DocumentCategory.STATEMENTS ? documentStyles.selected : ''}`}
          >
            Statements
          </Link>
        </li>
        {showTaxDocuments && (
          <li>
            <Link
              isInternal
              href={`/coverage/${lineOfBusinessPath}/${planCode}/${policyNumber}/documents?type=${DocumentCategory.TAX}`}
              className={`${activeTab === DocumentCategory.TAX ? documentStyles.selected : ''}`}
            >
              {width < 501 ? 'Tax' : 'Tax Documents'}
            </Link>
          </li>
        )}
      </ul>
    </ClientOnly>
  );
};
