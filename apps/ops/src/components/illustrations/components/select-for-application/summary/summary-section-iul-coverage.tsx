import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableHeaderCell,
    TableRow,
} from '@zinnia/bloom/components';
import { useTranslation } from 'next-i18next';

import { useIllustrationDetail } from '@deps/components/illustrations/providers/IllustrationDetailProvider';
import { TranslationFiles } from '@deps/config/translations';
import { numberFormatify } from '@deps/helpers/numbers.helpers';

import ContentEntry from './content-entry';
import ContentSection from './content-section';
import styles from './summary.module.css';
import { formatIllustrationDetailCurrencyBold } from '../../details/content/illustration-details-helpers';

export default function IllustrationSelectForApplicationSectionIulCoverage() {
    const { t } = useTranslation(TranslationFiles.COMMON, {});
    const illustration = useIllustrationDetail();

    const faceAmount =
        illustration?.response.assumed.coverages.base.faceAmount ?? null;
    const faceAmountStr = numberFormatify(faceAmount);

    const deathBenefitOption =
        illustration?.inputs?.options?.deathBenefitOption?.sequence?.map(
            (option, id) => {
                return (
                    <TableRow key={id}>
                        <TableCell style={{ textAlign: 'left' }}>
                            {option?.value}
                        </TableCell>
                        <TableCell> {option?.from}</TableCell>
                        <TableCell> {option?.through}</TableCell>
                    </TableRow>
                );
            }
        );

    return (
        <ContentSection
            className={styles.coverageSection}
            title={t('clientCase.illustrationDetails.coverage.title')}
        >
            <dl className={styles.contentSectionContainer}>
                <ContentEntry
                    label={t(
                        `clientCase.illustrationDetails.coverage.faceAmount`
                    )}
                >
                    {faceAmount != null
                        ? formatIllustrationDetailCurrencyBold(t, faceAmount)
                        : faceAmountStr}
                </ContentEntry>
                <ContentEntry
                    ddClassName={styles.iulCoverageTableContainer}
                    label={t(
                        `clientCase.illustrationDetails.deathBenefitOption`
                    )}
                >
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHeaderCell style={{ textAlign: 'left' }}>
                                    Value
                                </TableHeaderCell>
                                <TableHeaderCell style={{ textAlign: 'right' }}>
                                    From year
                                </TableHeaderCell>
                                <TableHeaderCell style={{ textAlign: 'right' }}>
                                    Through
                                </TableHeaderCell>
                            </TableRow>
                        </TableHeader>
                        <TableBody>{deathBenefitOption}</TableBody>
                    </Table>
                </ContentEntry>
            </dl>
        </ContentSection>
    );
}
