import NavElement, { NavElementType } from '@deps/components/nav-element/nav-element';
import QuickActionsMenu, { QuickActionsMenuProps } from '@deps/components/quick-actions-menu/quick-actions-menu';

export interface QuickLinksProps extends QuickActionsMenuProps {
    links: {
        href: string;
        name: string;
    }[];
    isLife: boolean;
}

const QuickLinks = ({ links, planCode, policyNumber, eligibilityCheck, isLoading, onOpenChange, isLife }: QuickLinksProps) => {
    return (
        <div className="flex flex-wrap gap-x-8 gap-y-4 text-md" data-testid="quick-links">
            {links.map(({ name, href }) => (
                <NavElement type={NavElementType.Link} className="font-primary text-md" data-testid={name} href={href} key={name + href}>
                    {name}
                </NavElement>
            ))}

            {isLife && (
                <>
                    <div className="hidden min-w-[2px] bg-gray-100 md:block" />

                    <QuickActionsMenu
                        planCode={planCode}
                        policyNumber={policyNumber}
                        eligibilityCheck={eligibilityCheck}
                        isLoading={isLoading}
                        onOpenChange={onOpenChange}
                    />
                </>
            )}
        </div>
    );
};

export default QuickLinks;
