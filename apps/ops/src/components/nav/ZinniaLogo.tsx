import Image from 'next/image';

import zinniaLogo from '@deps/styles/images/icons/zinnia-logo-small-icon-only.svg';
import zinniaText from '@deps/styles/images/icons/zinnia-logo-small-text-only.svg';

export const ZinniaLogo = ({
    handleLogoClick,
    isExpanded,
    expandText,
}: {
    handleLogoClick: () => void;
    isExpanded: boolean;
    expandText: string;
}) => {
    return (
        <>
            <button
                onClick={handleLogoClick}
                aria-label={isExpanded ? undefined : expandText}
                disabled={isExpanded}
            >
                <Image
                    src={zinniaLogo}
                    alt="Zinnia Logo"
                    height={24}
                    width={24}
                />
            </button>
            <Image src={zinniaText} alt="Zinnia Logo" height={24} width={66} />
        </>
    );
};
