import {
    TabContent,
    TabGroup,
    TabList,
    TabTrigger,
} from '@zinnia/bloom/components';
import { useTranslation } from 'next-i18next';
import { useContext, useEffect, useState } from 'react';

import PageHeader from '@deps/components/page-header/page-header';
import SelectComponent from '@deps/components/select/select';
import CardContainer from '@deps/containers/card-container/card-container';
import PolicyExtrasCards, {
    ExtrasCardType,
} from '@deps/containers/policy-extras-cards/policy-extras-cards';
import { useOptimizely } from '@deps/contexts/OptimizelyContext';
import { PolicyData } from '@deps/contexts/PolicyDataContext';
import { FEATURE_FLAGS } from '@deps/utils/optimizely/flags';

import FeaturesTable from './features-table/features-table';
import {
    calculaterFilterProps,
    ExtraFilters,
} from './riders-and-features-sub-page.helpers';
import RidersTable from './riders-table/riders-table';

const RidersAndFeaturesSubPage = () => {
    const { t } = useTranslation(undefined, {
        keyPrefix: 'policy.detailCards.ridersAndFeatures',
    });
    const { policyDetails } = useContext(PolicyData);
    const { featureFlags } = useOptimizely();

    const [selectedTab, setSelectedTab] = useState<ExtrasCardType>(
        ExtrasCardType.Rider
    );

    const [selectedOption, setSelectedOption] = useState<ExtraFilters>(
        ExtraFilters.All
    );

    const showTableView =
        featureFlags[FEATURE_FLAGS.FEATURES_AND_RIDERS_TABLE_VIEW];

    const options = calculaterFilterProps({
        riders: policyDetails.riders,
        features: policyDetails.features.policyFeatures,
        t,
    });

    const triggers = options.filter(
        (opt) =>
            opt.value === ExtraFilters.Riders ||
            opt.value === ExtraFilters.Features
    );

    const selectOption = options.find(
        (option) => (option.value as string) === selectedTab
    );

    const filterValues: { key: ExtrasCardType; value: string } = {
        key: selectedTab,
        value: selectedOption,
    };

    useEffect(() => {
        setSelectedOption(ExtraFilters.All);
    }, [selectedTab]);

    return (
        <>
            <div className="text-gray-900">
                <PageHeader headerText={t('title') || ''} />
            </div>
            <CardContainer classNames="flex flex-col gap-4 !pt-0">
                <>
                    <TabGroup
                        defaultValue={selectedTab}
                        onValueChange={(value) =>
                            setSelectedTab(value as ExtrasCardType)
                        }
                    >
                        <TabList className="!mb-4">
                            {triggers.map((trigger) => (
                                <TabTrigger
                                    value={trigger.value}
                                    key={trigger.value}
                                >
                                    {`${trigger.text} (${trigger?.quantity})`}
                                </TabTrigger>
                            ))}
                        </TabList>
                        {showTableView && (
                            <>
                                <TabContent value={ExtraFilters.Riders}>
                                    <RidersTable
                                        policyDetails={policyDetails}
                                    />
                                </TabContent>
                                <TabContent value={ExtraFilters.Features}>
                                    <FeaturesTable
                                        policyDetails={policyDetails}
                                    />
                                </TabContent>
                            </>
                        )}
                    </TabGroup>
                    {!showTableView && (
                        <>
                            <SelectComponent
                                className="md:w-1/4"
                                label="Status"
                                value={selectedOption}
                                onChange={(value) =>
                                    setSelectedOption(value as ExtraFilters)
                                }
                                options={
                                    selectOption?.options.map((opt) => ({
                                        label: opt.text,
                                        value: opt.value as ExtraFilters,
                                        totalValue: opt.quantity,
                                        disabled: opt.disabled,
                                    })) ?? []
                                }
                                disabled={selectOption?.disabled}
                            />
                            <PolicyExtrasCards
                                policyDetails={policyDetails}
                                selectedTab={selectedTab}
                                filterValues={filterValues}
                            />
                        </>
                    )}
                </>
            </CardContainer>
        </>
    );
};

export default RidersAndFeaturesSubPage;
