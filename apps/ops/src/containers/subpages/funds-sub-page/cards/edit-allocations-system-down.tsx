import Link from 'next/link';
import { useTranslation } from 'next-i18next';
import { Dispatch, SetStateAction } from 'react';

import Button, { ButtonSize, ButtonType } from '@deps/components/button/button';
import NavElement, {
    NavElementSize,
    NavElementType,
    NavElementVariant,
} from '@deps/components/nav-element/nav-element';
import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import { SideSheetContextLegacyProps } from '@deps/contexts/SideSheetContext';
import { ReactComponent as HexExclamation } from '@deps/styles/elements/icons/icons_outlined/hex-exclamation.svg';

export const EditAllocationsSystemDown = ({
    sideSheet,
    setIsSystenDown,
    setIsNigo,
    setIsSuccessFlow,
}: {
    sideSheet: SideSheetContextLegacyProps;
    setIsSystenDown: Dispatch<SetStateAction<boolean>>;
    setIsSuccessFlow: Dispatch<SetStateAction<boolean>>;
    setIsNigo: Dispatch<SetStateAction<boolean>>;
}) => {
    const { t } = useTranslation();
    return (
        <div className="flex flex-col p-8 h-full items-center">
            <HexExclamation
                className="text-semantic-error"
                width={50}
                height={50}
            />
            <Typography
                variant={TypographyVariant.H3}
                className="text-center pb-1 pt-1"
            >
                {t('fundAllocation.systemErrorTitle')}
            </Typography>
            <Typography
                variant={TypographyVariant.Body}
                className="text-center"
            >
                {t('fundAllocation.systemErrorDes1')}
                <Typography
                    variant={TypographyVariant.Body}
                    className="!underline text-[#00628B]"
                >
                    <Link
                        href="/"
                        className="underline-offset-4 underline text-link"
                    >
                        {t('fundAllocation.systemErrorDes2')}{' '}
                    </Link>
                </Typography>
            </Typography>
            <div className="pt-10 min-w-[100px]">
                <Button
                    className="mx-auto"
                    onClick={() => {
                        setIsSystenDown(false);
                        setIsNigo(false);
                        setIsSuccessFlow(false);
                    }}
                    size={ButtonSize.Small}
                    type={ButtonType.Primary}
                >
                    {t('fundAllocation.updateAllocations')}
                </Button>
            </div>

            <NavElement
                className="pt-4"
                aria-label={t('formControls.cancel') as string}
                onClick={() => {
                    setIsSystenDown(false);
                    sideSheet.handleOpen(false);
                }}
                size={NavElementSize.Small}
                type={NavElementType.Button}
                variant={NavElementVariant.Default}
            >
                {t('fundAllocation.cancelAndClose')}
            </NavElement>
        </div>
    );
};
