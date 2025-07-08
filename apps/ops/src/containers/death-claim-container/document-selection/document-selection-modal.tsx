import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Modal } from '@deps/components/modal/modal';
import { DocumentInfo } from '@deps/hooks/useDeathClaimSupportingDocument';

import DocumentSelection from './document-selection';

interface DocumentSelectionProps {
    policyNumber: string;
    lob: string;
    supportingDocuments: DocumentInfo[];
}

const DocumentSelectionModal = ({
    supportingDocuments,
    policyNumber,
    lob,
}: DocumentSelectionProps) => {
    const router = useRouter();
    const [open, setOpen] = useState(true);

    const onCancel = () => {
        setOpen(false);
    };

    const handleCancel = () => {
        onCancel();
        router.push('/policies');
    };

    return (
        <Modal
            open={open}
            content={
                <DocumentSelection
                    supportingDocuments={supportingDocuments}
                    policyNumber={policyNumber}
                    lob={lob}
                    onCancel={onCancel}
                />
            }
            closeIcon="X"
            onCancel={handleCancel}
        />
    );
};

export default DocumentSelectionModal;
