import { TableHeaderCell, TableRow, TableHeader } from '@zinnia/bloom/components';
import { useTranslation } from 'next-i18next';

import Content, { ContentVariant } from '@deps/components/content/content';
import { TranslationFiles } from '@deps/config/translations';

const VariableQueueTableHeader = () => {
  const { t } = useTranslation(TranslationFiles.COMMON, { keyPrefix: 'feature' });

  return (
    <TableHeader>
      <TableRow>

        <TableHeaderCell >
          <Content details={t('variable') as string} variant={ContentVariant.BodySmBold} />
        </TableHeaderCell>

        <TableHeaderCell>
          <Content details={t('value') as string} variant={ContentVariant.BodySmBold} />
        </TableHeaderCell>


        <TableHeaderCell>
          <Content details={t('status') as string} variant={ContentVariant.BodySmBold} />
        </TableHeaderCell>

      </TableRow>
    </TableHeader>
  );
};

export default VariableQueueTableHeader;
