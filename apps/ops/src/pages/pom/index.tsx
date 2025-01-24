import { withPageAuthRequired } from '@auth0/nextjs-auth0/client';
import { Divider, IconType, TabContent, TabGroup, TabList } from '@zinnia/bloom/components';
import { clsx } from 'clsx';
import Head from 'next/head';

import { BackgroundCheck, CardHeader, ContactInfo, Identification, TabTitle } from '@deps/components/pom';
import { ProducerType } from '@deps/components/pom/types';
import usePomExperience from '@deps/hooks/usePomExperience';
import { NavBar } from '@deps/navigation/nav-bar';

import { default as styles } from './index.module.css';

function POM() {
    // --- feature flag check ------
    // @TODO: this should probably be its own checkFeatureFlag(POM_EXPERIENCE_FEATURE_FLAG) hook
    const isPomExperienceFeatureFlagEnabled = usePomExperience();

    if (!isPomExperienceFeatureFlagEnabled) {
        return null;
    }
    // ----------------------------

    // @TODO: will remove this once we integrate with the api
    const producerType = ProducerType.INDIVIDUAL;
    const tabs = [
        {
            label: 'Entity Information',
            icon: IconType.IDENTIFICATION,
            value: 'personalInfo',
            content: <PersonalInfo producerType={producerType} />,
        },
        { label: 'Licenses and Appointments', icon: IconType.CALENDAR, value: 'licenses', content: <div>Section 2</div> },
        { label: 'Training and Education', icon: IconType.BOOKMARK_ALT, value: 'training', content: <div>Section 3</div> },
        { label: 'Hierarchies', icon: IconType.COLLECTION, value: 'hierarchies', content: <div>Section 4</div> },
    ];

    return (
        <>
            {/* @TODO: <Head/> and <NavBar/> might get removed from pom and kept as part of ops's layout */}
            <Head>
                <title>POM</title>
            </Head>
            <NavBar navItems={[]} />
            <div className={clsx(styles.cardContainer)}>
                <CardHeader producerType={producerType} />
                <TabGroup defaultValue={tabs[0].value}>
                    <TabList className={clsx(styles.tabList)}>
                        {tabs.map(({ label, icon, value }) => (
                            <TabTitle key={value} value={value} icon={icon} label={label} />
                        ))}
                    </TabList>
                    {tabs.map(({ value, content }: { value: string; content: any }) => (
                        <TabContent key={value} value={value}>
                            {content}
                        </TabContent>
                    ))}
                </TabGroup>
            </div>
        </>
    );
}

const PersonalInfo = ({ producerType }: { producerType: ProducerType }) => {
    return (
        <div>
            <Identification producerType={producerType} />
            <Divider direction="horizontal" />
            <ContactInfo producerType={producerType} />
            <Divider direction="horizontal" />
            {producerType === ProducerType.INDIVIDUAL && <BackgroundCheck />}
        </div>
    );
};

export default withPageAuthRequired(POM);
