import { clsx } from 'clsx';

import NoNavLayout from '@deps/components/no-nav-layout';
import { PageHead } from '@deps/components/page-title';
import Typography, { TypographyVariant } from '@deps/components/typography/typography';
import usePomExperience from '@deps/hooks/usePomExperience';

import styles from './index.module.css';
import { Divider, Icon, IconType, Label, TabContent, TabGroup, TabList, TabTrigger } from '@zinnia/bloom/components';
import { withPageAuthRequired } from '@auth0/nextjs-auth0/client';

function POM() {
    // const { t } = useTranslation(TranslationFiles.COMMON);
    const isPomExperienceFeatureFlagEnabled = usePomExperience();

    if (!isPomExperienceFeatureFlagEnabled) {
        return null;
    }

    const tabs = [
        { label: 'Entity Information', icon: IconType.DOCUMENT_TEXT, value: 'personalInfo', content: personalInfoSection() },
        { label: 'Licenses and Appointments', icon: IconType.DOCUMENT_TEXT, value: 'licenses', content: <div>Section 2</div> },
        { label: 'Training and Education', icon: IconType.DOCUMENT_TEXT, value: 'training', content: <div>Section 3</div> },
        { label: 'Hierarchies', icon: IconType.DOCUMENT_TEXT, value: 'hierarchies', content: <div>Section 4</div> },
    ];

    function personalInfoSection() {
        return (
            <div>
                <div className={clsx(styles.cardSubSection)}>
                    <Typography variant={TypographyVariant.H2} className={clsx(styles.personalInfoSectionHeader)}>
                        Identification
                    </Typography>
                    <div className={clsx(styles.personalInfoSection)}>
                        <div>
                            <Label>Type of corporation</Label>
                            <Typography variant={TypographyVariant.BodySm}>Third party marketer</Typography>
                        </div>
                        <div>Section 2</div>
                        <div>Section 3</div>
                    </div>
                </div>
                <Divider direction="horizontal" />
                <div className={clsx(styles.cardSection)}>
                    <Typography variant={TypographyVariant.H2} className={clsx(styles.caption)}>
                        Contact Info
                    </Typography>
                </div>
            </div>
        );
    }

    return (
        <>
            <PageHead titleKey="pom" />
            <NoNavLayout displayTopNavBar>
                <div className={clsx(styles.cardContainer)}>
                    <CardHeader />
                    <TabGroup
                        defaultValue={tabs[0].value}
                        activationMode="manual"
                        onValueChange={console.log}
                        className={clsx(styles.tabs)}
                    >
                        <TabList className={clsx(styles.tabList)}>
                            {tabs.map(({ label, icon, value }) => (
                                <TabTrigger value={value}>
                                    <Icon type={icon} />
                                    {label}
                                </TabTrigger>
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

function CardHeader() {
    return (
        <div className={clsx(styles.cardHeader)}>
            <Icon type={IconType.USER} className={clsx(styles.icon)} />
            <div>
                <Typography variant={TypographyVariant.H1} className={clsx(styles.header)}>
                    Acme Corporation
                </Typography>
                <Typography variant={TypographyVariant.Caption} className={clsx(styles.caption)}>
                    Tax identification number: 669-45-6789
                </Typography>
            </div>
        </div>
    );
}

export default withPageAuthRequired(POM);
