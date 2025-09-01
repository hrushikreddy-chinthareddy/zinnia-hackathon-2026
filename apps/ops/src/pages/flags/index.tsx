import { Badge, BadgeVariant } from '@zinnia/bloom/components';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useState } from 'react';

import ButtonGrp from '@deps/components/button-group/button-group';
import Typography, { TypographyVariant } from '@deps/components/typography/typography';
import { TranslationFiles } from '@deps/config/translations';
import FlagQueue from '@deps/containers/flags/flag-queue';
import VariableQueue from '@deps/containers/flags/variable-queue';
import { getUserData } from '@deps/helpers/query-data.helpers';
import { ALL_LOCALES, DEFAULT_LOCALE } from '@deps/helpers/routing.helpers';
import { toTitleCase } from '@deps/helpers/string.helpers';
import { UserProfile } from '@deps/models/user-profile';
import { FeatureFlags, optimizelyService } from '@deps/utils/optimizely/optimizely';
import { withPageAuthAndLogging } from '@deps/utils/server-logging';
import nextI18nextConfig from 'next-i18next.config';

export type additionalDataProps = {
  user: UserProfile;
};
type HomePageProps = {
  featureFlagDecisions: FeatureFlags;
  additionalData: additionalDataProps;
  featureFlagVariables: any;
};
enum FlagType {
  Flag = 'flag',
  Variable = 'variable',
}

export default function Home({ featureFlagDecisions, featureFlagVariables }: HomePageProps) {
  const { t } = useTranslation(TranslationFiles.COMMON, { keyPrefix: 'feature' });
  const defaultOptions = [
    { label: t('flag'), value: FlagType.Flag },
    { label: t('variable'), value: FlagType.Variable },
  ];
  const [selected, setSelected] = useState<FlagType>(FlagType.Flag);
  const getVariant = (env: string) => {
    switch (env) {
      case 'development':
        return BadgeVariant.SUCCESS;
      case 'production':
        return BadgeVariant.INFO;
      default:
        return BadgeVariant.DEFAULT;
    }
  };

  return (
    <>

      <div className='flex justify-between items-center'>
        <ButtonGrp
          activeValue={selected}
          toggle={(value: string) => setSelected(value as FlagType)}
          labels={defaultOptions}
        />
        <div className='flex flex-row  gap-2'>
          <Typography variant={TypographyVariant.H4} >
            {t('environment')}:
          </Typography>
          <Badge label={toTitleCase(process.env.NODE_ENV)} variant={getVariant(process.env.NODE_ENV)}
          />
        </div>
      </div>

      <>
        {selected === FlagType.Flag && (
          <>
            <Typography variant={TypographyVariant.H1} className="md:my-5 my-4">
              {t('featureFlags')}
            </Typography>
            <FlagQueue featureFlagDecisions={featureFlagDecisions} />
          </>

        )}

        {selected === FlagType.Variable && (
          <>
            <Typography variant={TypographyVariant.H1} className="md:my-5 my-4">
              {t('featureVariables')}
            </Typography>
            <VariableQueue featureFlagVariables={featureFlagVariables} />
          </>
        )}

      </>
    </>
  );
}

export const getServerSideProps = withPageAuthAndLogging(
  {
    getServerSideProps: async (context, loggingContext) => {

      const user = await getUserData(context);


      const featureFlagDecisions: FeatureFlags = await optimizelyService.getFeatureFlagDecisions(user.sub, loggingContext);
      const featureFlagVariables: any = await optimizelyService.getAllFeatureFlagVariables(user.sub, loggingContext);
      const { locale = DEFAULT_LOCALE } = context;
      const additionalData: additionalDataProps = { user: user };
      const transaltions = await serverSideTranslations(locale, [TranslationFiles.COMMON], nextI18nextConfig, ALL_LOCALES);
      return {
        props: { locale, ...transaltions, featureFlagDecisions, additionalData, featureFlagVariables },
      };
    },
  },
  { file: 'flags', function: 'getServerSideProps', page: 'flags' }
);
