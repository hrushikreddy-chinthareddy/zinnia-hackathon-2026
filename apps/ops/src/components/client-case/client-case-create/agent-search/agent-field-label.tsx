import { Tooltip, Label } from '@zinnia/bloom/components';
import { useTranslation } from 'react-i18next';

import { TranslationFiles } from '@deps/config/translations';
import { ReactComponent as CircleInfoIcon } from '@deps/styles/elements/icons/circles/circle-info.svg';

export const AgentFieldLabel = () => {
    const { t } = useTranslation(TranslationFiles.COMMON, {});
    return (
        <Label
            interactiveElements={[
                <Tooltip
                    key="agentTooltip"
                    trigger={
                        <span tabIndex={0}>
                            <CircleInfoIcon
                                height={'16px'}
                                width={'16px'}
                                className="tooltip-primary"
                            />
                        </span>
                    }
                    triggerClassName="w-fit"
                    replaceElement
                >
                    {t('clientCase.clientCaseTable.agentTooltip')}
                </Tooltip>,
            ]}
        >
            {t('clientCase.clientCaseTable.agent')}
        </Label>
    );
};
