import { toSentenceCase } from '@xd/utils/dist';
import { Icon, IconType } from '@zinnia/bloom/components';
import Image from 'next/image';
import { TFunction, useTranslation } from 'next-i18next';

import PizzaTracker, {
    PizzaTrackerProps,
    Status as PizzaStatus,
} from '@deps/components/pizza-tracker/pizzaTracker';
import { getTimeAgoUnitValue } from '@deps/hooks/useStatusInfo';
import { Case, Statuses } from '@deps/models/case/case';
import { getCarrierLogoByClientId } from '@deps/utils/carriers';

import styles from './CaseCard.module.css';

const CASE_TO_PIZZA_STATUS: Record<Statuses, PizzaStatus> = {
    [Statuses.Canceled]: PizzaStatus.Default,
    [Statuses.Completed]: PizzaStatus.Complete,
    [Statuses.InProgress]: PizzaStatus.Progress,
    [Statuses.NotStarted]: PizzaStatus.Default,
    [Statuses.Withdrawn]: PizzaStatus.Default,
    [Statuses.Exception]: PizzaStatus.Issue,
    [Statuses.New]: PizzaStatus.Default,
    [Statuses.Overridden]: PizzaStatus.Complete,
    [Statuses.Inprogress]: PizzaStatus.Progress,
    [Statuses.Pending]: PizzaStatus.Default,
    [Statuses.Resolved]: PizzaStatus.Complete,
    [Statuses.Unresolved]: PizzaStatus.Default,
    [Statuses.Issued]: PizzaStatus.Default,
};

const buildPizzaTrackerSteps = (
    caseDetails: Case,
    t: TFunction
): PizzaTrackerProps['steps'] => {
    if (!caseDetails?.stages) {
        return [];
    }
    return caseDetails?.stages?.map((stage) => ({
        status: CASE_TO_PIZZA_STATUS[stage.stageStatus] ?? PizzaStatus.Default,
        label: t(`caseManagementApiKeys.stages.${stage.id}`, {
            subType: caseDetails?.processSubType,
        }),
    }));
};

export default function CaseCard({
    caseDetails,
    ...rest
}: { caseDetails: Case } & React.HTMLAttributes<HTMLLIElement>) {
    const { t } = useTranslation();
    const { unit, count } = getTimeAgoUnitValue(caseDetails.updatedAt) || {};
    return (
        <li {...rest} className={styles.caseCard}>
            <div className={styles.caseCardContainer}>
                <div className={styles.caseCardInfo}>
                    <div className={styles.caseCardInfoLeftSide}>
                        <Image
                            alt={caseDetails.carrier}
                            width={48}
                            height={48}
                            src={getCarrierLogoByClientId(caseDetails.carrier)}
                            className={styles.carrierLogo}
                        />
                        <div className={styles.caseCardInfoText}>
                            <span className="typography-labels-field-label">
                                <Icon
                                    type={IconType.DOCUMENT_TEXT}
                                    height={16}
                                    width={16}
                                />
                                Application (placeholder)
                            </span>
                            <span className="typography-labels-label-lg-alt">
                                {caseDetails.productName ?? 'Placeholder'}
                            </span>
                        </div>
                    </div>
                    <div className={styles.caseCardInfoRightSide}>
                        <div className={styles.caseCardRightSideInfo}>
                            <span className="typography-content-body-sm">
                                {caseDetails.process}
                                {caseDetails.processSubType
                                    ? ` ${caseDetails.processSubType}`
                                    : ''}
                            </span>
                            <span
                                className={`typography-labels-label-sm-alt ${styles.timeAgo}`}
                            >
                                {toSentenceCase(t('contacts.updated'))}{' '}
                                {t('temporal.timeago', {
                                    count,
                                    unit,
                                    formattedDate: null,
                                })}
                            </span>
                        </div>
                        <Icon
                            type={IconType.CHEVRON_RIGHT}
                            height={16}
                            width={16}
                            className={`${styles.icon} text-secondary`}
                        />
                    </div>
                </div>
                <div className={styles.pizzaTrackerContainer}>
                    <PizzaTracker
                        steps={buildPizzaTrackerSteps(caseDetails, t)}
                    />
                </div>
            </div>
        </li>
    );
}
