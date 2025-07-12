import {
    Button,
    FieldData,
    FieldSize,
    Icon,
    IconType,
    Select,
} from '@zinnia/bloom/components';
import clsx from 'clsx';
import { useTranslation } from 'next-i18next';
import { useEffect, useState } from 'react';

import { TranslationFiles } from '@deps/config/translations';
import { useIllustrationsClientCase } from '@deps/contexts/illustrations/IllustrationsClientCaseContext';
import { ClientCaseSearchInputs } from '@deps/types/illustrations';

import styles from './client-case-search-bar.module.css';

// interface ClientCaseSearchBarProps {
//     onSubmit: (value: string) => void;
// }

type SearchType = 'caseTitle' | 'agentName' | 'insuredName';

function searchTypeFromFilters(
    filters: ClientCaseSearchInputs
): SearchType | null {
    if (filters.insuredFirstName || filters.insuredLastName) {
        return 'insuredName';
    }

    if (filters.agentFirstName || filters.agentLastName) {
        return 'agentName';
    }

    if (filters.title) {
        return 'caseTitle';
    }

    return null;
}

const ClientCaseSearchBar: React.FC<{}> = () => {
    const { t } = useTranslation(TranslationFiles.COMMON);

    const { filters, setFilters } = useIllustrationsClientCase();
    const [searchType, setSearchType] = useState<SearchType>(
        searchTypeFromFilters(filters) ?? 'caseTitle'
    );
    const [insuredFirstName, setInsuredFirstName] = useState(
        filters.insuredFirstName
    );
    const [insuredLastName, setInsuredLastName] = useState(
        filters.insuredLastName
    );
    const [agentFirstName, setAgentFirstName] = useState(
        filters.agentFirstName
    );
    const [agentLastName, setAgentLastName] = useState(filters.agentLastName);
    const [caseTitle, setCaseTitle] = useState(filters.title);
    const [limit, setLimit] = useState(filters.limit);
    const [offset, setOffset] = useState(filters.offset);

    useEffect(() => {
        setInsuredFirstName(filters.insuredFirstName);
        setInsuredLastName(filters.insuredLastName);
        setAgentFirstName(filters.agentFirstName);
        setAgentLastName(filters.agentLastName);
        setSearchType(
            (lastSearchType) => searchTypeFromFilters(filters) ?? lastSearchType
        );
        setCaseTitle(filters.title);
        setLimit(filters.limit);
        setOffset(filters.offset);
    }, [filters]);

    const handleSearch = (e: any) => {
        e.preventDefault();

        setFilters({
            insuredFirstName,
            insuredLastName,
            agentFirstName,
            agentLastName,
            title: caseTitle,
        });
    };

    const handleSearchTypechange = (value: SearchType) => {
        setSearchType(value);
        setFilters({
            insuredFirstName: value === 'insuredName' ? insuredFirstName : '',
            insuredLastName: value === 'insuredName' ? insuredLastName : '',
            agentFirstName: value === 'agentName' ? agentFirstName : '',
            agentLastName: value === 'agentName' ? agentLastName : '',
            title: value === 'caseTitle' ? caseTitle : '',
        });
    };

    return (
        <form className={clsx(styles.searchForm)}>
            <div className={clsx(styles.searchParams)}>
                <Select
                    id="field-select"
                    fieldSize={FieldSize.Small}
                    triggerClassName={clsx(styles.searchType)}
                    onValueChange={handleSearchTypechange}
                    value={searchType}
                    options={[
                        {
                            textValue: t('clientCase.searchBar.clientCase'),
                            value: 'caseTitle',
                        },
                        {
                            textValue: t('clientCase.searchBar.agentName'),
                            value: 'agentName',
                        },
                        {
                            textValue: t('clientCase.searchBar.insuredName'),
                            value: 'insuredName',
                        },
                    ]}
                />
                <div className={clsx(styles.searchInputWithIcon)}>
                    <Icon
                        type={IconType.SEARCH}
                        height={24}
                        width={24}
                        className={clsx(styles.searchInputIcon)}
                    />
                    {searchType === 'caseTitle' && (
                        <FieldData
                            aria-label={
                                t(
                                    'clientCase.searchBar.searchByClientCase'
                                ) as string
                            }
                            fieldSize={FieldSize.Small}
                            placeholder={
                                t(
                                    'clientCase.searchBar.searchByClientCase'
                                ) as string
                            }
                            className={clsx(styles.searchInput)}
                            value={caseTitle}
                            onChange={(e) => setCaseTitle(e.target.value)}
                        />
                    )}
                    {searchType === 'insuredName' && (
                        <FieldData
                            aria-label={
                                t('clientCase.searchBar.firstName') as string
                            }
                            fieldSize={FieldSize.Small}
                            placeholder={
                                t('clientCase.searchBar.firstName') as string
                            }
                            className={clsx(
                                styles.searchInput,
                                styles.inputOne
                            )}
                            value={insuredFirstName}
                            onChange={(e) =>
                                setInsuredFirstName(e.target.value)
                            }
                        />
                    )}
                    {searchType === 'agentName' && (
                        <FieldData
                            aria-label={
                                t('clientCase.searchBar.firstName') as string
                            }
                            fieldSize={FieldSize.Small}
                            placeholder={
                                t('clientCase.searchBar.firstName') as string
                            }
                            className={clsx(
                                styles.searchInput,
                                styles.inputOne
                            )}
                            value={agentFirstName}
                            onChange={(e) => setAgentFirstName(e.target.value)}
                        />
                    )}
                </div>

                {(searchType === 'insuredName' ||
                    searchType === 'agentName') && (
                    <div className={clsx(styles.searchInputWithIcon)}>
                        <Icon
                            type={IconType.SEARCH}
                            height={24}
                            width={24}
                            className={clsx(styles.searchInputIcon)}
                        />
                        {searchType === 'insuredName' && (
                            <FieldData
                                aria-label={
                                    t('clientCase.searchBar.lastName') as string
                                }
                                fieldSize={FieldSize.Small}
                                placeholder={
                                    t('clientCase.searchBar.lastName') as string
                                }
                                className={clsx(
                                    styles.searchInput,
                                    styles.inputTwo
                                )}
                                value={insuredLastName}
                                onChange={(e) =>
                                    setInsuredLastName(e.target.value)
                                }
                            />
                        )}
                        {searchType === 'agentName' && (
                            <FieldData
                                aria-label={
                                    t('clientCase.searchBar.lastName') as string
                                }
                                fieldSize={FieldSize.Small}
                                placeholder={
                                    t('clientCase.searchBar.lastName') as string
                                }
                                className={clsx(
                                    styles.searchInput,
                                    styles.inputTwo
                                )}
                                value={agentLastName}
                                onChange={(e) => {
                                    setAgentLastName(e.target.value);
                                }}
                            />
                        )}
                    </div>
                )}
            </div>
            <div className={clsx(styles.searchAction)}>
                <Button
                    mode="primary"
                    data-testid="client-case-search-bar-search-btn"
                    aria-label={t('ariaLabel.search') as string}
                    type="submit"
                    size="small"
                    onClick={(e) => handleSearch(e)}
                >
                    {t('dashboard.search.btnText')}
                </Button>
            </div>
        </form>
    );
};

export default ClientCaseSearchBar;
