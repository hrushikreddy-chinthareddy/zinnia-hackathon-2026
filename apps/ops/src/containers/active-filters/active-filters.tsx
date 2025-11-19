import { useTranslation } from 'next-i18next';
import { useEffect, useState } from 'react';

import ChipX from '@deps/components/chip/chip-x';
import NavElement, {
    NavElementType,
} from '@deps/components/nav-element/nav-element';
import { CaseSearchAdditionalFilters } from '@deps/contexts/CaseManagementFilters';
import { Processes } from '@deps/models/case/case';

import AgeRangeChip from './chips/age-range-chip';
import BrokerDealerChip from './chips/broker-dealer-chip';
import CarrierChip from './chips/carrier-chip';
import CreatedDateChip from './chips/created-date-chip';
import ProcessTypeChip from './chips/process-chip';
import ProductChip from './chips/product-chip';
import SubTypeChip from './chips/sub-type-chip';
import UpdatedDateChip from './chips/updated-date-chip';

const Clear = ({ onReset }: { onReset: () => void }) => {
    const { t } = useTranslation();
    return (
        <NavElement
            type={NavElementType.Button}
            className="flex self-center whitespace-nowrap"
            onClick={onReset}
        >
            {t('caseManagementDashboard.refineResultsOptions.clearAll')}
        </NavElement>
    );
};

export interface ActiveFiltersProps {
    filters: CaseSearchAdditionalFilters;
    removeFilter: (filters: CaseSearchAdditionalFilters) => void;
    onReset: () => void;
    authorizedCarriers: string[];
}

export default function ActiveFilters({
    filters,
    removeFilter,
    onReset,
    authorizedCarriers,
}: ActiveFiltersProps) {
    const { t } = useTranslation(undefined, {
        keyPrefix: 'caseManagementDashboard.refineResultsFilters',
    });
    const [filtersActive, setFiltersActive] = useState(false);
    const createdDateStart =
        filters.createdDateStart && filters.createdDateStart !== '';
    const updatedDateStart =
        filters.updatedDateStart && filters.updatedDateStart !== '';
    const ageRange = filters.age;
    const hasProcessTypeFilters = filters.processTypes.size !== 0;
    const hasCarriers =
        filters.carriers && !!Object.keys(filters.carriers).length;
    const hasProducts = filters.products.size !== 0;
    const hasSubtypes = filters.requestSubType.size !== 0;
    const hasBrokerDealerName =
        filters.brokerDealerName && filters.brokerDealerName !== '';
    const hasEscalated =
        filters.escalated === true ||
        filters.escalated === false ||
        filters.escalated === null;

    useEffect(() => {
        if (
            createdDateStart ||
            updatedDateStart ||
            ageRange ||
            hasProcessTypeFilters ||
            hasCarriers ||
            hasBrokerDealerName ||
            hasEscalated
        )
            return setFiltersActive(true);
        setFiltersActive(false);
    }, [
        createdDateStart,
        ageRange,
        hasProcessTypeFilters,
        hasCarriers,
        hasBrokerDealerName,
        updatedDateStart,
        hasEscalated,
    ]);

    const handleRemoveFilter = (removedFilters: {
        [key: string]: '' | boolean | object | Set<Processes>;
    }) => removeFilter({ ...filters, ...removedFilters });

    const handleRemoveEscalatedFilter = () => {
        const { escalated, ...rest } = filters;
        removeFilter(rest);
    };

    if (!filtersActive) return null;

    return (
        <div className="mb-6 mt-4 flex max-w-full flex-row flex-wrap items-center justify-start gap-2">
            {hasCarriers &&
                Object.keys({ ...filters.carriers }).map((carrierCode) => (
                    <CarrierChip
                        authorizedCarriers={authorizedCarriers}
                        key={`carrier-filter-${carrierCode}`}
                        carrierCode={carrierCode}
                        carriers={{ ...filters.carriers }}
                        handleRemoveFilter={handleRemoveFilter}
                        t={t}
                    />
                ))}
            {hasBrokerDealerName && (
                <BrokerDealerChip
                    key={`broker-dealer-filter-${filters.brokerDealerName}`}
                    brokerDealerName={filters.brokerDealerName ?? ''}
                    handleRemoveFilter={handleRemoveFilter}
                    t={t}
                />
            )}
            {hasProducts &&
                Array.from(filters.products).map((productCode) => (
                    <ProductChip
                        key={`product-filter-${productCode}`}
                        productCode={productCode}
                        products={filters.products}
                        handleRemoveFilter={handleRemoveFilter}
                        t={t}
                    />
                ))}
            {hasProcessTypeFilters &&
                Array.from(filters.processTypes).map((process) => (
                    <ProcessTypeChip
                        key={process}
                        process={process}
                        processTypes={filters.processTypes}
                        handleRemoveFilter={handleRemoveFilter}
                        t={t}
                    />
                ))}
            {hasEscalated && (
                <ChipX
                    ariaLabel={
                        t('ariaLabel.clearFilter', {
                            filter: process,
                        }) as string
                    }
                    label={
                        filters.escalated == null
                            ? t('escalated.any')
                            : filters.escalated
                            ? t('escalated.true')
                            : t('escalated.false')
                    }
                    onDelete={handleRemoveEscalatedFilter}
                />
            )}

            {hasSubtypes &&
                Array.from(filters.requestSubType).map((subTypeCode) => (
                    <SubTypeChip
                        key={`subtype-filter-${subTypeCode}`}
                        subTypeCode={subTypeCode}
                        requestSubType={filters.requestSubType}
                        handleRemoveFilter={handleRemoveFilter}
                        t={t}
                    />
                ))}
            {!!createdDateStart && (
                <CreatedDateChip
                    createdDateStart={filters.createdDateStart}
                    createdDateEnd={filters.createdDateEnd}
                    handleRemoveFilter={handleRemoveFilter}
                    t={t}
                />
            )}
            {!!updatedDateStart && (
                <UpdatedDateChip
                    updatedDateStart={filters.updatedDateStart}
                    updatedDateEnd={filters.updatedDateEnd}
                    handleRemoveFilter={handleRemoveFilter}
                    t={t}
                />
            )}
            {!!ageRange && (
                <AgeRangeChip
                    ageRange={ageRange}
                    handleRemoveFilter={handleRemoveFilter}
                    t={t}
                />
            )}
            {!!filtersActive && <Clear onReset={onReset} />}
        </div>
    );
}
