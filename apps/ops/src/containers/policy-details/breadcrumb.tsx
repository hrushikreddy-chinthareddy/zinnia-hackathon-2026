import NavElement, { NavElementSize, NavElementType } from '@deps/components/nav-element/nav-element';
import { Breadcrumb as BreadcrumbDataProps } from '@deps/hooks/useBreadcrumbs';
import { ReactComponent as LeftArrow } from '@deps/styles/elements/icons/arrow/direction-left-3.svg';
interface BreadcrumbProps extends BreadcrumbDataProps {
    classNames?: string;
}

export const Breadcrumb = (breadcrumbData: BreadcrumbProps | null) => {
    return (
        <>
            {breadcrumbData?.url && (
                <div className={breadcrumbData?.classNames || ''}>
                    <NavElement
                        aria-label={breadcrumbData.text}
                        className={`flex w-fit items-center`}
                        href={breadcrumbData.url}
                        size={NavElementSize.Small}
                        type={NavElementType.Link}
                        startIcon={<LeftArrow height={16} width={16} />}
                    >
                        <span>{breadcrumbData.text}</span>
                    </NavElement>
                </div>
            )}
        </>
    );
};
