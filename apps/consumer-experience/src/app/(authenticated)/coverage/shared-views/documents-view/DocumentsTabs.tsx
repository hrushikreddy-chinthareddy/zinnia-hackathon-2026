'use client';

import { toQuerySearchParams } from '@xd/xd-components/src/utils/Strings';
import { usePathname } from 'next/navigation';
import useWindowSize from 'react-use/lib/useWindowSize';

import documentStyles from '@/app/styles/unthemedTabsWrapper.module.css';
import { ClientOnly } from '@/components/client-only/ClientOnly';
import { Link } from '@/components/link/Link';
import { DocumentCategory } from '@/types/document';

export const DocumentsTabs = ({
  activeTab,
  showTaxDocuments,
}: {
  activeTab: DocumentCategory;
  showTaxDocuments: boolean;
}) => {
  const { width } = useWindowSize();

  const pathname = usePathname();

  const documentLink = `${pathname}?${toQuerySearchParams({
    type: DocumentCategory.DOCUMENTS,
  })}`;

  const statementsLink = `${pathname}?${toQuerySearchParams({
    type: DocumentCategory.STATEMENTS,
  })}`;

  const taxLink = `${pathname}?${toQuerySearchParams({
    type: DocumentCategory.TAX,
  })}`;

  return (
    <ClientOnly>
      <ul className={documentStyles.unthemedTabsWrapper}>
        <li>
          <Link
            isInternal
            href={documentLink}
            className={`${activeTab === DocumentCategory.DOCUMENTS ? documentStyles.selected : ''}`}
          >
            Correspondence
          </Link>
        </li>
        <li>
          <Link
            isInternal
            href={statementsLink}
            className={`${activeTab === DocumentCategory.STATEMENTS ? documentStyles.selected : ''}`}
          >
            Statements
          </Link>
        </li>
        {showTaxDocuments && (
          <li>
            <Link
              isInternal
              href={taxLink}
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
