import { useUser } from '@auth0/nextjs-auth0/client';
import { useTranslation } from 'next-i18next';

import MenuContextual from '@deps/components/menu-contextual/menu-contextual';
import MenuContextualItem from '@deps/components/menu-contextual/menu-contextual-item/menu-contextual-item';
import NavElement, { NavElementType, NavElementVariant } from '@deps/components/nav-element/nav-element';
import { TranslationFiles } from '@deps/config/translations';
import { storage } from '@deps/helpers/sessionStorage.helper';
import { firstNameAndLastInitial } from '@deps/helpers/string.helper';
import { ReactComponent as SignOutIcon } from '@deps/styles/elements/icons/actions/logout.svg';
import { ReactComponent as ChevronDown } from '@deps/styles/elements/icons/arrow/chevron-down.svg';

interface NavBarButtonsProps {
    onClick: () => void;
}

export const NavBarButtons = ({ onClick }: NavBarButtonsProps) => {
    const { user } = useUser();
    const { t } = useTranslation(TranslationFiles.COMMON);

    const borderBottomOpenStateClass =
        'group-data-[state=open]:border-b-3 group-data-[state=open]:[border-image-source:linear-gradient(90deg,rgb(255,198,000),rgb(255,117,000)_75.54%,rgb(255,24,34))] group-data-[state=open]:[border-image-slice:1]';
    const borderBottomClass = `simple-transition border-transparent hover:border-b-gray-900 border-b-2 pb-0 ${borderBottomOpenStateClass}`;
    const fontWeightClass = 'font-[300] group-data-[state=open]:font-medium';

    return (
        <div className="nav-bar__buttons mr-8 md:mr-14" onClick={onClick}>
            {!user && (
                <>
                    <NavElement
                        type={NavElementType.Link}
                        href={t('auth.signIn.link') ?? '/api/auth/login'}
                        className={'mr-4'}
                        variant={NavElementVariant.Text}
                    >
                        {t('auth.signIn.text')}
                    </NavElement>
                </>
            )}

            {user && (
                <MenuContextual
                    trigger={
                        <div className={`flex items-center justify-center ${borderBottomClass}`}>
                            <p className={`mr-2 font-primary text-md text-secondary hover:text-secondary-dark ${fontWeightClass}`}>
                                {firstNameAndLastInitial(user?.name) || ''}
                            </p>
                            <ChevronDown
                                className="simple-transition text-secondary group-data-[state=open]:rotate-180"
                                height={24}
                                width={24}
                            />
                        </div>
                    }
                >
                    <MenuContextualItem
                        href={t('auth.logout.link') ?? '/api/auth/logout'}
                        onClick={() => {
                            // Remove all items from sessionStorage, including cached API responses
                            storage.clear();
                        }}
                        icon={<SignOutIcon height={20} width={20} />}
                        content={t('auth.logout.text')}
                    />
                </MenuContextual>
            )}
        </div>
    );
};
