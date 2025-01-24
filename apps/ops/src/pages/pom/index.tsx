import { withPageAuthRequired } from '@auth0/nextjs-auth0/client';
import { Divider, IconType, TabContent, TabGroup, TabList } from '@zinnia/bloom/components';
import { clsx } from 'clsx';
import Head from 'next/head';

import { CardHeader, ContactInfo, Identification, TabTitle } from '@deps/components/pom';
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

    const tabs = [
        { label: 'Entity Information', icon: IconType.IDENTIFICATION, value: 'personalInfo', content: <PersonalInfo /> },
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
                <CardHeader />
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
