import { useQuery } from '@tanstack/react-query';
import { Toast, ToastVariant } from '@zinnia/bloom/components';
import dayjs from 'dayjs';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';
import { useCallback } from 'react';

import BannerAlert, {
    BannerVariant,
} from '@deps/components/banner-alert/banner-alert';
import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import { useSideSheetContextLegacy } from '@deps/contexts/SideSheetContext';
import { getLinkedCases } from '@deps/queries/api/v1/linked-cases';
import { ReactComponent as SuccessIcon } from '@deps/styles/elements/icons/icons_outlined/check-circle.svg';
import { ReactComponent as InfoIcon } from '@deps/styles/elements/icons/icons_outlined/info.svg';
import { DEFAULT_EXTENDED_DATE_FORMAT } from '@deps/types/constants';

import styles from './linked-cases.module.css';
import SideSheetCard from './sidesheet-card/sidesheet-card';
import { CaseStatus, LinkedCase, LinkType } from './utils';

const LinkedCases = ({ caseId }: { caseId: string | undefined }) => {
    const { t } = useTranslation();
    const sideSheet = useSideSheetContextLegacy();

    const { data: linkedCases = [], isError } = useQuery({
        queryKey: ['linkedCases', caseId],
        queryFn: async () => {
            const { linkedCases } = await getLinkedCases(caseId as string);
            return linkedCases ?? [];
        },
        enabled: !!caseId,
    });

    const relatedLinkedCases = linkedCases
        .filter((item: LinkedCase) => item.linkType === LinkType.Related)
        .map((item: LinkedCase) => ({
            ...item.associatedCaseDetails,
            reason: item.linkReason,
            caseType: item.caseDetails.process,
        }));

    const viewSideSheet = useCallback(() => {
        sideSheet.changeSideSheetContent(
            t('allFields.caseRequest'),
            <SideSheetCard cases={relatedLinkedCases} />
        );
        sideSheet.handleOpen(true);
    }, [sideSheet, t, relatedLinkedCases]);

    if (isError) {
        return (
            <div className={styles.toast}>
                <Toast variant={ToastVariant.Error}>
                    {t('allFields.unableToFetchRelatedCase')}
                </Toast>
            </div>
        );
    }

    if (linkedCases.length === 0) return null;

    if (relatedLinkedCases.length === 0) return null;

    const numberOfLinkedCases = relatedLinkedCases.length;
    const multipleLinkedCases = numberOfLinkedCases > 1;
    const linkedCasesComplete = relatedLinkedCases.every(
        (c: LinkedCase) => c.status === CaseStatus.Completed
    );

    const viewDetailsBtn = (
        <button className={styles.button} onClick={viewSideSheet}>
            {t('allFields.viewDetails')}
        </button>
    );

    return linkedCasesComplete ? (
        <BannerAlert
            variant={BannerVariant.Success}
            canDismiss={false}
            icon={SuccessIcon}
        >
            <Typography
                variant={TypographyVariant.BodySm}
                asTag="span"
                className={styles.text}
            >
                {multipleLinkedCases
                    ? t('allFields.linkedCasesRequestsCompleted', {})
                    : t('allFields.requestForProcessCompleted', {
                          caseType: relatedLinkedCases[0].process,
                          updatedAt: dayjs(
                              relatedLinkedCases[0].updatedAt
                          ).format(DEFAULT_EXTENDED_DATE_FORMAT),
                      })}
            </Typography>
            {viewDetailsBtn}
        </BannerAlert>
    ) : (
        <BannerAlert
            variant={BannerVariant.Information}
            canDismiss={false}
            icon={InfoIcon}
        >
            <Typography
                variant={TypographyVariant.BodySm}
                asTag="span"
                className={styles.text}
            >
                {multipleLinkedCases
                    ? t('allFields.linkedCasesRequestsRaised', {
                          caseType: relatedLinkedCases[0].caseType,
                          numberOfLinkedCases,
                      })
                    : t('allFields.requestForProcessRaised', {
                          caseType: relatedLinkedCases[0].process,
                          createdAt: dayjs(
                              relatedLinkedCases[0].createdAt
                          ).format(DEFAULT_EXTENDED_DATE_FORMAT),
                      })}
                {multipleLinkedCases ? (
                    viewDetailsBtn
                ) : (
                    <>
                        <Link
                            href={`/cases/${relatedLinkedCases[0].id}`}
                            target="_blank"
                            className={styles.link}
                        >
                            {relatedLinkedCases[0].process}
                        </Link>
                    </>
                )}
            </Typography>
        </BannerAlert>
    );
};

export default LinkedCases;
