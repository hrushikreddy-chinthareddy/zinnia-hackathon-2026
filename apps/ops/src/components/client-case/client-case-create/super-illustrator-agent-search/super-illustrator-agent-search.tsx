import { useQueries, useQuery } from '@tanstack/react-query';
import {
    Tooltip,
    Label,
    Icon,
    IconType,
    FieldData,
    FieldSize,
    Button,
    Loader,
    FieldStatus,
    FieldTypes,
} from '@zinnia/bloom/components';
import clsx from 'clsx';
import { useTranslation } from 'next-i18next';
import { useEffect, useState } from 'react';

import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import { TranslationFiles } from '@deps/config/translations';
import { usePermissionsContext } from '@deps/contexts/PermissionsContext';
import {
    getProducersByIdQuery,
    getProducersByNameAndCarrierCodeQuery,
} from '@deps/queries/tanstack/producerQueries/producerQueries';
import { ReactComponent as CircleInfoIcon } from '@deps/styles/elements/icons/circles/circle-info.svg';
import { ReactComponent as EditIcon } from '@deps/styles/elements/icons/icons_outlined/edit.svg';
import { ProducerSearchResult } from '@deps/types/producers';

import styles from './super-illustrator-agent-search.module.css';

interface DynamicObject {
    [key: string]: any;
}

interface SuperIllustratorAgentSearchProps {
    onSelectAgent: (args0: DynamicObject) => void;
    shouldShowEdit: boolean;
}

const ENTER_KEY_NAME = 'enter';

export const SuperIllustratorAgentSearch = ({
    onSelectAgent,
    shouldShowEdit,
}: SuperIllustratorAgentSearchProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, {});
    const [isEditing, setIsEditing] = useState(false);
    const { writeClientCaseCarriers } = usePermissionsContext();
    const [agentNameInput, setAgentNameInput] = useState('');
    const [searchValue, setSearchValue] = useState<string | null>(null);
    const [selectedAgent, setSelectedAgent] = useState<ProducerSearchResult>();
    const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
    const [searchFieldError, setSearchFieldError] = useState('');

    const agentInfoResultClassname = clsx(
        styles.agentContainer,
        styles.agentInfoResult
    );
    const agentEmailResultClassname = clsx(
        styles.agentEmail,
        styles.agentEmailResult
    );

    const handleSelectAgent = (agent: ProducerSearchResult) => {
        setSelectedAgent(agent);
        setSelectedAgentId(agent.lookupId);
    };

    const clearAll = () => {
        setIsEditing(false);
        setAgentNameInput('');
        setSelectedAgentId(null);
        setSearchValue(null);
        setSearchFieldError('');
    };

    // When users hit the search button, we loop through all carriers they have permissions for
    // and fetch the producers per carrier. Then combine into a single list.
    const { data: producersData, isFetching } = useQueries({
        queries: writeClientCaseCarriers.map((writeClientCaseCarrier) => {
            return {
                queryKey: [
                    'getProducersByNameAndCarrierCodeQuery',
                    searchValue,
                    writeClientCaseCarrier.toUpperCase(),
                ],
                queryFn: () =>
                    getProducersByNameAndCarrierCodeQuery(
                        searchValue || '',
                        writeClientCaseCarrier.toUpperCase()
                    ),
                enabled: !!searchValue && searchValue.length > 0,
                staleTime: 60 * 1000 * 5,
            };
        }),

        combine: (results) => {
            return {
                data: results
                    .map((result) => {
                        if (result.data) {
                            return result.data?.producers;
                        } else {
                            return [];
                        }
                    })
                    .flat(),
                isFetching: results.some((result) => result.isFetching),
                hasError: results.some((result) => result.isError),
            };
        },
    });

    const { data: agentData, isFetching: isFetchingAgent } = useQuery({
        queryKey: ['getProducerData', selectedAgentId],
        queryFn: () => getProducersByIdQuery(selectedAgentId ?? ''),
        enabled: !!selectedAgentId,
    });

    // We get agent data back when the user selects an agent in the list.
    // This side effect fires when the agent information call finishes
    useEffect(() => {
        if (agentData && selectedAgentId) {
            const agentDetails = {
                firstName: agentData?.firstName,
                lastName: agentData?.lastName,
                fullName: agentData?.fullName,
                email: agentData?.email,

                sellingCode:
                    agentData?.carrierSellingCodeRoles?.['FNWL']?.[0]
                        ?.sellingCode, //TODO: Dymically handle this
            };
            onSelectAgent({
                agentDetails: agentDetails,
            });
            clearAll();
        }
    }, [agentData, onSelectAgent, selectedAgentId]);

    const renderSearchResults = () => {
        return producersData?.map((producer, index) => (
            <div
                className={agentInfoResultClassname}
                key={`${index}-${producer?.lookupId}-${producer?.email}`}
            >
                <Typography
                    variant={TypographyVariant.BodySm}
                    className={styles.agentNameResult}
                >
                    {producer?.name}
                </Typography>
                <Typography
                    variant={TypographyVariant.FieldLabel}
                    className={agentEmailResultClassname}
                >
                    {producer?.email}
                </Typography>
                <Button
                    mode="link"
                    data-testid="new-client-case-btn"
                    aria-label={t('ariaLabel.search') as string}
                    type="button"
                    size="small"
                    className={styles.addAgentButton}
                    disabled={isFetchingAgent}
                    onClick={() => handleSelectAgent(producer)}
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
        if (isFetching && producersData.length === 0) {
            return (
                <div className={styles.loaderContainer}>
                    <Loader />
                </div>
            );
        }
        if (producersData.length > 0) {
            return (
                <div>
                    <Typography variant={TypographyVariant.FieldLabel}>
                        Result: {producersData.length}
                    </Typography>
                    {searchValue && renderSearchResults()}
                </div>
            );
        } else if (searchValue && producersData.length === 0 && !isFetching) {
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

        return null;
    };

    const handleSearch = (agentInput: string) => {
        if (agentInput.length < 3) {
            setSearchFieldError('Search must include at least 3 characters');
            return;
        }

        setSearchFieldError('');
        setSearchValue(agentInput);
    };

    return (
        <div
            onKeyDown={(event) => {
                if (event.key.toLowerCase() === ENTER_KEY_NAME) {
                    setSearchValue(agentNameInput);
                }
            }}
        >
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
                            <FieldData
                                fieldType={FieldTypes.Search}
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
                                    setAgentNameInput(e.target.value);
                                }}
                                fieldStatus={
                                    searchFieldError
                                        ? FieldStatus.ERROR
                                        : FieldStatus.DEFAULT
                                }
                                errorMessage={searchFieldError}
                            />
                        </div>
                        <Button
                            mode="secondary"
                            data-testid="client-case-search-bar-search-btn"
                            aria-label={t('ariaLabel.search') as string}
                            onClick={() => handleSearch(agentNameInput)}
                            size="small"
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
                            {selectedAgent?.name}
                        </Typography>
                        <Typography
                            variant={TypographyVariant.BodySm}
                            className={styles.agentEmail}
                        >
                            {selectedAgent?.email}
                        </Typography>
                    </div>
                    {shouldShowEdit && (
                        <EditIcon
                            color="blue"
                            height={'20px'}
                            width={'20px'}
                            className={styles.editIcon}
                            onClick={() => setIsEditing(!isEditing)}
                        />
                    )}
                </div>
            )}
        </div>
    );
};
