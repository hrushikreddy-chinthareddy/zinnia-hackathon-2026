import { PolicyStatus } from '@zinnia/api-types/types/sor';
import { BadgeVariant } from '@zinnia/bloom/components';
import { useTranslation } from 'next-i18next';

import NavElement, { NavElementSize, NavElementType } from '@deps/components/nav-element/nav-element';
import { PopoverPlacement } from '@deps/components/popover/popover';
import { StatusBadge } from '@deps/components/status-badge/status-badge';
import Tooltip from '@deps/components/tooltip/tooltip';
import Typography, { TypographyVariant } from '@deps/components/typography/typography';
import { toSentenceCase, toTitleCase } from '@deps/helpers/string.helpers';
import useBreadcrumb from '@deps/hooks/useBreadcrumbs';
import { ReactComponent as LeftArrow } from '@deps/styles/elements/icons/arrow/direction-left-3.svg';
import { DEFAULT_ERROR_STRING } from '@deps/types/constants';

interface CasePageHeaderProps {
    caseId: string;
    status: PolicyStatus | string;
    statusTooltip: string;
    statusVariant: BadgeVariant;
    tag: string;
    title: string;
}

const CasePageHeader = ({ caseId, title, tag, status, statusTooltip, statusVariant }: CasePageHeaderProps) => {
    const { t } = useTranslation();
    const { breadcrumb } = useBreadcrumb();
    const caseTitle = toSentenceCase(title);

    return (
        <div className="flex items-start gap-4 rounded-t border-b-2 border-gray-100 bg-white pb-4 md:items-center md:pb-8">
            {breadcrumb?.url && (
                <Tooltip placement={PopoverPlacement.TopRight} body={breadcrumb?.text} isTabbable={false}>
                    <NavElement
                        aria-label={breadcrumb?.text}
                        href={breadcrumb?.url}
                        size={NavElementSize.Default}
                        startIcon={<LeftArrow height={24} width={24} />}
                        type={NavElementType.Link}
                    />
                </Tooltip>
            )}
            <div className="flex flex-col gap-2">
                <div className="flex flex-col md:flex-row items-start md:gap-4">
                    <div className="flex flex-col">
                        <Typography variant={TypographyVariant.H1}>{toTitleCase(caseTitle || tag)}</Typography>
                        <Typography className="text-gray-600 my-2 md:mb-0" variant={TypographyVariant.Body}>
                            {t('caseOverview.sidenav.caseId', { caseId: caseId.length > 0 ? caseId : DEFAULT_ERROR_STRING })}
                        </Typography>
                    </div>
                    {!!status && !!statusTooltip && (
                        <Tooltip triggerClassName="md:mt-2" placement={PopoverPlacement.TopRight} body={statusTooltip}>
                            <StatusBadge label={toTitleCase(status)} variant={statusVariant} />
                        </Tooltip>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CasePageHeader;
