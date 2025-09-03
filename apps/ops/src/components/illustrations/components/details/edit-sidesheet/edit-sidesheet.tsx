import { SideSheet } from '@zinnia/bloom/components';
import { FC, PropsWithChildren, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useIllustrationHeader } from '@deps/components/illustrations/helpers/hooks/use-illustration-header';
import { useSelectedIllustration } from '@deps/components/illustrations/providers/SelectedIllustrationProvider';
import { TranslationFiles } from '@deps/config/translations';
import { IllustrationsClientCase } from '@deps/types/illustrations';

import styles from './edit-sidesheet.module.css';
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
    const { buildIllustrationHeader } = useIllustrationHeader();
    const { selectedIllustration } = useSelectedIllustration();
    const { t } = useTranslation(TranslationFiles.COMMON, {});

    const title = buildIllustrationHeader(
        planCode,
        clientCase,
        t('clientCase.illustrationDetails.editIllustration') ||
            'Edit Illustration'
    );

    return (
        <SideSheet
            preventCloseOnOutsideClick={false}
            header={title}
            trigger={children}
            contentClassName={styles.editSidesheetContent}
            descriptionClassName={styles.editSidesheetDescription}
            open={open}
            onOpenChange={setOpen}
        >
            <EappContainer
                planCode={planCode}
                clientCase={clientCase}
                isEdit
                illustrationId={selectedIllustration?.illustration.id}
            />
        </SideSheet>
    );
};
