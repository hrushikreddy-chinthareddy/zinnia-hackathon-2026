import {
    TabContent,
    TabGroup,
    TabList,
    TabTrigger,
} from '@zinnia/bloom/components';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import Toggle, {
    ToggleSize,
    ToggleVariant,
} from '@deps/components/toggle/toggle';
import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import CardContainer from '@deps/containers/card-container/card-container';
import AgentParty from '@deps/helpers/policy-sor/AgentParty';
import { PolicyParty } from '@deps/helpers/policy-sor/Parties';
import { Party } from '@deps/models/policy-sor-touchups/Party';
import { PeopleActivityTabValues } from '@deps/types/constants';
import { PolicyPartyRoles } from '@zinnia/api-types/types/sor';

import styles from './activity-card.module.css';
import PartyDetailsTable, {
    TabKeys,
} from './activity-table/party-details-table';

const activityTabs: Array<{
    key: TabKeys;
    label: string;
}> = [
    { key: PeopleActivityTabValues.roles, label: 'allFields.roles' },
    {
        key: PeopleActivityTabValues.identification,
        label: 'allFields.identification',
    },
    { key: PeopleActivityTabValues.phone, label: 'allFields.phone' },
    { key: PeopleActivityTabValues.email, label: 'allFields.email' },
    { key: PeopleActivityTabValues.address, label: 'allFields.addressId' },
    {
        key: PeopleActivityTabValues.bankAccounts,
        label: 'allFields.bankAccounts',
    },
];

interface ActivityCardProps {
    selectedPolicyPartyRoles?: PolicyPartyRoles[];
    newSelectedPolicyParty?: PolicyParty | AgentParty;
    selectedPolicyParty?: Party;
}

const ActivityCard = ({
    selectedPolicyPartyRoles,
    newSelectedPolicyParty,
    selectedPolicyParty,
}: ActivityCardProps) => {
    const { t } = useTranslation();
    const [onlyShowInactive, setOnlyShowInactive] = useState(false);
    const [tabVal, setTabVal] = useState<TabKeys>(
        PeopleActivityTabValues.roles
    );

    const isTabKey = (val: string): val is TabKeys =>
        Object.values(PeopleActivityTabValues).includes(val as TabKeys);

    const handleTabChange = (val: string) => {
        if (isTabKey(val)) {
            setTabVal(val);
        }
    };

    return (
        <CardContainer classNames={styles.card}>
            <div className={styles.header}>
                <div className={styles.headerRow}>
                    <div className={styles.titleRow}>
                        <Typography
                            variant={TypographyVariant.H2}
                            className={styles.title}
                        >
                            {t('allFields.activity')}
                        </Typography>
                    </div>
                    <div className={styles.toggleRow}>
                        <Toggle
                            size={ToggleSize.Default}
                            variant={ToggleVariant.Default}
                            text={t('allFields.showInactive') as string}
                            ariaLabel={t('allFields.showInactive') as string}
                            value={onlyShowInactive}
                            handleToggle={setOnlyShowInactive}
                        />
                    </div>
                </div>

                <div className={styles.tabsContainer}>
                    <TabGroup
                        defaultValue={tabVal}
                        value={tabVal}
                        onValueChange={handleTabChange}
                    >
                        <TabList className={styles.tabList}>
                            {activityTabs.map(({ key, label }) => (
                                <TabTrigger key={key} value={key}>
                                    <Typography
                                        variant={TypographyVariant.LabelMdAlt}
                                    >
                                        {t(label)}
                                    </Typography>
                                </TabTrigger>
                            ))}
                        </TabList>
                        {activityTabs.map(({ key }) => (
                            <TabContent key={key} value={key}>
                                <PartyDetailsTable
                                    tabVal={key}
                                    selectedPolicyPartyRoles={
                                        key === PeopleActivityTabValues.roles
                                            ? selectedPolicyPartyRoles
                                            : undefined
                                    }
                                    newSelectedPolicyParty={
                                        key ===
                                        PeopleActivityTabValues.identification
                                            ? newSelectedPolicyParty
                                            : undefined
                                    }
                                    selectedPolicyParty={
                                        key !== PeopleActivityTabValues.roles &&
                                        key !==
                                            PeopleActivityTabValues.identification
                                            ? selectedPolicyParty
                                            : undefined
                                    }
                                    onlyShowInactive={onlyShowInactive}
                                />
                            </TabContent>
                        ))}
                    </TabGroup>
                </div>
            </div>
        </CardContainer>
    );
};

export default ActivityCard;
