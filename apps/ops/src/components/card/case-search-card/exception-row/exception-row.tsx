import { useTranslation } from 'next-i18next';

import { TranslationFiles } from '@deps/config/translations';
import { calculateDaysAgo } from '@deps/helpers/case-management';
import { toSentenceCase } from '@deps/helpers/string.helper';
import { ExceptionInstance } from '@deps/models/case/exception-instance';

export default function ExceptionRow({ exceptions }: { exceptions: ExceptionInstance[] }) {
    const { t } = useTranslation(TranslationFiles.COMMON);

    const numberOfExceptions = exceptions.length;
    const exceptionToDisplay = exceptions[0];

    const daysAgo = calculateDaysAgo(new Date(exceptionToDisplay.updatedAt));
    const exceptionsRemaining = numberOfExceptions - 1;

    const daysAgoText = t('temporal.daysAgo', { count: daysAgo });
    const reason = exceptionToDisplay.reason;
    const exceptionsRemainingText = t('caseManagementDashboard.exception.remaining', {
        count: exceptionsRemaining,
    });
    const sentenceCaseReason = toSentenceCase(reason);

    return (
        <div className="flex w-full rounded-b-md bg-gray-50">
            <div className={'mx-4 my-2 flex w-[280px] items-center rounded-b-md sm:w-[460px] md:w-[720px] lg:w-[980px]'}>
                <span
                    data-testid={`exception-days-ago-${daysAgo}`}
                    className="flex-none font-primary text-sm font-medium text-semantic-error"
                >
                    <span className="sr-only">{t('caseManagementDashboard.refineResultsOptions.exceptionRaised')}</span> {daysAgoText}
                </span>

                <span
                    data-testid="exception-reason"
                    className="ml-1 flex-shrink overflow-hidden overflow-ellipsis whitespace-nowrap font-primary text-sm font-medium text-black"
                >
                    {sentenceCaseReason}
                </span>

                {exceptionsRemaining > 0 && (
                    <span
                        data-testid={`exception-remaining-${exceptionsRemaining}`}
                        className="ml-1 flex-none font-primary text-sm font-medium text-semantic-error"
                    >
                        {exceptionsRemainingText}
                    </span>
                )}
            </div>
        </div>
    );
}
