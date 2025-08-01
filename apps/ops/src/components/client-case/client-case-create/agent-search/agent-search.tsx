import {
    Tooltip,
    Label,
    Icon,
    IconType,
    FieldData,
    FieldSize,
    Button,
    Loader,
} from '@zinnia/bloom/components';
import clsx from 'clsx';
import { useTranslation } from 'next-i18next';
import { useState } from 'react';

import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import { TranslationFiles } from '@deps/config/translations';
import { ReactComponent as CircleInfoIcon } from '@deps/styles/elements/icons/circles/circle-info.svg';
import { IllustrationAgentDetails } from '@deps/types/illustrations';

import styles from './agent-search.module.css';

interface DynamicObject {
    [key: string]: any;
}

interface AgentSearchProps {
    currentAgentData: IllustrationAgentDetails;
    onSelectAgent: (args0: DynamicObject) => void;
}

const MOCK_AGENTS_LIST: IllustrationAgentDetails[] = [
    {
        firstName: 'Tim',
        lastName: 'Apple',
        email: 'tim.apple@domain.com',
        sellingCode: 'aa',
        npn: 'a',
    },
    {
        firstName: 'Cindy',
        lastName: 'Mercer',
        email: 'cmercer@domain.com',
        sellingCode: 'bb',
        npn: 'b',
    },
    {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@domain.com',
        sellingCode: 'cc',
        npn: 'c',
    },
];

export const AgentSearch = ({
    currentAgentData,
    onSelectAgent,
}: AgentSearchProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, {});
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isNotFound, setIsNotFound] = useState(false);
    const [agentNameInput, setAgentNameInput] = useState('');
    const [searchResults, setSearchResults] = useState<
        IllustrationAgentDetails[]
    >([]);
    const [selectedAgent, setCurrentAgent] =
        useState<IllustrationAgentDetails>(currentAgentData);
    const agentInfoResultClassname = clsx(
        styles.agentContainer,
        styles.agentInfoResult
    );
    const agentEmailResultClassname = clsx(
        styles.agentEmail,
        styles.agentEmailResult
    );

    const lookForAgent = () => {
        const agentsFound = MOCK_AGENTS_LIST.filter((agent) => {
            const agentFullName = `${agent.firstName} ${agent.lastName}`;
            return agentFullName.toLocaleLowerCase().includes(agentNameInput);
        });
        return agentsFound;
    };

    // TODO replace with API call
    const onSearch = () => {
        setSearchResults([]);
        setLoading(true);
        setIsNotFound(false);
        setTimeout(() => {
            const result = lookForAgent();
            if (result.length > 0) {
                setSearchResults(result);
            } else {
                setIsNotFound(true);
            }
            setLoading(false);
        }, 1000);
    };

    const clearAll = () => {
        setIsEditing(false);
        setLoading(false);
        setIsNotFound(false);
        setAgentNameInput('');
        setSearchResults([]);
    };

    const updateAgent = (email: string | undefined) => {
        const selectedAgent = searchResults.find((result) => {
            return result.email === email;
        }) as IllustrationAgentDetails;
        setCurrentAgent(selectedAgent);
        onSelectAgent({
            agentDetails: selectedAgent,
        });
        clearAll();
    };

    const renderSearchResults = () => {
        return searchResults.map((searchResult) => (
            <div className={agentInfoResultClassname} key={searchResult.email}>
                <Typography
                    variant={TypographyVariant.BodySm}
                    className={styles.agentNameResult}
                >
                    {searchResult.firstName} {searchResult.lastName}
                </Typography>
                <Typography
                    variant={TypographyVariant.FieldLabel}
                    className={agentEmailResultClassname}
                >
                    {searchResult.email}
                </Typography>
                <Button
                    mode="link"
                    data-testid="new-client-case-btn"
                    aria-label={t('ariaLabel.search') as string}
                    type="button"
                    size="small"
                    className={styles.addAgentButton}
                    onClick={() => updateAgent(searchResult.email)}
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
        ));
    };

    const determineRender = () => {
        if (loading) {
            return (
                <div className={styles.loaderContainer}>
                    <Loader />
                </div>
            );
        } else if (searchResults.length > 0) {
            return (
                <div>
                    <Typography variant={TypographyVariant.FieldLabel}>
                        Result: {searchResults.length}
                    </Typography>
                    {renderSearchResults()}
                </div>
            );
        } else if (isNotFound) {
            return (
                <Typography
                    variant={TypographyVariant.BodySm}
                    className={styles.errorMessage}
                >
                    {t('clientCase.createClientCaseForm.searchAgent.notFound', {
                        agentName: agentNameInput,
                    })}
                </Typography>
            );
        }

        return <></>;
    };

    return (
        <div>
            <Label
                interactiveElements={[
                    <Tooltip
                        key="agentTooltip"
                        trigger={
                            <CircleInfoIcon
                                height={'16px'}
                                width={'16px'}
                                className="text-primary"
                            />
                        }
                    >
                        {t('clientCase.clientCaseTable.agentTooltip')}
                    </Tooltip>,
                ]}
            >
                {t('clientCase.clientCaseTable.agent')}
            </Label>
            {isEditing ? (
                <div className={styles.editContainer}>
                    <div className={styles.editForm}>
                        <div className={clsx(styles.searchInputWithIcon)}>
                            <Icon
                                type={IconType.SEARCH}
                                height={24}
                                width={24}
                                className={styles.searchInputIcon}
                            />
                            <FieldData
                                aria-label={
                                    t(
                                        'clientCase.searchBar.agentName'
                                    ) as string
                                }
                                fieldSize={FieldSize.Small}
                                placeholder={
                                    t(
                                        'clientCase.searchBar.agentName'
                                    ) as string
                                }
                                className={clsx(styles.searchInput)}
                                onChange={(e) => {
                                    setIsNotFound(false);
                                    setAgentNameInput(e.target.value);
                                }}
                            />
                        </div>
                        <Button
                            mode="secondary"
                            data-testid="client-case-search-bar-search-btn"
                            aria-label={t('ariaLabel.search') as string}
                            onClick={onSearch}
                            size="small"
                            disabled={loading}
                        >
                            {t('dashboard.search.btnText')}
                        </Button>
                    </div>
                    {determineRender()}
                </div>
            ) : (
                <div className={styles.agentContainer}>
                    <div className={styles.agentInfo}>
                        <Typography variant={TypographyVariant.BodySm}>
                            {selectedAgent.firstName} {selectedAgent.lastName}
                        </Typography>
                        <Typography
                            variant={TypographyVariant.BodySm}
                            className={styles.agentEmail}
                        >
                            {selectedAgent.email}
                            {/* (
                            {t(
                                'clientCase.createClientCaseForm.searchAgent.current'
                            )}
                            ) */}
                        </Typography>
                    </div>
                    {/* leave commented until the search api is ready */}
                    {/* <EditIcon
                        color="blue"
                        height={'20px'}
                        width={'20px'}
                        className={styles.editIcon}
                        onClick={() => setIsEditing(!isEditing)}
                    />  */}
                </div>
            )}
        </div>
    );
};
