import { clsx } from 'clsx';
import { useTranslation } from 'react-i18next';

import { FieldSize } from '@deps/components/fields/field';
import Select from '@deps/components/select/select';
import Typography, { TypographyVariant } from '@deps/components/typography/typography';
import { TranslationFiles } from '@deps/config/translations';
import { useDashboardFiltersContext } from '@deps/contexts/DashboardFilterContext';
import styles from '@deps/pages/dashboard/Dashboard.module.css';

// import { BrokerDealerFilter } from '../broker-dealer-filter/broker-dealer-filter';

export const FiltersHeader = () => {
    const { selectedCarriers, setSelectedCarriers, uniqueCarrierFilterItems, carrierFilterItems } = useDashboardFiltersContext();
    const { t } = useTranslation(TranslationFiles.COMMON);

    const updateCarrierFilters = (value: string, displayText: string) => {
        setSelectedCarriers(prevSelectedCarriers => {
            if (prevSelectedCarriers[value]) {
                delete prevSelectedCarriers[value];
                return { ...prevSelectedCarriers };
            } else {
                return { ...prevSelectedCarriers, [value]: displayText };
            }
        });
    };
    return (
        <div id="carrier-header" className={clsx('flex-wrap', styles.filtersHeader)}>
            <Typography className="flex items-center" variant={TypographyVariant.H1} data-testid="header-text">
                {t('caseStatsDashboardTitle')}
            </Typography>
            <div className="flex justify-between items-center">
                <div className="flex nowrap gap-4">
                    <div className="w-52">
                        <Select
                            isMultiselect
                            options={uniqueCarrierFilterItems}
                            value={selectedCarriers}
                            onChange={updateCarrierFilters}
                            size={FieldSize.Small}
                            placeholder={t('allCarriers') || ''}
                            disabled={carrierFilterItems.length === 1}
                            name="carrier-dropdown-btn"
                        />
                    </div>
                    <div className="w-52">
                        {/* <BrokerDealerFilter */}
                        {/* /> */}
                    </div>
                </div>
            </div>
        </div>
    );
};
