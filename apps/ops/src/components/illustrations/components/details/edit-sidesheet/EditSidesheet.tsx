import { SideSheet } from '@zinnia/bloom/components';
import { VersionedAnswers } from '@zinnia/form-engine-sdk';
import { FC, PropsWithChildren, useState } from 'react';

import { IllustrationsClientCase } from '@deps/types/illustrations';

import styles from './EditSidesheet.module.css';
import EappContainer from '../../eapp/eapp-container';

interface EditSidesheetProps {
    planCode: string;
    clientCase: IllustrationsClientCase;
}

export const EditSidesheet: FC<PropsWithChildren<EditSidesheetProps>> = ({
    children,
    planCode,
    clientCase,
}) => {
    const [open, setOpen] = useState(false);

    const versionedAnswers: VersionedAnswers = clientCase.inputs
        ? JSON.parse(clientCase.inputs)
        : undefined;

    return (
        <SideSheet
            preventCloseOnOutsideClick={false}
            header={'Edit Illustration'}
            trigger={children}
            description="Edit Illustration"
            contentClassName={styles.editSidesheetContent}
            open={open}
            onOpenChange={setOpen}
        >
            <EappContainer
                planCode={planCode}
                clientCase={clientCase}
                versionedAnswers={versionedAnswers}
                submitCallback={() => setOpen(false)}
            />
        </SideSheet>
    );
};
