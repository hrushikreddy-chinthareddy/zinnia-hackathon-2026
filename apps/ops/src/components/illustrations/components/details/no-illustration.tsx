import {
    BodyVariant,
    Heading,
    HeadingVariant,
    Icon,
    IconType,
    Text,
} from '@zinnia/bloom/components';
import clsx from 'clsx';
import { useTranslation } from 'next-i18next';

import { TranslationFiles } from '@deps/config/translations';

import styles from './no-illustration.module.css';

export default function NoIllustration() {
    const { t } = useTranslation(TranslationFiles.COMMON, {});
    return (
        <div className={clsx(styles.noIllustrations)}>
            <Icon
                type={IconType.DOCUMENT_REPORT}
                className={styles.icon}
                alt={t('clientCase.caseSummary.reportIconalt') as string}
                height={50}
                width={50}
            />
            <Heading as={HeadingVariant.h3}>
                {t('clientCase.caseSummary.noIllustrations') as string}
            </Heading>
            <Text as={BodyVariant.p} className="">
                {t('clientCase.caseSummary.selectProduct') as string}
            </Text>
        </div>
    );
}
