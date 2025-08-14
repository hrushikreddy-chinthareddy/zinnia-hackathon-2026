import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableHeaderCell,
    TableRow,
} from '@zinnia/bloom/components';
import { useTranslation } from 'next-i18next';

import { TranslationFiles } from '@deps/config/translations';
import { numberFormatify } from '@deps/helpers/numbers.helpers';

import ContentEntry from './illustration-details-content-entry';
import ContentSection from './illustration-details-content-section';
import { formatIllustrationDetailCurrencyBold } from './illustration-details-helpers';
import { useIllustrationDetail } from '../../../providers/IllustrationDetailProvider';

export default function IulContentCoverage() {
    const { t } = useTranslation(TranslationFiles.COMMON, {});
    const illustration = useIllustrationDetail();

    const faceAmount =
        illustration?.response?.assumed?.coverages?.base?.faceAmount ?? null;
    const faceAmountStr = numberFormatify(faceAmount);

    const deathBenefitOption =
        illustration?.inputs?.options?.deathBenefitOption?.sequence?.map(
            (option, id) => {
                return (
                    <TableRow key={id}>
                        <TableCell style={{ textAlign: 'left' }}>
                            {option?.value}
                        </TableCell>
                        <TableCell style={{ textAlign: 'right' }}>
                            {option?.from}
                        </TableCell>
                        <TableCell style={{ textAlign: 'right' }}>
                            {option?.through}
                        </TableCell>
                    </TableRow>
                );
            }
        );

    return (
        <ContentSection
            className="min-h-28"
            title={t('clientCase.illustrationDetails.coverage.title')}
        >
            <dl className="contents">
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
