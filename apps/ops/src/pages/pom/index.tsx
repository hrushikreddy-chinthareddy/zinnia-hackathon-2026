import { clsx } from 'clsx';

import NoNavLayout from '@deps/components/no-nav-layout';
import { PageHead } from '@deps/components/page-title';
import usePomExperience from '@deps/hooks/usePomExperience';

import { default as styles } from './index.module.css';
import { Divider, IconType, TabContent, TabGroup, TabList } from '@zinnia/bloom/components';
import { withPageAuthRequired } from '@auth0/nextjs-auth0/client';
import { CardHeader, ContactInfo, Identification, ProducerContext, TabTitle } from './components';
import { fetchProducer } from './mockProducer';

function POM() {
    // --- feature flag check ------
    // @TODO: this should probably be its own checkFeatureFlag(POM_EXPERIENCE_FEATURE_FLAG) hook
    const isPomExperienceFeatureFlagEnabled = usePomExperience();

    if (!isPomExperienceFeatureFlagEnabled) {
        return null;
    }
    // ----------------------------

    // @TODO: change this once we integrate with backend
    const producer = fetchProducer().data;

    const tabs = [
        { label: 'Entity Information', icon: IconType.DOCUMENT_TEXT, value: 'personalInfo', content: <PersonalInfo /> },
        { label: 'Licenses and Appointments', icon: IconType.DOCUMENT_TEXT, value: 'licenses', content: <div>Section 2</div> },
        { label: 'Training and Education', icon: IconType.DOCUMENT_TEXT, value: 'training', content: <div>Section 3</div> },
        { label: 'Hierarchies', icon: IconType.DOCUMENT_TEXT, value: 'hierarchies', content: <div>Section 4</div> },
    ];

    return (
        <ProducerContext.Provider value={producer}>
            <PageHead titleKey="pom" />
            <NoNavLayout displayTopNavBar>
                <div className={clsx(styles.cardContainer)}>
                    <CardHeader producerType={producer.producerType} />
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
        </ProducerContext.Provider>
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

export default withPageAuthRequired(POM);
