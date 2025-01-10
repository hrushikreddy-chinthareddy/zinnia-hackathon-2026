import { clsx } from 'clsx';

import NoNavLayout from '@deps/components/no-nav-layout';
import { PageHead } from '@deps/components/page-title';
import usePomExperience from '@deps/hooks/usePomExperience';

import styles from './index.module.css';
import { Divider, Icon, IconType, TabContent, TabGroup, TabList, TabTrigger } from '@zinnia/bloom/components';
import { withPageAuthRequired } from '@auth0/nextjs-auth0/client';
import { useState } from 'react';
import { GetProducerResponse } from './types';
import { getMockAgency } from './mockAgency';
import { CardHeader, ContactInfo, Identification } from './components';

function POM() {
    // const { t } = useTranslation(TranslationFiles.COMMON);
    const isPomExperienceFeatureFlagEnabled = usePomExperience();
    const [agency, setAgency] = useState<GetProducerResponse>(getMockAgency().data);

    if (!isPomExperienceFeatureFlagEnabled) {
        return null;
    }

    const tabs = [
        { label: 'Entity Information', icon: IconType.DOCUMENT_TEXT, value: 'personalInfo', content: <PersonalInfo /> },
        { label: 'Licenses and Appointments', icon: IconType.DOCUMENT_TEXT, value: 'licenses', content: <div>Section 2</div> },
        { label: 'Training and Education', icon: IconType.DOCUMENT_TEXT, value: 'training', content: <div>Section 3</div> },
        { label: 'Hierarchies', icon: IconType.DOCUMENT_TEXT, value: 'hierarchies', content: <div>Section 4</div> },
    ];

    return (
        <>
            <PageHead titleKey="pom" />
            <NoNavLayout displayTopNavBar>
                <div className={clsx(styles.cardContainer)}>
                    <CardHeader />
                    <TabGroup defaultValue={tabs[0].value} className={clsx(styles.tabs)}>
                        <TabList className={clsx(styles.tabList)}>
                            {tabs.map(({ label, icon, value }) => (
                                <TabTitle value={value} icon={icon} label={label} />
                            ))}
                        </TabList>
                        {tabs.map(({ value, content }: { value: string; content: any }) => (
                            <TabContent value={value}>{content}</TabContent>
                        ))}
                    </TabGroup>
                </div>
            </NoNavLayout>
        </>
    );
}

const PersonalInfo = () => {
    return (
        <div>
            <Identification />
            <Divider direction="horizontal" />
            <ContactInfo />
        </div>
    );
};

const TabTitle = ({ value, icon, label }: { value: string; icon: IconType; label: string }) => {
    return (
        <TabTrigger value={value}>
            <Icon type={icon} />
            {label}
        </TabTrigger>
    );
};

export default withPageAuthRequired(POM);
