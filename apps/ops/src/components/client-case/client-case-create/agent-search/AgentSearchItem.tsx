import { Icon, IconType, Button } from '@zinnia/bloom/components';
import clsx from 'clsx';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import { TranslationFiles } from '@deps/config/translations';

import styles from './agent-search.module.css';
import { AgentOption } from './types';

type AgentSearchItemProps = {
    agentOption: AgentOption;
    onSelect: (agentOption: AgentOption) => void;
};

export const AgentSearchItem = ({
    agentOption,
    onSelect,
}: AgentSearchItemProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, {});

    const { firstName, lastName, email, lookupId, npn } = agentOption;
    const name =
        firstName && lastName
            ? `${firstName} ${lastName}`
            : firstName || lastName;

    const handleSelect = useCallback(
        () => onSelect(agentOption),
        [agentOption, onSelect]
    );

    return (
        <div
            className={clsx(styles.agentInfoResult)}
            key={`${name}-${email}/${lookupId}/${npn}`}
        >
            <Typography
                variant={TypographyVariant.BodySm}
                className={styles.agentNameResult}
            >
                {name}
            </Typography>
            <Typography
                variant={TypographyVariant.FieldLabel}
                className={clsx(styles.agentEmail, styles.agentEmailResult)}
            >
                {email}
            </Typography>
            <Button
                mode="link"
                data-testid="new-client-case-btn"
                aria-label={t('ariaLabel.search') as string}
                type="button"
                size="small"
                className={styles.addAgentButton}
                onClick={handleSelect}
            >
                <Icon
                    type={IconType.ADD}
                    color="#00628b"
                    height={16}
                    width={16}
                />
                {t(
                    'clientCase.createClientCaseForm.searchAgent.selectAgentButton'
                )}
            </Button>
        </div>
    );
};
