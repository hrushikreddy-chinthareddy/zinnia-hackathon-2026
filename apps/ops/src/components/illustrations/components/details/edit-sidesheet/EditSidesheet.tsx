import { SideSheet } from '@zinnia/bloom/components';
import { VersionedAnswers } from '@zinnia/form-engine-sdk';
import { FC, PropsWithChildren } from 'react';

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
        >
            <EappContainer
                planCode={planCode}
                clientCase={clientCase}
                versionedAnswers={versionedAnswers}
            />
        </SideSheet>
    );
};
