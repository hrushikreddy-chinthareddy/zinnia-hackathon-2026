import { SideSheet } from '@zinnia/bloom/components';
import { FC, PropsWithChildren, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useIllustrationHeader } from '@deps/components/illustrations/helpers/hooks/use-illustration-header';
import { TranslationFiles } from '@deps/config/translations';
import { IllustrationsClientCase } from '@deps/types/illustrations';

import styles from './edit-sidesheet.module.css';
import EappContainer from '../../eapp/eapp-container';

interface EditSidesheetProps {
    planCode: string;
    clientCase: IllustrationsClientCase;
    illustrationId?: string;
}

export const EditSidesheet: FC<PropsWithChildren<EditSidesheetProps>> = ({
    children,
    planCode,
    clientCase,
    illustrationId,
}) => {
    const [open, setOpen] = useState(false);
    const { buildIllustrationHeader } = useIllustrationHeader();
    const { t } = useTranslation(TranslationFiles.COMMON, {});

    const title = buildIllustrationHeader(
        planCode,
        clientCase,
        t('clientCase.illustrationDetails.editIllustration') ||
            'Edit Illustration'
    );
    const illustration = clientCase.illustrations?.find(
        (illustration) => illustration.id === illustrationId
    );

    const versionedAnswers = illustration?.inputs
        ? JSON.parse(illustration?.inputs)
        : undefined;

    return (
        <SideSheet
            preventCloseOnOutsideClick={false}
            header={title}
            trigger={children}
            contentClassName={styles.editSidesheetContent}
            open={open}
            onOpenChange={setOpen}
        >
            <EappContainer
                planCode={planCode}
                clientCase={clientCase}
                versionedAnswers={versionedAnswers}
                submitCallback={() => setOpen(false)}
                isEdit
                illustrationId={illustrationId}
            />
        </SideSheet>
    );
};
