import { ObjectFieldTemplateProps } from '@rjsf/utils';
import { useTranslation } from 'next-i18next';
import React from 'react';

import { TranslationFiles } from '@deps/config/translations';
import { Reason } from '@deps/containers/task-container/task-handlers/types';

import styles from './nigo-summary-template.module.css';
import {
    getIssueResolvedLabel,
    categorizeReasons,
} from './nigo-summary-template.utils';

const SubRefList = ({ subRefs }: { subRefs: Reason['exceptionSubRefs'] }) => (
    <div className={styles.subRefList}>
        {subRefs.map((subRef, index) => (
            <p key={index} className={styles.subRefItem}>
                {(subRef as any).subNmIdDetail ?? (subRef as any).value}
            </p>
        ))}
    </div>
);

const ReasonSection = ({
    reasons,
    title,
    isMismatchedSection,
}: {
    reasons: Reason[];
    title: string;
    isMismatchedSection: boolean;
}) => (
    <div className={styles.section}>
        <p className={styles.sectionTitle}>{title}</p>
        <div
            className={
                isMismatchedSection ? styles.gridLayout : styles.stackLayout
            }
        >
            {reasons.map((reason, index) => (
                <div key={index}>
                    <p className={styles.reasonLabel}>
                        {isMismatchedSection
                            ? reason.category
                            : reason.detailedReason}
                    </p>
                    {reason.exceptionSubRefs?.length > 0 && (
                        <SubRefList subRefs={reason.exceptionSubRefs} />
                    )}
                </div>
            ))}
        </div>
    </div>
);

export const NigoSummaryTemplate = (
    props: ObjectFieldTemplateProps
): React.JSX.Element => {
    const { properties, registry } = props;
    const { t } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: 'nigoSummary',
    });

    const customData = registry?.formContext?.customData;
    const issueResolved = customData?.issueResolved;
    const declineReasons: Reason[] = customData?.declineReason || [];

    const displayLabel = getIssueResolvedLabel(issueResolved);
    const { missingReasons, mismatchedReasons } =
        categorizeReasons(declineReasons);

    const hasData = issueResolved !== undefined && issueResolved !== null;
    const isNigo = issueResolved === false;
    const showMissing = isNigo && missingReasons.length > 0;
    const showMismatched = isNigo && mismatchedReasons.length > 0;

    return (
        <div className={styles.container}>
            <div className={styles.srOnly}>
                {properties.map((prop) => prop.content)}
            </div>

            <div className={styles.contentWrapper}>
                <h1 className={styles.heading}>{t('heading')}</h1>

                {hasData && (
                    <div className={styles.section}>
                        <p className={styles.questionLabel}>
                            {t('paperApplicationComplete')}
                        </p>
                        <p className={styles.answerText}>{displayLabel}</p>
                    </div>
                )}

                {isNigo && !declineReasons.length ? (
                    <div className={styles.errorBox}>
                        <p className={styles.errorText}>{t('noNigoReasons')}</p>
                    </div>
                ) : (
                    <>
                        {showMissing && (
                            <ReasonSection
                                reasons={missingReasons}
                                title={t('missingQuestion')}
                                isMismatchedSection={false}
                            />
                        )}
                        {showMismatched && (
                            <ReasonSection
                                reasons={mismatchedReasons}
                                title={t('selectRole')}
                                isMismatchedSection={true}
                            />
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default NigoSummaryTemplate;
