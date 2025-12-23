import { Loader } from '@zinnia/bloom/components';
import clsx from 'clsx';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import { TranslationFiles } from '@deps/config/translations';
import { browserLogError } from '@deps/utils/browser-logging';

import { useAgentFieldContext } from './agent-field-context';
import { AgentSearchTextInput } from './agent-search-input';
import styles from './agent-search.module.css';
import { AgentSearchItem } from './AgentSearchItem';
import { AgentOption } from './types';

type AgentSearchProps = {
    onCancel: () => void;
};

/**
 * Generic agent search field
 */
export const AgentSearchField = ({ onCancel }: AgentSearchProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON);
    const {
        search,
        searchQuery,
        selectAgent,
        agentOptions,
        isLoading,
        isFetching,
    } = useAgentFieldContext();

    const handleSelectAgent = useCallback(
        (agentOption: AgentOption) => {
            const hasAgentOption = agentOptions?.includes(agentOption);

            if (!hasAgentOption) {
                // Sanity check
                browserLogError('Invalid agentOption selected', {
                    agentOption,
                });
                return;
            }

            selectAgent(agentOption);
            onCancel();
        },
        [agentOptions, selectAgent, onCancel]
    );

    const optionElements = agentOptions?.map((agentOption) => {
        return (
            <AgentSearchItem
                key={agentOption?.lookupId || agentOption?.npn}
                agentOption={agentOption}
                onSelect={handleSelectAgent}
            />
        );
    });

    const determineRender = () => {
        if (isLoading) {
            return (
                <div
                    className={clsx(
                        styles.resultContainer,
                        styles.loaderContainer
                    )}
                >
                    <Loader />
                </div>
            );
        }

        if (searchQuery && !agentOptions?.length) {
            return (
                <Typography
                    variant={TypographyVariant.BodySm}
                    className={clsx(
                        styles.resultContainer,
                        styles.errorMessage
                    )}
                >
                    {t('clientCase.createClientCaseForm.searchAgent.notFound', {
                        agentName: searchQuery,
                    })}
                </Typography>
            );
        }

        if (agentOptions?.length) {
            return (
                <div
                    className={clsx(
                        styles.resultContainer,
                        styles.scrollableContainer
                    )}
                >
                    <Typography variant={TypographyVariant.FieldLabel}>
                        Results: {agentOptions.length}
                    </Typography>
                    {optionElements}
                </div>
            );
        }

        return null;
    };

    return (
        <div className={styles.searchFieldContainer}>
            <AgentSearchTextInput
                disabled={isFetching}
                onSearch={search}
                onCancel={onCancel}
            />
            {determineRender()}
        </div>
    );
};
