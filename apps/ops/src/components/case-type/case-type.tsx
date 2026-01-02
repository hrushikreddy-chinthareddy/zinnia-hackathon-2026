import clsx from 'clsx';
import { useTranslation } from 'next-i18next';

import { TranslationFiles } from '@deps/config/translations';
import { toTitleCase } from '@deps/helpers/string.helpers';
import { DEFAULT_ERROR_STRING } from '@deps/utils/strings';

import { getCaseTypeText } from './case-type.helpers';

export interface CaseTypeProps {
    caseType: string;
    subType?: string;
    variant?: 'table-column' | 'horizontal';
}

export default function CaseType({
    caseType,
    subType,
    variant = 'table-column',
}: CaseTypeProps) {
    const { t } = useTranslation(TranslationFiles.COMMON);

    if (!caseType)
        return (
            <div className="flex items-center">
                <span className="ml-2 font-primary text-base font-semibold text-gray-900">
                    {DEFAULT_ERROR_STRING}
                </span>
            </div>
        );

    const caseTypeLabel = getCaseTypeText(caseType, t);
    const isHorizontal = variant === 'horizontal';

    return (
        <div
            className={clsx(
                'flex min-w-[140px] items-center font-primary text-gray-900',
                { 'gap-2': isHorizontal }
            )}
        >
            <div
                className={clsx('flex', {
                    'ml-2 flex-col justify-between': !isHorizontal,
                    'items-center gap-2': isHorizontal,
                })}
            >
                <span
                    className={clsx(
                        `font-primary text-base font-semibold text-gray-900`,
                        {
                            'border-r-2 pr-2 last:border-none last:pr-0':
                                isHorizontal,
                        }
                    )}
                >
                    {caseTypeLabel}
                </span>
                {subType && (
                    <span
                        className={clsx('text-content-caption font-medium', {
                            'mt-0.5': isHorizontal,
                        })}
                        aria-hidden="true"
                    >
                        {toTitleCase(subType)}
                    </span>
                )}
            </div>
        </div>
    );
}
