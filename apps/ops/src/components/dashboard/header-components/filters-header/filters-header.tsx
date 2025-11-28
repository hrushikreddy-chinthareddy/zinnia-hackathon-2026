import { Button, Icon, IconType } from '@zinnia/bloom/components';
import clsx from 'clsx';
import { useTranslation } from 'next-i18next';
import { forwardRef, useCallback, useEffect, useMemo, useState } from 'react';

import { MultiselectOption } from '@deps/components/autocomplete/autocomplete.types';
import { ButtonSize } from '@deps/components/button/button';
import { BrokerDealerFilter } from '@deps/components/dashboard/header-components/broker-dealer-filter/broker-dealer-filter';
import styles from '@deps/components/dashboard/header-components/filters-header/filters-header.module.css';
import { CarrierListItem } from '@deps/components/dashboard/types';
import { FieldSize } from '@deps/components/fields/field';
import Select from '@deps/components/select/select';
import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import { TranslationFiles } from '@deps/config/translations';
import { DashboardResponseData } from '@deps/queries/api/dashboard';
import { useDashboardStore } from '@deps/store/store';
import {
    getCarrierNameByClientId,
    getClientIdsByCarrierName,
    getCarrierListItem,
} from '@deps/utils/carriers';
import { areObjectsEqual } from '@deps/utils/objects';
import { toTitleCase } from '@deps/utils/strings';

interface FiltersHeaderProps {
    authorizedCarriers: string[];
    brokerDealersSSR: DashboardResponseData[];
    carrierHeaderIsIntersecting: boolean;
    carrierHeaderEntry?: IntersectionObserverEntry;
}

const getUniqueCarrierFilterItems = (
    carrierFilterItems: MultiselectOption[]
): MultiselectOption[] => {
    const carrierLabels = new Set();

    const uniqueCarrierFilterItems = (
        carrierFilterItems.filter((item) => {
            if (carrierLabels.has(item.displayText)) {
                return false;
            }

            carrierLabels.add(item.displayText);
            return true;
        }) as typeof carrierFilterItems
    ).sort((item1, item2) =>
        item1.displayText.localeCompare(item2.displayText)
    );
    return uniqueCarrierFilterItems;
};

const FiltersHeader = forwardRef<HTMLDivElement, FiltersHeaderProps>(
    (
        {
            authorizedCarriers,
            brokerDealersSSR,
            carrierHeaderIsIntersecting,
            carrierHeaderEntry,
        },
        ref
    ) => {
        const { t } = useTranslation(TranslationFiles.COMMON);

        const carrierFilterItems = useMemo(
            () =>
                authorizedCarriers.map((carrierCode: string) => {
                    const valueAndDisplay =
                        getCarrierNameByClientId(carrierCode) ||
                        carrierCode.toUpperCase();

                    return {
                        value:
                            getClientIdsByCarrierName(
                                authorizedCarriers,
                                valueAndDisplay
                            ) || carrierCode.toUpperCase(),
                        displayText: valueAndDisplay,
                        label: getCarrierListItem(carrierCode),
                    };
                }),
            [authorizedCarriers]
        );

        const {
            updateSelectedCarriers,
            updateSelectedBrokerDealers,
            selectedCarriers,
            selectedBrokerDealers,
        } = useDashboardStore((state) => state);

        const [brokerDealers, setBrokerDealers] = useState<
            DashboardResponseData[]
        >(brokerDealersSSR || []);

        const [placeholderSelectedCarriers, setPlaceholderSelectedCarriers] =
            useState<CarrierListItem>(
                carrierFilterItems.length === 1
                    ? {
                          [carrierFilterItems[0].value]:
                              carrierFilterItems[0].displayText,
                      }
                    : {}
            );
        const [placeholderSelectedBrokerDealers, setSelectedBrokerDealers] =
            useState<CarrierListItem>(
                brokerDealers?.length === 1
                    ? {
                          [brokerDealers[0].name]: toTitleCase(
                              brokerDealers[0].name
                          ),
                      }
                    : {}
            );

        const options = useMemo(() => {
            return getUniqueCarrierFilterItems(carrierFilterItems);
        }, [carrierFilterItems]);

        // if user only has access to one broker dealer, update zustand with it
        useEffect(() => {
            if (brokerDealers.length === 1) {
                updateSelectedBrokerDealers({
                    [brokerDealers[0].name]: toTitleCase(brokerDealers[0].name),
                });
            }
        }, [brokerDealers, updateSelectedBrokerDealers]);

        // if user only has access to one carrier, update zustand with it
        useEffect(() => {
            if (carrierFilterItems.length === 1) {
                updateSelectedCarriers({
                    [carrierFilterItems[0].value]:
                        carrierFilterItems[0].displayText,
                });
            }
        }, [carrierFilterItems, updateSelectedCarriers]);

        const updateCarrierFilters = (value: string, displayText: string) => {
            setPlaceholderSelectedCarriers((prevSelectedCarriers) => {
                const copy = { ...prevSelectedCarriers };
                if (copy[value]) {
                    delete copy[value];
                    return { ...copy };
                } else {
                    return { ...copy, [value]: displayText };
                }
            });
        };

        const updateBrokerDealerFilters = (
            value: string,
            displayText: string
        ) => {
            setSelectedBrokerDealers((prevSelectedAgents) => {
                const copy = { ...prevSelectedAgents };
                if (copy[value]) {
                    delete copy[value];
                    return { ...copy };
                } else {
                    return { ...copy, [value]: displayText };
                }
            });
        };

        const handleOnOpenChangeCarrier = (open: boolean) => {
            if (!open) {
                if (
                    !areObjectsEqual(
                        selectedCarriers,
                        placeholderSelectedCarriers
                    )
                ) {
                    updateSelectedCarriers(placeholderSelectedCarriers);
                }
            }
        };

        const handleOnOpenChangeBroker = (open: boolean) => {
            if (!open) {
                if (
                    !areObjectsEqual(
                        selectedBrokerDealers,
                        placeholderSelectedBrokerDealers
                    )
                ) {
                    updateSelectedBrokerDealers(
                        placeholderSelectedBrokerDealers
                    );
                }
            }
        };

        const clearFilters = useCallback(() => {
            setPlaceholderSelectedCarriers({});
            setSelectedBrokerDealers({});
            updateSelectedBrokerDealers({});
            updateSelectedCarriers({});
        }, [
            setPlaceholderSelectedCarriers,
            setSelectedBrokerDealers,
            updateSelectedBrokerDealers,
            updateSelectedCarriers,
        ]);

        // Clear filters on component unmount
        useEffect(() => {
            return () => {
                clearFilters();
            };
        }, [clearFilters]);

        const clearFiltersDisabled =
            Object.keys({
                ...placeholderSelectedCarriers,
                ...placeholderSelectedBrokerDealers,
            }).length === 0;

        return (
            <div
                ref={ref}
                id="carrier-header"
                className={clsx('flex-wrap', styles.filtersHeader, {
                    [styles.pinned as string]:
                        carrierHeaderIsIntersecting ||
                        Number(carrierHeaderEntry?.boundingClientRect.bottom) <
                            64,
                })}
            >
                <Typography
                    className="flex items-center"
                    variant={TypographyVariant.H1}
                    data-testid="header-text"
                >
                    {t('caseStatsDashboardTitle')}
                </Typography>
                <div className="flex justify-between items-center">
                    <div className="flex nowrap gap-2 items-center align-middle">
                        <div className="w-52">
                            <Select
                                isMultiselect
                                options={options}
                                value={placeholderSelectedCarriers}
                                onChange={updateCarrierFilters}
                                size={FieldSize.Small}
                                placeholder={t('allCarriers') || ''}
                                name="carrier-dropdown-btn"
                                onOpenChange={handleOnOpenChangeCarrier}
                            />
                        </div>
                        <div className="w-52">
                            <BrokerDealerFilter
                                brokerDealers={brokerDealers}
                                selectedBrokerDealers={
                                    placeholderSelectedBrokerDealers
                                }
                                selectedCarriers={Object.keys(
                                    placeholderSelectedCarriers
                                )}
                                setSelectedBrokerDealers={setBrokerDealers}
                                updateBrokerDealerFilters={
                                    updateBrokerDealerFilters
                                }
                                handleOnOpenChangeBroker={
                                    handleOnOpenChangeBroker
                                }
                            />
                        </div>
                        <div>
                            <Button
                                className="flex items-center align-middle flex-row"
                                mode="link"
                                disabled={clearFiltersDisabled}
                                size={ButtonSize.Small}
                                onClick={clearFilters}
                            >
                                <Icon
                                    width={16}
                                    height={16}
                                    type={IconType.CLOSE}
                                />{' '}
                                clear
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
);

FiltersHeader.displayName = 'FiltersHeader';

export default FiltersHeader;
