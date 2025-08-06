import {
    MenuContextual,
    Icon,
    IconType,
    MenuContextualItem,
    Button,
} from '@zinnia/bloom/components';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { useState } from 'react';

import { useIllustrationActions } from '@deps/components/illustrations/helpers/hooks/useIllustrationActions';
import { useSelectedIllustration } from '@deps/components/illustrations/providers/SelectedIllustrationProvider';
import { Modal } from '@deps/components/modal/modal';
import { TranslationFiles } from '@deps/config/translations';
import { IllustrationStatuses } from '@deps/types/illustrations';

interface IllustrationMenuProps {
    isSelectForApplicationVisible?: boolean;
}

const IllustrationMenu = ({
    isSelectForApplicationVisible,
}: IllustrationMenuProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, {});
    const router = useRouter();
    const { clientCaseId } = router.query;
    const {
        isLoadingSelectForApplication,
        setIsLoadingSelectForApplication,
        selectedIllustration,
    } = useSelectedIllustration();
    const [openArchiveConfirmation, setOpenArchiveConfirmation] =
        useState(false);

    const {
        selectIllustrationMutation,
        archiveIllustrationMutation,
        unarchiveIllustrationMutation,
    } = useIllustrationActions();

    const handleSelectIllustration = () => {
        if (
            isLoadingSelectForApplication ||
            !selectedIllustration ||
            !clientCaseId
        )
            return;

        setIsLoadingSelectForApplication(true);
        selectIllustrationMutation.mutateAsync({
            clientCaseId: clientCaseId?.toString() || '',
            illustrationId: selectedIllustration?.illustration.id || '',
        });
    };

    const handleArchiveIllustration = () => {
        if (
            isLoadingSelectForApplication ||
            !selectedIllustration ||
            !clientCaseId
        )
            return;

        archiveIllustrationMutation.mutateAsync({
            clientCaseId: clientCaseId?.toString() || '',
            illustrationId: selectedIllustration?.illustration.id || '',
        });

        setOpenArchiveConfirmation(false);
    };

    const handleUnarchiveIllustration = () => {
        if (
            isLoadingSelectForApplication ||
            !selectedIllustration ||
            !clientCaseId
        )
            return;

        unarchiveIllustrationMutation.mutateAsync({
            clientCaseId: clientCaseId?.toString() || '',
            illustrationId: selectedIllustration?.illustration.id || '',
        });
    };

    if (openArchiveConfirmation) {
        return (
            <Modal
                open={openArchiveConfirmation}
                modalTitle={
                    t(
                        'clientCase.illustrationDetails.archiveIllustrationPopoverTitle'
                    ) as string
                }
                content={
                    <>
                        <p className="typography-content-body">
                            {t(
                                'clientCase.illustrationDetails.archiveIllustrationPopoverBody'
                            )}
                        </p>
                        <div className="flex justify-end gap-2">
                            <Button
                                onClick={handleArchiveIllustration}
                                mode="primary"
                                data-testid="confirm-archive-btn"
                                aria-label={
                                    t(
                                        'clientCase.illustrationDetails.confirmArchiveAriaLabel'
                                    ) as string
                                }
                                type="button"
                                size="small"
                            >
                                {t(
                                    'clientCase.illustrationDetails.confirmArchive'
                                )}
                            </Button>
                            <Button
                                onClick={() =>
                                    setOpenArchiveConfirmation(false)
                                }
                                mode="secondary"
                                data-testid="cancel-archive-btn"
                                aria-label={
                                    t(
                                        'clientCase.illustrationDetails.cancelArchiveAriaLabel'
                                    ) as string
                                }
                                type="button"
                                size="small"
                            >
                                {t('clientCase.illustrationDetails.cancel')}
                            </Button>
                        </div>
                    </>
                }
                closeIcon="X"
                onCancel={() => setOpenArchiveConfirmation(false)}
            />
        );
    } else {
        return (
            <MenuContextual
                triggerLabel={<Icon type={IconType.MENU_HORIZONTAL} />}
            >
                {isSelectForApplicationVisible &&
                    selectedIllustration?.illustration.status !==
                        IllustrationStatuses.SELECTED && (
                        <MenuContextualItem
                            disabled={isLoadingSelectForApplication}
                            onClick={handleSelectIllustration}
                            content={t(
                                'clientCase.illustrationDetails.selectForApplication'
                            )}
                            icon={
                                <Icon
                                    type={IconType.CIRCLE_CHECKMARK}
                                    height={20}
                                    width={20}
                                />
                            }
                        />
                    )}
                {selectedIllustration?.illustration.status ===
                    IllustrationStatuses.ACTIVE && (
                    <MenuContextualItem
                        onClick={() => setOpenArchiveConfirmation(true)}
                        content={t('clientCase.illustrationDetails.archived')}
                        icon={
                            <Icon
                                type={IconType.ARCHIVE}
                                height={20}
                                width={20}
                            />
                        }
                    />
                )}
                {selectedIllustration?.illustration.status ===
                    IllustrationStatuses.ARCHIVED && (
                    <MenuContextualItem
                        onClick={handleUnarchiveIllustration}
                        content={t('clientCase.illustrationDetails.unArchive')}
                        icon={
                            <Icon
                                type={IconType.REFRESH}
                                height={20}
                                width={20}
                            />
                        }
                    />
                )}
            </MenuContextual>
        );
    }
};

export default IllustrationMenu;
