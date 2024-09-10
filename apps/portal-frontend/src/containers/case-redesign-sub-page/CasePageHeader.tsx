import { BadgeVariant, Tag } from '@zinnia/bloom/components';

import NavElement, { NavElementSize, NavElementType, NavElementVariant } from '@deps/components/nav-element/nav-element';
import { PopoverPlacement } from '@deps/components/popover/popover';
import { StatusBadge } from '@deps/components/status-badge/status-badge';
import Tooltip from '@deps/components/tooltip/tooltip';
import Typography, { TypographyVariant } from '@deps/components/typography/typography';
import { toSentenceCase, toTitleCase } from '@deps/helpers/string.helper';
import useBreadcrumb from '@deps/hooks/useBreadcrumbs';
import { PolicyStatus } from '@deps/models/policy/sor-policy';
import { ReactComponent as LeftArrow } from '@deps/styles/elements/icons/arrow/direction-left-3.svg';

interface CasePageHeaderProps {
    status: PolicyStatus | string;
    statusTooltip: string;
    statusVariant: BadgeVariant;
    tag: string;
    title: string;
}

const CasePageHeader = ({ title, tag, status, statusTooltip, statusVariant }: CasePageHeaderProps) => {
    const caseTitle = toSentenceCase(title);

    const { breadcrumb } = useBreadcrumb();

    return (
        <div className="flex items-start gap-4 rounded-t border-b-2 border-gray-100 bg-white p-4 md:items-center md:p-8">
            {breadcrumb?.url && (
                <Tooltip placement={PopoverPlacement.TopRight} body={breadcrumb?.text} isTabbable={false}>
                    <NavElement
                        aria-label={breadcrumb?.text}
                        href={breadcrumb?.url}
                        size={NavElementSize.Default}
                        startIcon={<LeftArrow height={24} width={24} />}
                        type={NavElementType.Link}
                        variant={NavElementVariant.Secondary}
                    />
                </Tooltip>
            )}
            <div>
                {caseTitle && <Tag text={tag} className="mb-2" />}
                <div className="flex flex-col items-start gap-4 md:flex-row md:items-center">
                    <Typography variant={TypographyVariant.H1}>{toTitleCase(caseTitle || tag)}</Typography>
                    {!!status && !!statusTooltip && (
                        <Tooltip placement={PopoverPlacement.TopRight} body={statusTooltip}>
                            <StatusBadge label={toTitleCase(status)} variant={statusVariant} />
                        </Tooltip>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CasePageHeader;
