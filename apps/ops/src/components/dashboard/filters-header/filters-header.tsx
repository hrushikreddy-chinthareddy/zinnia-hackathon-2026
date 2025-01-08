import clsx from 'clsx';
import { useTranslation } from 'next-i18next';
import { forwardRef, useMemo, useState } from 'react';

import { MultiselectOption } from '@deps/components/autocomplete/autocomplete.types';
import { BrokerDealerFilter } from '@deps/components/dashboard/broker-dealer-filter/broker-dealer-filter';
import styles from '@deps/components/dashboard/filters-header/filters-header.module.css';
import { FieldSize } from '@deps/components/fields/field';
import Select from '@deps/components/select/select';
import Typography, { TypographyVariant } from '@deps/components/typography/typography';
import { TranslationFiles } from '@deps/config/translations';
import { CarrierListItem } from '@deps/containers/dashboard/issued-business/issued-business';
import { DashboardResponseData } from '@deps/queries/api/dashboard';
import { useDashboardStore } from '@deps/store/store';
import { getCarrierNameByClientId, getClientIdsByCarrierName, getCarrierListItem } from '@deps/utils/carriers';

interface FiltersHeaderProps {
    authorizedCarriers: string[];
    brokerDealersSSR: DashboardResponseData[];
    carrierHeaderIsIntersecting: boolean;
    carrierHeaderEntry?: IntersectionObserverEntry;
    loading: boolean;
}

const getUniqueCarrierFilterItems = (carrierFilterItems: MultiselectOption[]): MultiselectOption[] => {
    const carrierLabels = new Set();

    const uniqueCarrierFilterItems = (
        carrierFilterItems.filter(item => {
            if (carrierLabels.has(item.displayText)) {
                return false;
            }

            carrierLabels.add(item.displayText);
            return true;
        }) as typeof carrierFilterItems
    ).sort((item1, item2) => item1.displayText.localeCompare(item2.displayText));
    return uniqueCarrierFilterItems;
};

//TODO: Rename this

//MONDAY TODO:
/**
 * CODE REVIEW:
 * Chat about onOpenChange for the broker dealers
 * Chat about a better way to handle the temp state when opening the select and then closing it
 * Maybe refactor how the options get passed into the select dropdowns?
 *
 * Question: Is it possible to have both selected carrier and broker dealer? Some filters specify.
 */

const FiltersHeader = forwardRef<HTMLDivElement, FiltersHeaderProps>(
    ({ authorizedCarriers, brokerDealersSSR, carrierHeaderIsIntersecting, carrierHeaderEntry, loading }, ref) => {
        const { t } = useTranslation(TranslationFiles.COMMON);

        const carrierFilterItems = useMemo(
            () =>
                authorizedCarriers.map((carrierCode: string) => {
                    const valueAndDisplay = getCarrierNameByClientId(carrierCode) || carrierCode.toUpperCase();

                    return {
                        value: getClientIdsByCarrierName(authorizedCarriers, valueAndDisplay) || carrierCode.toUpperCase(),
                        displayText: valueAndDisplay,
                        label: getCarrierListItem(carrierCode),
                    };
                }),
            [authorizedCarriers]
        );

        const { updateSelectedCarriers, updateSelectedBrokerDealers } = useDashboardStore(state => state);

        const [brokerDealers, setBrokerDealers] = useState<DashboardResponseData[]>(brokerDealersSSR || []);

        const [placeholderSelectedCarriers, setPlaceholderSelectedCarriers] = useState<CarrierListItem>(
            carrierFilterItems.length === 1 ? { [carrierFilterItems[0].value]: carrierFilterItems[0].displayText } : {}
        );
        const [selectedBrokerDealers, setSelectedBrokerDealers] = useState<CarrierListItem>(
            brokerDealers?.length === 1 ? { [brokerDealers[0].key]: brokerDealers[0].name } : {}
        );

        const options = useMemo(() => {
            return getUniqueCarrierFilterItems(carrierFilterItems);
        }, [carrierFilterItems]);

        const updateCarrierFilters = (value: string, displayText: string) => {
            setPlaceholderSelectedCarriers(prevSelectedCarriers => {
                if (prevSelectedCarriers[value]) {
                    delete prevSelectedCarriers[value];
                    return { ...prevSelectedCarriers };
                } else {
                    return { ...prevSelectedCarriers, [value]: displayText };
                }
            });
        };

        const updateBrokerDealerFilters = (value: string, displayText: string) => {
            setSelectedBrokerDealers(prevSelectedAgents => {
                if (prevSelectedAgents[value]) {
                    delete prevSelectedAgents[value];
                    return { ...prevSelectedAgents };
                } else {
                    return { ...prevSelectedAgents, [value]: displayText };
                }
            });
        };

        const handleOnOpenChangeCarrier = (open: boolean) => {
            if (!open) {
                updateSelectedCarriers(placeholderSelectedCarriers);
            }
        };

        const handleOnOpenChangeBroker = (open: boolean) => {
            if (!open) {
                updateSelectedBrokerDealers(selectedBrokerDealers);
            }
        };
        return (
            <div
                ref={ref}
                id="carrier-header"
                className={clsx('flex-wrap', styles.filtersHeader, {
                    [styles.pinned as string]: carrierHeaderIsIntersecting || Number(carrierHeaderEntry?.boundingClientRect.bottom) < 64,
                })}
            >
                <Typography className="flex items-center" variant={TypographyVariant.H1} data-testid="header-text">
                    {t('caseStatsDashboardTitle')}
                </Typography>
                <div className="flex justify-between items-center">
                    <div className="flex nowrap gap-4">
                        <div className="w-52">
                            <Select
                                isMultiselect
                                options={options}
                                value={placeholderSelectedCarriers}
                                onChange={updateCarrierFilters}
                                size={FieldSize.Small}
                                placeholder={t('allCarriers') || ''}
                                disabled={loading}
                                name="carrier-dropdown-btn"
                                onOpenChange={handleOnOpenChangeCarrier}
                            />
                        </div>
                        <div className="w-52">
                            <BrokerDealerFilter
                                brokerDealers={brokerDealers}
                                selectedBrokerDealers={selectedBrokerDealers}
                                selectedCarriers={Object.keys(placeholderSelectedCarriers)}
                                setSelectedBrokerDealers={setBrokerDealers}
                                updateBrokerDealerFilters={updateBrokerDealerFilters}
                                disabled={loading}
                                handleOnOpenChangeBroker={handleOnOpenChangeBroker}
                            />
                        </div>
                    </div>
                </div>
            </div>
        );
    }
);

FiltersHeader.displayName = 'FiltersHeader';

export default FiltersHeader;
