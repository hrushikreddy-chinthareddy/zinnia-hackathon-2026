import {
    MenuContextual,
    Icon,
    IconType,
    MenuContextualItem,
} from '@zinnia/bloom/components';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';

import { useIllustrationActions } from '@deps/components/illustrations/helpers/hooks/useIllustrationActions';
import { useSelectedIllustration } from '@deps/components/illustrations/providers/SelectedIllustrationProvider';
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

    return (
        <MenuContextual triggerLabel={<Icon type={IconType.MENU_HORIZONTAL} />}>
            {isSelectForApplicationVisible && (
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
                    onClick={handleArchiveIllustration}
                    content={t('clientCase.illustrationDetails.archived')}
                    icon={
                        <Icon type={IconType.ARCHIVE} height={20} width={20} />
                    }
                />
            )}
            {selectedIllustration?.illustration.status ===
                IllustrationStatuses.ARCHIVED && (
                <MenuContextualItem
                    onClick={handleUnarchiveIllustration}
                    content={t('clientCase.illustrationDetails.unArchive')}
                    icon={
                        <Icon type={IconType.REFRESH} height={20} width={20} />
                    }
                />
            )}
        </MenuContextual>
    );
};

export default IllustrationMenu;
