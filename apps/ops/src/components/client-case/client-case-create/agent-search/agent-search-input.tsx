import {
    Icon,
    IconType,
    FieldData,
    FieldSize,
    Button,
} from '@zinnia/bloom/components';
import clsx from 'clsx';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

import IconButton from '@deps/components/icon-button/icon-button';
import { TranslationFiles } from '@deps/config/translations';

import styles from './agent-search.module.css';

const ENTER_KEY_NAME = 'enter';

type AgentSearchTextInputProps = {
    onSearch: (searchText: string) => void;
    onCancel: () => void;
    disabled?: boolean;
};

export const AgentSearchTextInput = ({
    onSearch,
    onCancel,
    disabled,
}: AgentSearchTextInputProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, {});
    const [searchQuery, setSearchQuery] = useState('');

    const isValid = searchQuery.length >= 3;

    const handleSearch = useCallback(() => {
        if (!isValid) {
            return;
        }
        onSearch(searchQuery);
    }, [onSearch, isValid, searchQuery]);

    return (
        <div
            className={styles.editForm}
            onKeyDown={(event) => {
                if (event.key.toLowerCase() === ENTER_KEY_NAME) {
                    handleSearch();
                }
            }}
        >
            <div className={clsx(styles.searchInputWithIcon)}>
                <Icon
                    type={IconType.SEARCH}
                    height={24}
                    width={24}
                    className={styles.searchInputIcon}
                />
                <FieldData
                    className={clsx(styles.searchInput)}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    aria-label={t('clientCase.searchBar.agentName') as string}
                    fieldSize={FieldSize.Small}
                    placeholder={t('clientCase.searchBar.agentName') as string}
                />
                {searchQuery && (
                    <div className={styles.searchCancelIcon}>
                        <IconButton onClick={onCancel}>
                            <Icon
                                type={IconType.CLOSE}
                                height={24}
                                width={24}
                            />
                        </IconButton>
                    </div>
                )}
            </div>
            <Button
                mode="secondary"
                data-testid="client-case-search-bar-search-btn"
                aria-label={t('ariaLabel.search') as string}
                onClick={handleSearch}
                size="small"
                disabled={disabled || !isValid}
            >
                {t('dashboard.search.btnText')}
            </Button>
        </div>
    );
};
