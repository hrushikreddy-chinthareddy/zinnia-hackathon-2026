import * as RadioGroup from '@radix-ui/react-radio-group';
import { useTranslation } from 'next-i18next';
import React, { useContext, useState } from 'react';

import PageHeader from '@deps/components/page-header/page-header';
import CardContainer from '@deps/containers/card-container/card-container';
import PolicyExtrasCards from '@deps/containers/policy-extras-cards/policy-extras-cards';
import { PolicyData } from '@deps/contexts/PolicyDataContext';
import useBreadcrumb from '@deps/hooks/useBreadcrumbs';

import { calculaterFilterProps, ExtraFilters, FilterKeys } from './policy-extras-sub-page.helper';

const PolicyExtrasSubPage = () => {
    const { t } = useTranslation(undefined, {
        keyPrefix: 'policy.detailCards.policyExtras',
    });
    const { policyDetails } = useContext(PolicyData);

    const { breadcrumb } = useBreadcrumb();
    const [selectedChip, setSelectedChip] = useState<ExtraFilters>(ExtraFilters.All);

    const chips = calculaterFilterProps({ riders: policyDetails.riders, features: policyDetails.features.policyFeatures, t });

    const filterValues: { key: FilterKeys; value: string } = {
        key: selectedChip === ExtraFilters.Riders || selectedChip === ExtraFilters.Features ? FilterKeys.Type : FilterKeys.Status,
        value: selectedChip,
    };

    return (
        <div className="rounded bg-white pb-4 text-gray-900 shadow-elevation-light-04">
            <div className="rounded-t border-b-2 border-gray-100 bg-white text-gray-900">
                <PageHeader headerText={t('policyExtras') || ''} breadcrumbText={breadcrumb?.text} breadcrumbUrl={breadcrumb?.url} />
            </div>
            <CardContainer classNames="flex flex-col gap-4">
                <div>
                    <div className="field-label mb-2 text-gray-900">{t('filter.label')}</div>
                    <RadioGroup.Root
                        value={selectedChip}
                        aria-label="chips"
                        onValueChange={value => setSelectedChip(value as ExtraFilters)}
                        className="md:nowrap flex flex-wrap gap-2"
                    >
                        <RadioGroup.Item key="extras-filter-all" value="All" className="chip">
                            All
                        </RadioGroup.Item>
                        {chips.map(chip => (
                            <RadioGroup.Item
                                key={`extras-filter-${chip.value}`}
                                value={chip.value}
                                className="chip"
                                disabled={chip.disabled}
                            >
                                {chip.text} {!!chip.quantity && `(${chip.quantity})`}
                            </RadioGroup.Item>
                        ))}
                    </RadioGroup.Root>
                </div>
                <div>
                    <PolicyExtrasCards policyDetails={policyDetails} filterValues={selectedChip === ExtraFilters.All ? null : filterValues} />
                </div>
            </CardContainer>
        </div>
    );
};

export default PolicyExtrasSubPage;
