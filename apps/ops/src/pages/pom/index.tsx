import { withPageAuthRequired } from '@auth0/nextjs-auth0/client';
import { clsx } from 'clsx';

import NoNavLayout from '@deps/components/no-nav-layout';
import { PageHead } from '@deps/components/page-title';
import Typography, { TypographyVariant } from '@deps/components/typography/typography';
import usePomExperience from '@deps/hooks/usePomExperience';

import styles from './index.module.css';
import { Divider, Icon, IconType, TabContent, TabGroup, TabList, TabTrigger } from '@zinnia/bloom/components';

function POM() {
    // const { t } = useTranslation(TranslationFiles.COMMON);
    const isPomExperienceFeatureFlagEnabled = usePomExperience();

    if (!isPomExperienceFeatureFlagEnabled) {
        return null;
    }

    return (
        <>
            <PageHead titleKey="pom" />
            <NoNavLayout displayTopNavBar>
                <div className={clsx(styles.cardContainer)}>
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
                    <TabGroup defaultValue="personalInfo" activationMode="manual" onValueChange={console.log}>
                        <TabList>
                            <TabTrigger value="personalInfo">
                                <Icon type={IconType.DOCUMENT_TEXT} />
                                Entity Information
                            </TabTrigger>
                            <TabTrigger value="licenses">
                                <Icon type={IconType.DOCUMENT_TEXT} />
                                Licenses and Appointments
                            </TabTrigger>
                            <TabTrigger value="training">
                                <Icon type={IconType.DOCUMENT_TEXT} />
                                Training and Education
                            </TabTrigger>
                            <TabTrigger value="hierarchies">
                                <Icon type={IconType.DOCUMENT_TEXT} />
                                Hierarchies
                            </TabTrigger>
                        </TabList>
                        <TabContent value="personalInfo">
                            <div>
                                <Typography variant={TypographyVariant.H2} className={clsx(styles.caption)}>
                                    Identification
                                </Typography>
                                <div className={clsx(styles.personInfoSection)}>
                                    <div>Section 1</div>
                                    <div>Section 2</div>
                                    <div>Section 3</div>
                                </div>
                            </div>
                            <Divider direction="horizontal" />
                            <div>
                                <Typography variant={TypographyVariant.H2} className={clsx(styles.caption)}>
                                    Contact Info
                                </Typography>
                            </div>
                        </TabContent>
                        <TabContent value="licenses">Content for tab 2</TabContent>
                        <TabContent value="training">Content for tab 3</TabContent>
                        <TabContent value="hierarchies">Content for tab 4</TabContent>
                    </TabGroup>
                </div>
            </NoNavLayout>
        </>
    );
}

export default withPageAuthRequired(POM);
