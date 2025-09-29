import { Loader } from '@zinnia/bloom/components';
import { useTranslation } from 'next-i18next';
import { useEffect, useState } from 'react';

import { TransformedStep } from '@deps/components/case-sub-page/case-tabs/progress/progress-tab-helpers';
import { INotification } from '@deps/components/side-sheet/side-sheet-case-step-details/tabs/bene-notification-tab/bene-notification-tab.types';
import { getCaseIdentifierValue } from '@deps/helpers/case-management';
import { CaseIdentifier } from '@deps/models/case/case';
import { getTransactionsByRecordId } from '@deps/queries/api/transactions';
import { browserLogInfo } from '@deps/utils/browser-logging';

import {
    getAttemptCount,
    getFilteredTransactions,
    getNextScheduledNotifications,
} from './bene-notification-tab.helpers';
import { DeceasedBeneficiaryNotification } from './decesed-beneficiary-notification';
import { NotificationItem } from './notification-item';
import { ScheduledNotification } from './scheduled-notification';

export function BeneSideSheetStep({ step }: { step: TransformedStep }) {
    const { t } = useTranslation();
    const [notifications, setNotifications] = useState<INotification[]>([]);
    const [loading, setLoading] = useState(true);
    const [identifier, setIdentifier] = useState('');
    const [policyNumber, setPolicyNumber] = useState('');
    const [hasReceivedNotification, setHasReceivedNotification] =
        useState(false);
    const [hasException, setHasException] = useState(false);
    const [carrier, setCarrier] = useState('');

    useEffect(() => {
        const fetchTransactions = async (identifier: string) => {
            const transactionResponse = await getTransactionsByRecordId(
                identifier
            );
            const { transactions, received, hasExceptionOrNigo } =
                getFilteredTransactions(transactionResponse);
            setLoading(false);
            setHasReceivedNotification(received);
            setHasException(hasExceptionOrNigo);
            setNotifications(transactions);

            const policyNumber = transactionResponse?.identifiers
                ? getCaseIdentifierValue(
                      transactionResponse?.identifiers,
                      CaseIdentifier.PolicyNumber
                  )
                : '';

            setPolicyNumber(policyNumber);
            setCarrier(transactionResponse?.carrier ?? '');
        };
        const identifier = step.stepRaw.instanceInfo?.identifier;

        if (identifier) {
            fetchTransactions(identifier);
            setIdentifier(identifier);
        }
    }, [step]);

    browserLogInfo('bene-notification-tab::BeneSideSheetStep', {
        contractNumber: policyNumber,
        identifier: identifier,
        Total: notifications.length,
    });

    const nextScheduledNotification =
        getNextScheduledNotifications(notifications);
    const attemptCount = nextScheduledNotification
        ? getAttemptCount(
              notifications,
              notifications.indexOf(nextScheduledNotification)
          )
        : 0;
    const shouldHideButton = hasException || hasReceivedNotification;
    const showStatusBlock =
        nextScheduledNotification && !hasReceivedNotification;

    if (loading) {
        return (
            <div className="flex justify-center items-center mt-24">
                <Loader />
            </div>
        );
    }

    return (
        <div className="flex flex-col-reverse gap-6">
            {showStatusBlock &&
                (hasException ? (
                    <DeceasedBeneficiaryNotification
                        notification={nextScheduledNotification}
                    />
                ) : (
                    <ScheduledNotification
                        notification={nextScheduledNotification}
                        shouldHideButton={shouldHideButton}
                        policyNumber={policyNumber}
                        carrier={carrier}
                        identifier={identifier}
                        attemptCount={attemptCount}
                    />
                ))}
            {notifications.map((notification, index) => (
                <NotificationItem
                    notification={notification}
                    carrier={carrier}
                    index={index}
                    notifications={notifications}
                    key={`notifications-${index}`}
                />
            ))}
        </div>
    );
}
