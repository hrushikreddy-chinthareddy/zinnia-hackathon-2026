import { useTranslation } from 'next-i18next';

import Typography, { TypographyVariant } from '@deps/components/typography/typography';
import { TranslationFiles } from '@deps/config/translations';
import { DefinitionOfLifeInsurance, Policy } from '@deps/models/policy/sor-policy';
import { ReactComponent as DocumentReportIcon } from '@deps/styles/elements/icons/files/document-report.svg';

import GuidelineCard from './guidline-card/guideline-card';
import SevenPayCard from './seven-pay-card/seven-pay-card';

interface PolicyTestsCardProps {
    policy: Policy;
}

const PolicyTestsCard = ({ policy }: PolicyTestsCardProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, { keyPrefix: 'premium.policyTestsCard' });

    return (
        <article className="flex flex-col gap-4 bg-white p-4 md:p-6 lg:p-8">
            <div className="flex items-center gap-2">
                <DocumentReportIcon className="text-primary" height={24} width={24} role="presentation" />
                <Typography variant={TypographyVariant.H2}>{t('title')}</Typography>
            </div>
            <div className="flex flex-col gap-4 lg:pl-8">
                <SevenPayCard testValues={policy.testValues} />
            </div>
            {policy.testValues?.guidelinePremium?.definitionOfLifeInsurance === DefinitionOfLifeInsurance.GPT && (
                <div className="flex flex-col gap-4 lg:pl-8">
                    <GuidelineCard policy={policy} />
                </div>
            )}
        </article>
    );
};

export default PolicyTestsCard;
