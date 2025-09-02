import { SideSheet } from '@zinnia/bloom/components';
import { FC, PropsWithChildren, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useIllustrationHeader } from '@deps/components/illustrations/helpers/hooks/use-illustration-header';
import { useSelectedIllustration } from '@deps/components/illustrations/providers/SelectedIllustrationProvider';
import { TranslationFiles } from '@deps/config/translations';
import { IllustrationsClientCase } from '@deps/types/illustrations';

import styles from './add-illustration-sidesheet.module.css';
import EappContainer from '../../eapp/eapp-container';
import { EAppProviders } from '../../eapp/eapp-providers';

interface AddIllustrationSidesheetProps {
    planCode: string;
    clientCase?: IllustrationsClientCase;
    overrideOpen?: boolean;
}

export const AddIllustrationSidesheet: FC<
    PropsWithChildren<AddIllustrationSidesheetProps>
> = ({ children, planCode, clientCase, overrideOpen }) => {
    const [open, setOpen] = useState(false);
    const { buildIllustrationHeader } = useIllustrationHeader();
    const { selectedIllustration } = useSelectedIllustration();
    const { t } = useTranslation(TranslationFiles.COMMON, {});

    useEffect(() => {
        if (overrideOpen) {
            setOpen(overrideOpen);
        }
    }, [overrideOpen]);

    const title = buildIllustrationHeader(
        planCode,
        clientCase,
        t('clientCase.productList.addIllustration') || 'Add Illustration'
    );

    return (
        <SideSheet
            preventCloseOnOutsideClick={false}
            header={title}
            trigger={children}
            contentClassName={styles.editSidesheetContent}
            open={open}
            onOpenChange={setOpen}
        >
            <EAppProviders
                clientCase={clientCase}
                planCode={planCode}
                submitCallback={() => setOpen(false)}
            >
                <EappContainer
                    planCode={planCode}
                    clientCase={clientCase}
                    illustrationId={selectedIllustration?.illustration.id}
                />
            </EAppProviders>
        </SideSheet>
    );
};
