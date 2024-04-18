import PdfPreviewer from '@/components/pdf-previewer/PdfPreviewer';
import { getDocument } from '@/services/document';
import { PolicyRequestInputs } from '@/types/policy';
import previewStyles from './Preview.module.css';

export default async function DocumentPreview({
  params,
  searchParams,
}: {
  params: PolicyRequestInputs & { documentId: string };
  searchParams: { source: string; clientCode: string };
}) {
  const { data, error } = await getDocument(
    params.documentId,
    searchParams.source,
    searchParams.clientCode
  );

  if (error || !data)
    return (
      <>An error occurred while getting this document. Please try again.</>
    );
  return (
    <div className={previewStyles.container}>
      <PdfPreviewer documentBinary={data.binaryData} />
    </div>
  );
}
