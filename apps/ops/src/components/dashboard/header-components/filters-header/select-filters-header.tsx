import { Label, SelectFilter } from '@zinnia/bloom/components';
import clsx from 'clsx';
import { SetStateAction, useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import styles from '@deps/components/dashboard/header-components/filters-header/select-filters-header.module.css';
import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import { DashboardResponseData } from '@deps/queries/api/dashboard';
import { useDashboardStore } from '@deps/store/store';
import { getCarrierNameByClientId } from '@deps/utils/carriers';

import {
    combineDuplicateLabels,
    getBrokerDealerOptions,
} from './select-filters-header.helpers';
import { DashboardTabNav } from '../../dashboard-nav-links';

export const SelectFiltersHeader = ({
    authorizedCarriers,
    brokerDealersSSR,
    carrierHeaderIsIntersecting,
    carrierHeaderEntry,
    path,
}: {
    brokerDealersSSR: DashboardResponseData[];
    authorizedCarriers: string[];
    carrierHeaderIsIntersecting: boolean;
    carrierHeaderEntry?: IntersectionObserverEntry;
    path?: string;
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

    const authorizedCarriersOptions = useMemo(() => {
        const authorizedCarriersObjects = authorizedCarriers.map((carrier) => ({
            value: carrier,
            label: getCarrierNameByClientId(carrier) || carrier.toUpperCase(),
        }));
        return combineDuplicateLabels(authorizedCarriersObjects);
    }, [authorizedCarriers]);

    const brokerDealerOptions = useMemo(() => {
        return getBrokerDealerOptions(brokerDealersSSR);
    }, [brokerDealersSSR]);

    return (
        <div
            id="carrier-header"
            ref={setContainerRef}
            className={clsx('flex-wrap', styles.filtersHeader, {
                [styles.pinned as string]:
                    carrierHeaderIsIntersecting ||
                    Number(carrierHeaderEntry?.boundingClientRect.bottom) < 64,
            })}
        >
            <Typography
                className="flex items-center"
                variant={TypographyVariant.H1}
                data-testid="header-text"
            >
                {t('site.pageTitles.analytics')}
            </Typography>
            <div className={styles.filters}>
                <SelectFilter
                    options={authorizedCarriersOptions}
                    label={<Label>{t('allFields.carriers')}</Label>}
                    onValueChange={updateSelectedCarriers}
                    container={container}
                    values={selectedCarriers}
                />
                <SelectFilter
                    key={`carrier-${selectedCarriers.join('-')}`}
                    options={brokerDealerOptions}
                    label={<Label>{t('allFields.distributors')}</Label>}
                    onValueChange={updateSelectedBrokerDealers}
                    container={container}
                    values={selectedBrokerDealers}
                />
            </div>
            <div className={styles.tabsNav}>
                <DashboardTabNav path={path} />
            </div>
        </div>
    );
};
