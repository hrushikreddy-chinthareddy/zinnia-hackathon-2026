import { Label, SelectFilter } from '@zinnia/bloom/components';
import {
    SetStateAction,
    useCallback,
    useEffect,
    useMemo,
    useState,
} from 'react';
import { useTranslation } from 'react-i18next';

import styles from '@deps/components/dashboard/header-components/filters-header/select-filters-header.module.css';
import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import {
    DashboardResponseData,
    fetchAgents,
} from '@deps/queries/api/dashboard';
import { useDashboardStore } from '@deps/store/store';
import { getCarrierNameByClientId } from '@deps/utils/carriers';

import { getBrokerDealerOptions } from './filters-header.helpers';

export const SelectFiltersHeader = ({
    authorizedCarriers,
    brokerDealersSSR,
}: {
    brokerDealersSSR: DashboardResponseData[];
    authorizedCarriers: string[];
}) => {
    const { t } = useTranslation();
    const [container, setContainer] = useState<HTMLDivElement | null>(null);
    const setContainerRef = useCallback(
        (node: SetStateAction<HTMLDivElement | null>) => {
            setContainer(node);
        },
        []
    );
    const {
        updateSelectedCarriers,
        updateSelectedBrokerDealers,
        selectedCarriers,
        selectedBrokerDealers,
    } = useDashboardStore((state) => state);

    const authorizedCarriersOptions = authorizedCarriers.map((carrier) => ({
        value: carrier,
        label: getCarrierNameByClientId(carrier) || carrier.toUpperCase(),
        //label: getCarrierListItem(carrier),
    }));

    const brokerDealerOptions = useMemo(() => {
        return getBrokerDealerOptions(brokerDealersSSR);
    }, [brokerDealersSSR]);

    // const clearFilters = () => {
    //     updateSelectedCarriers([]);
    //     updateSelectedBrokerDealers([]);
    // };

    // const clearFiltersDisabled =
    //     Object.keys({
    //         ...selectedCarriers,
    //         ...selectedBrokerDealers,
    //     }).length === 0;

    useEffect(() => {
        const fetchBrokerDealersClient = async () => {
            const brokerDealerArray = await fetchAgents();
            console.log({ brokerDealerArray });
            updateSelectedBrokerDealers([]);
        };

        if (!selectedBrokerDealers) {
            fetchBrokerDealersClient();
        }
    }, [selectedBrokerDealers, updateSelectedBrokerDealers]);

    console.log({ selectedCarriers, selectedBrokerDealers });

    return (
        <div
            id="carrier-header"
            className={styles.filtersHeader}
            ref={setContainerRef}
        >
            <Typography
                className="flex items-center"
                variant={TypographyVariant.H1}
                data-testid="header-text"
            >
                {t('caseStatsDashboardTitle')}
            </Typography>
            <div className={styles.filters}>
                <SelectFilter
                    options={authorizedCarriersOptions}
                    label={<Label>{t('allCarriers')}</Label>}
                    onValueChange={updateSelectedCarriers}
                    container={container}
                    values={selectedCarriers}
                />
                <SelectFilter
                    key={`carrier-${selectedCarriers.join('-')}`}
                    options={brokerDealerOptions}
                    label={<Label>{t('allDistributors')}</Label>}
                    onValueChange={updateSelectedBrokerDealers}
                    container={container}
                    values={selectedBrokerDealers}
                />
                {/* <Button
                    className="flex items-center align-middle flex-row"
                    mode="link"
                    disabled={clearFiltersDisabled}
                    size={ButtonSize.Small}
                    onClick={clearFilters}
                >
                    <Icon type={IconType.CLOSE} />
                    clear
                </Button> */}
            </div>
        </div>
    );
};
