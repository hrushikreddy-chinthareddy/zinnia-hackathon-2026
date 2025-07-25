import {
    MenuContextual,
    Icon,
    IconType,
    MenuContextualItem,
} from '@zinnia/bloom/components';
import { useTranslation } from 'next-i18next';

import { TranslationFiles } from '@deps/config/translations';

interface IllustrationMenuProps {
    isSelectForApplicationVisible?: boolean;
}

const IllustrationMenu = ({
    isSelectForApplicationVisible,
}: IllustrationMenuProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, {});

    return (
        <MenuContextual triggerLabel={<Icon type={IconType.MENU_HORIZONTAL} />}>
            {isSelectForApplicationVisible && (
                <MenuContextualItem
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
        </MenuContextual>
    );
};

export default IllustrationMenu;
