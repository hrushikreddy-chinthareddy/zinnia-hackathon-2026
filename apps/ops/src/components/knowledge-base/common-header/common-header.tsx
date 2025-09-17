import { Icon, IconType } from "@zinnia/bloom/components";
import { useTranslation } from "react-i18next";

import Typography, { TypographyVariant } from "@deps/components/typography/typography";
import { TranslationFiles } from "@deps/config/translations";

const CommonHeader = () => {
  const { t } = useTranslation(TranslationFiles.COMMON, {
    keyPrefix: 'zinniaAiAssistant',
  });
  return (
    <div className="text-[--color-base-text-text-link] flex gap-2 items-end">
      <Typography variant={TypographyVariant.H3}>
        {t('header')}
      </Typography>
      <Icon type={IconType.CHEVRON_RIGHT} />
    </div>
  )
}

export default CommonHeader