import { LineOfBusiness } from '@zinnia/api-types/types/sor';
import { Metadata } from 'next';

import PdfPreviewer from '@/components/pdf-previewer/PdfPreviewer';
import { RouteKey, getPageTitle } from '@/route-map';
import { DocumentCategory } from '@/types/document';
import { PolicyRequestInputs } from '@/types/policy';

import previewStyles from './Preview.module.css';

const pageTitle = getPageTitle(RouteKey.DOCUMENTS);
// disable because NextJS needs this to be exported from this file
// eslint-disable-next-line react-refresh/only-export-components
export const metadata: Metadata = {
  title: pageTitle,
};

export default async function DocumentPreview({
  params,
  searchParams,
}: {
  params: PolicyRequestInputs & { documentId: string } & {
    lineOfBusiness: LineOfBusiness;
  };
  searchParams: {
    source: string;
    clientCode: string;
    fileName: string;
    docCategory: DocumentCategory;
  };
}) {
  return (
    <div style={{ height: '100svh' }}>
      <div className={previewStyles.container}>
        <PdfPreviewer {...{ ...params, ...searchParams }} />
      </div>
    </div>
  );
}
