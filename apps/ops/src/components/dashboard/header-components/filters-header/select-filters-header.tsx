import {
    Button,
    Icon,
    IconType,
    Label,
    SelectFilter,
} from '@zinnia/bloom/components';
import { SetStateAction, useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ButtonSize } from '@deps/components/button/button';
import styles from '@deps/components/dashboard/header-components/filters-header/select-filters-header.module.css';
import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import { DashboardResponseData } from '@deps/queries/api/dashboard';
import { useDashboardStoreSelectFilter } from '@deps/store/store';
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
    } = useDashboardStoreSelectFilter((state) => state);

    const authorizedCarriersOptions = authorizedCarriers.map((carrier) => ({
        value: carrier,
        label: getCarrierNameByClientId(carrier) || carrier.toUpperCase(),
        //label: getCarrierListItem(carrier),
    }));

    const brokerDealerOptions = useMemo(() => {
        return getBrokerDealerOptions(brokerDealersSSR);
    }, [brokerDealersSSR]);

    const clearFilters = () => {
        updateSelectedCarriers([]);
        updateSelectedBrokerDealers([]);
    };

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
                <div>
                    <SelectFilter
                        options={authorizedCarriersOptions}
                        label={<Label>{t('allCarriers')}</Label>}
                        onValueChange={updateSelectedCarriers}
                        container={container}
                    />
                </div>
                <div>
                    <SelectFilter
                        options={brokerDealerOptions}
                        label={<Label>{t('allDistributors')}</Label>}
                        onValueChange={updateSelectedBrokerDealers}
                        container={container}
                    />
                </div>
                <div>
                    <Button
                        className="flex items-center align-middle flex-row"
                        mode="link"
                        disabled={false}
                        size={ButtonSize.Small}
                        onClick={clearFilters}
                    >
                        <Icon width={16} height={16} type={IconType.CLOSE} />
                        clear
                    </Button>
                </div>
            </div>
        </div>
    );
};
