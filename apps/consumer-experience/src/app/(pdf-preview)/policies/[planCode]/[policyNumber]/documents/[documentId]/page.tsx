import PdfPreviewer from '@/components/pdf-previewer/PdfPreviewer';
import { PolicyRequestInputs } from '@/types/policy';
import previewStyles from './Preview.module.css';

export default async function DocumentPreview({
  params,
  searchParams,
}: {
  params: PolicyRequestInputs & { documentId: string };
  searchParams: { source: string; clientCode: string; fileName: string };
}) {
  return (
    <div className={previewStyles.container}>
      <PdfPreviewer
        documentId={params.documentId}
        source={searchParams.source}
        clientCode={searchParams.clientCode}
        fileName={searchParams.fileName ?? params.documentId}
      />
    </div>
  );
}
