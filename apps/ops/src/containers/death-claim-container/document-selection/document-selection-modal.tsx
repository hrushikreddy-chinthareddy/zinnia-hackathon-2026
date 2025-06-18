import { useRouter } from 'next/navigation';
import { useState } from "react";

import { Modal } from '@deps/components/modal/modal';

import DocumentSelection from "./document-selection";

interface DocumentSelectionProps {
    policyNumber: string;
    lob: string;
};

const DocumentSelectionModal = ({ policyNumber, lob }: DocumentSelectionProps) => {
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
            content={<DocumentSelection policyNumber={policyNumber} lob={lob} onCancel={onCancel} />}
            closeIcon="X"
            onCancel={handleCancel}
        />
    );
};

export default DocumentSelectionModal;
