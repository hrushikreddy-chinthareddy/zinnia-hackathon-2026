import { Icon, IconType } from '@zinnia/bloom/components';
import clsx from 'clsx';
import { useState } from 'react';

import MenuContextual from '@deps/components/menu-contextual/menu-contextual';
import MenuContextualItem from '@deps/components/menu-contextual/menu-contextual-item/menu-contextual-item';
import MenuContextualLabel from '@deps/components/menu-contextual/menu-contextual-label/menu-contextual-label';
import NavElement, { NavElementType } from '@deps/components/nav-element/nav-element';
import QuickActionsMenu, { QuickActionsMenuProps } from '@deps/components/quick-actions-menu/quick-actions-menu';
import Typography, { TypographyVariant } from '@deps/components/typography/typography';
import { segmentAnalyticsTrackEvent } from '@deps/helpers/analytics/segment-analytics';
import { PolicyDetails } from '@deps/helpers/policy-sor/PolicyDetails';
import { PolicyClickedEvent, SegmentTrackedEventName } from '@deps/types/segment-analytics';

export interface QuickLinksProps extends QuickActionsMenuProps {
    links: {
        href: string;
        name: string;
        hideLabel?: boolean;
        subLinks?: { href: string; name: string }[];
    }[];
    policy: PolicyDetails;
    sessionId: string;
    userPartyId: string;
    className?: string;
}

const trackClick = (
    segmentTrackingName: string,
    linkName: string,
    linkUrl: string,
    policyNumber: string | undefined,
    sessionId: string | undefined,
    userPartyId: string | undefined
) => {
    if (!segmentTrackingName || !userPartyId || !sessionId) {
        return;
    }

    segmentAnalyticsTrackEvent<PolicyClickedEvent>(segmentTrackingName, {
        contractNumber: policyNumber,
        linkName,
        linkUrl,
        session_id: sessionId,
        userId: userPartyId,
    });
};

const QuickLinks = ({ links, policy, sessionId, userPartyId, className }: QuickLinksProps) => {
    const [isLife] = useState(policy.isLife);
    const [isAnnuity] = useState(policy.isAnnuity);

    return (
        <div className={clsx('flex flex-wrap gap-x-8 gap-y-4', className)} data-testid="quick-links">
            {links.map(({ name, href, subLinks, hideLabel }) => {
                if (subLinks) {
                    return (
                        <MenuContextual
                            key={name + href}
                            trigger={
                                <Typography className="block" variant={TypographyVariant.NavLinks}>
                                    {name}
                                    <Icon type={IconType.CHEVRON} height={16} width={16} className="ml-1" />
                                </Typography>
                            }
                        >

                            <MenuContextualLabel label={name} hideLabel={hideLabel}>
                                {subLinks.map(subLink => {
                                    return (
                                        <MenuContextualItem
                                            content={subLink.name}
                                            href={subLink.href}
                                            key={subLink.name}
                                            onClick={() =>
                                                trackClick(
                                                    SegmentTrackedEventName.PolicyClicked,
                                                    subLink.name,
                                                    subLink.href,
                                                    policy.policyNumber,
                                                    sessionId,
                                                    userPartyId
                                                )
                                            }
                                        />
                                    );
                                })}
                            </MenuContextualLabel>
                        </MenuContextual>
                    );
                } else {
                    return (
                        <NavElement
                            className="nav-links"
                            data-testid={name}
                            href={href}
                            key={name + href}
                            onClick={() =>
                                trackClick(SegmentTrackedEventName.PolicyClicked, name, href, policy.policyNumber, sessionId, userPartyId)
                            }
                            type={NavElementType.Link}
                        >
                            {name}
                        </NavElement>
                    );
                }
            })}

            {(isLife || isAnnuity) && (
                <>
                    <div className="hidden min-w-[2px] bg-gray-100 md:block" />

                    <QuickActionsMenu policy={policy} />
                </>
            )}
        </div>
    );
};

export default QuickLinks;
