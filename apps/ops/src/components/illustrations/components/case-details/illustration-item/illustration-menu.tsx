import {
    MenuContextual,
    Icon,
    IconType,
    MenuContextualItem,
    Button,
    Heading,
    HeadingVariant,
    Text,
    BodyVariant,
} from '@zinnia/bloom/components';
import { useTranslation } from 'next-i18next';
import { useState } from 'react';

import { useClientCaseId } from '@deps/components/illustrations/helpers/hooks/use-client-case-id';
import { useIllustrationAnalytics } from '@deps/components/illustrations/helpers/hooks/use-illustration-analytics';
import { useSelectIllustrationForApplication } from '@deps/components/illustrations/helpers/hooks/use-select-illustration-for-application';
import { useIllustrationActions } from '@deps/components/illustrations/helpers/hooks/useIllustrationActions';
import { useSelectedIllustration } from '@deps/components/illustrations/providers/SelectedIllustrationProvider';
import { Modal } from '@deps/components/modal/modal';
import { TranslationFiles } from '@deps/config/translations';
import { IllustrationStatuses } from '@deps/types/illustrations';
import { ProductTypes } from '@deps/types/product';
import { IllustrationsSegmentTrackedEventName } from '@deps/types/segment-analytics';

interface IllustrationMenuProps {
    isSelectForApplicationVisible?: boolean;
}

const IllustrationMenu = ({
    isSelectForApplicationVisible,
}: IllustrationMenuProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, {});
    const clientCaseId = useClientCaseId();
    const { isLoadingSelectForApplication, selectedIllustration } =
        useSelectedIllustration();
    const [openArchiveConfirmation, setOpenArchiveConfirmation] =
        useState(false);

    const { archiveIllustrationMutation, unarchiveIllustrationMutation } =
        useIllustrationActions();
    const { sendIllustrationsClickedEvent } = useIllustrationAnalytics();
    const { product } = selectedIllustration ?? {};

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

        if (product) {
            sendIllustrationsClickedEvent(
                product,
                IllustrationsSegmentTrackedEventName.archiveIllustration
            );
        }

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

        if (product) {
            sendIllustrationsClickedEvent(
                product,
                IllustrationsSegmentTrackedEventName.unarchiveIllustration
            );
        }
    };
    const handleSelectForApplication = useSelectIllustrationForApplication();
    const handleSelectForApplicationAnalytics = () => {
        handleSelectForApplication();
    };

    if (openArchiveConfirmation) {
        return (
            <Modal
                open={openArchiveConfirmation}
                closeIcon="X"
                onCancel={() => setOpenArchiveConfirmation(false)}
                content={
                    <div className="flex flex-col items-center text-black gap-2 py-20">
                        <Icon
                            type={IconType.ALERT_EXCLAMATION}
                            alt={
                                t(
                                    'clientCase.illustrationDetails.archiveIllustrationIconTitle'
                                ) as string
                            }
                            height={50}
                            width={50}
                        />
                        <Heading as={HeadingVariant.h3}>
                            {
                                t(
                                    'clientCase.illustrationDetails.archiveIllustrationPopoverTitle'
                                ) as string
                            }
                        </Heading>
                        <Text as={BodyVariant.p} className="mb-8">
                            {
                                t(
                                    'clientCase.illustrationDetails.archiveIllustrationPopoverBody'
                                ) as string
                            }
                        </Text>

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
                            {t('clientCase.illustrationDetails.confirmArchive')}
                        </Button>
                        <Button
                            onClick={() => setOpenArchiveConfirmation(false)}
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
                }
            />
        );
    } else {
        return (
            <MenuContextual
                triggerLabel={<Icon type={IconType.MENU_HORIZONTAL} />}
            >
                {isSelectForApplicationVisible &&
                    selectedIllustration?.illustration.productType !==
                        ProductTypes.TERM &&
                    selectedIllustration?.illustration.status ===
                        IllustrationStatuses.ACTIVE && (
                        <MenuContextualItem
                            disabled={isLoadingSelectForApplication}
                            onClick={handleSelectForApplicationAnalytics}
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
                        content={t('clientCase.illustrationDetails.archive')}
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
