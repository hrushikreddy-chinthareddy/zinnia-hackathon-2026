import { DocumentTypeView } from '@deps/components/side-sheet/documents/DocumentTypeView';
import DocumentCard from '@deps/components/workflows/document/document-card';

import { AuditFile } from './death-audit-files.types';

const DeathAuditFile = ({
    file,
    carrier,
}: {
    file: AuditFile;
    carrier: string;
}) => {
    const fileName = file?.fileName ?? '';
    const fileNameWithoutExt = fileName?.slice(0, -4);
    const fileType = fileName?.slice(-3)?.toLowerCase();

    return (
        <li className="mt-1 flex w-full flex-row items-center justify-between rounded-sm border-gray-100">
            <div className="flex flex-row items-center justify-start gap-2">
                <DocumentCard
                    key={file.documentId}
                    cardClass="mt-2 mb-4"
                    document={{
                        documentId: file?.documentId ?? '',
                        displayName: fileNameWithoutExt ?? '',
                        docTypeView: DocumentTypeView.Correspondence,
                        carrier: carrier,
                    }}
                    isViewButtonHidden={['eml', 'csv'].includes(fileType)}
                />
            </div>
        </li>
    );
};

export default DeathAuditFile;
