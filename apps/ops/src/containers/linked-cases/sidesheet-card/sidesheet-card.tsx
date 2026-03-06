import dayjs from 'dayjs';
import Link from 'next/link';
import { TFunction, useTranslation } from 'next-i18next';
import { ReactNode } from 'react';

import Badge from '@deps/components/badge/badge';
import { BadgeVariant } from '@deps/components/badge/badge.helpers';
import Label, { LabelVariant } from '@deps/components/label/label';
import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import { DEFAULT_EXTENDED_DATE_FORMAT } from '@deps/types/constants';
import { capitalize } from '@deps/utils/strings';

import { CaseDetails, CaseStatus } from '../utils';
import styles from './sidesheet-card.module.css';

const Row = ({ label, children }: { label: string; children: ReactNode }) => (
    <div className={styles.row}>
        <Label
            className={styles.label}
            label={label}
            variant={LabelVariant.LabelSm}
            sentenceCase={false}
        />
        <Typography variant={TypographyVariant.BodySm}>{children}</Typography>
    </div>
);

const StatusBadge = (t: TFunction, status: string) => {
    const styles: Record<string, string> = {
        [CaseStatus.InProgress]: BadgeVariant.Info,
        [CaseStatus.Completed]: BadgeVariant.Success,
    };
    const labels: Record<string, string> = {
        [CaseStatus.InProgress]: t('allFields.inProgress'),
        [CaseStatus.Completed]: t('allFields.completed'),
    };

    return (
        <Badge
            variant={styles[status] as BadgeVariant}
            label={labels[status]}
            className={styles.badge}
            rounded={true}
        />
    );
};

const SideSheetCard = ({ cases }: { cases: CaseDetails[] }) => {
    const { t } = useTranslation();

    return (
        <div className={styles.sideSheetContainer}>
            {cases.map((caseItem: CaseDetails, index: number) => (
                <div key={index} className={styles.card}>
                    <Typography
                        variant={TypographyVariant.H6}
                        className={styles.cardHeader}
                    >
                        {capitalize(caseItem.process)}
                    </Typography>
                    <div className={styles.cardBody}>
                        <Row label={t('allFields.Status')}>
                            {StatusBadge(t, caseItem.status)}
                        </Row>
                        <Row label={t('allFields.caseId')}>
                            <Link
                                href={`/cases/${caseItem.id}`}
                                target="_blank"
                                className={styles.link}
                            >
                                {caseItem.id}
                            </Link>
                        </Row>
                        <Row label={t('allFields.raisedOn')}>
                            {dayjs(caseItem.createdAt).format(
                                DEFAULT_EXTENDED_DATE_FORMAT
                            )}
                        </Row>
                        <Row label={t('allFields.reason')}>
                            {caseItem.reason}
                        </Row>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default SideSheetCard;
