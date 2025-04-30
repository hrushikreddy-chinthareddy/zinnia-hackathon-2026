import * as RadioGroup from '@radix-ui/react-radio-group';
import { useTranslation } from 'next-i18next';
import { useContext, useState } from 'react';

import PageHeader from '@deps/components/page-header/page-header';
import Typography, { TypographyVariant } from '@deps/components/typography/typography';
import CardContainer from '@deps/containers/card-container/card-container';
import PolicyExtrasCards from '@deps/containers/policy-extras-cards/policy-extras-cards';
import { PolicyData } from '@deps/contexts/PolicyDataContext';

import { calculaterFilterProps, ExtraFilters, FilterKeys } from './riders-and-features-sub-page.helpers';

const RidersAndFeaturesSubPage = () => {
    const { t } = useTranslation(undefined, {
        keyPrefix: 'policy.detailCards.ridersAndFeatures',
    });
    const { policyDetails } = useContext(PolicyData);

    const [selectedChip, setSelectedChip] = useState<ExtraFilters>(ExtraFilters.All);

    const chips = calculaterFilterProps({ riders: policyDetails.riders, features: policyDetails.features.policyFeatures, t });

    const filterValues: { key: FilterKeys; value: string } = {
        key: selectedChip === ExtraFilters.Riders || selectedChip === ExtraFilters.Features ? FilterKeys.Type : FilterKeys.Status,
        value: selectedChip,
    };

    return (
        <>
            <div className="border-b-2 border-gray-200 text-gray-900">
                <PageHeader headerText={t('title') || ''} />
            </div>
            <CardContainer classNames="flex flex-col gap-4">
                <>
                    <Typography variant={TypographyVariant.FieldLabel} className="text-gray-900">
                        {t('filter.label')}
                    </Typography>
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
                </>
                <PolicyExtrasCards policyDetails={policyDetails} filterValues={selectedChip === ExtraFilters.All ? null : filterValues} />
            </CardContainer>
        </>
    );
};

export default RidersAndFeaturesSubPage;
