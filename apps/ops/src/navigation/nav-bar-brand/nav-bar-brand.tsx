import Image from 'next/image';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import React from 'react';

import NavElement, { NavElementSize, NavElementType, NavElementVariant } from '@deps/components/nav-element/nav-element';
import { TranslationFiles } from '@deps/config/translations';
import { ReactComponent as CancelIcon } from '@deps/styles/elements/icons/actions/cancel.svg';
import { ReactComponent as MenuIcon } from '@deps/styles/elements/icons/navigation/menu.svg';

interface NavBarBrandProps {
    isOpen: boolean;
    toggleMenu: (event: React.MouseEvent<HTMLElement>) => void;
    onClose: () => void;
    adjustResponsiveBreakPoint: boolean;
}

export const NavBarBrand = ({ isOpen, toggleMenu, onClose, adjustResponsiveBreakPoint }: NavBarBrandProps) => {
    const { t, i18n } = useTranslation(TranslationFiles.COMMON);
    const { language } = i18n;
    const router = useRouter();
    const homePageUrl = t('site.home.link');
    const imageSrc = '/images/logos/zinnia-logo.svg';
    const siteName = t('site.name');
    const iconResponsiveBreakPointClass = adjustResponsiveBreakPoint ? 'mid:hidden' : 'md:hidden';
    const spacingResponsiveBreakPointClasses = adjustResponsiveBreakPoint ? 'mid:pr-4' : 'md:pr-4';
    const iconClasses = `w-5 mr-2 [&>*]:mr-0 h-5 ${iconResponsiveBreakPointClass} sm:block`;
    let icon;

    if (isOpen) {
        icon = (
            <NavElement
                startIcon={<CancelIcon height={20.59} width={20.59} className="text-secondary" rotate={'45deg'} />}
                type={NavElementType.Button}
                size={NavElementSize.Small}
                tabIndex={0}
                className={iconClasses}
                onClick={onClose}
            >
                {' '}
            </NavElement>
        );
    } else {
        icon = (
            <NavElement
                startIcon={<MenuIcon height={16} width={16} className="text-secondary" />}
                type={NavElementType.Button}
                size={NavElementSize.Small}
                tabIndex={0}
                className={iconClasses}
                onClick={toggleMenu}
            >
                {' '}
            </NavElement>
        );
    }

    const goTo = (url: string) => {
        router.push(url, undefined, { locale: language }).then(() => {
            router.reload();
        });
    };

    return (
        <div>
            <div className={`${spacingResponsiveBreakPointClasses} flex h-[80px] w-[240px] items-center pl-8 pr-8`}>
                {icon}
                <div className="flex h-[80px] w-[240px] flex-row items-center">
                    <NavElement
                        type={NavElementType.Link}
                        variant={NavElementVariant.Text}
                        href={homePageUrl}
                        onClick={() => goTo(homePageUrl)}
                        className="default-focus h-[31px] rounded-xl py-0"
                    >
                        <Image src={imageSrc} alt={siteName} height={31} width={120} aria-label={siteName} />
                    </NavElement>
                </div>
            </div>
        </div>
    );
};
