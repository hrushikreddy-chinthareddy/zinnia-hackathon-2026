import { Metadata } from 'next';

import { DocumentsView } from '@/app/(authenticated)/coverage/shared-views/documents-view/DocumentsView';
import { RouteKey, getPageTitle } from '@/route-map';
import { DocumentCategory } from '@/types/document';
import { PolicyRequestInputs } from '@/types/policy';
import { LineOfBusiness } from '@zinnia/api-types/types/sor';

const pageTitle = getPageTitle(RouteKey.DOCUMENTS);
// disable because NextJS needs this to be exported from this file
// eslint-disable-next-line react-refresh/only-export-components
export const metadata: Metadata = {
  title: pageTitle,
};

export default async function Documents({
  params,
  searchParams,
}: {
  params: PolicyRequestInputs;
  searchParams: { type: DocumentCategory };
}) {
  const activeTab = searchParams.type || DocumentCategory.DOCUMENTS;

  return (
    <DocumentsView
      planCode={params.planCode}
      policyNumber={params.policyNumber}
      lineOfBusiness={LineOfBusiness.LIFE}
      currentView={activeTab}
    />
  );
}
