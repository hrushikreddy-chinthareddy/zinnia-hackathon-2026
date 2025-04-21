import { useTranslation } from 'next-i18next';

import Button, { ButtonSize, ButtonType } from '@deps/components/button/button';
import Typography, { TypographyVariant } from '@deps/components/typography/typography';
import { SideSheetContextProps } from '@deps/contexts/SideSheetContext';
import { ReactComponent as CircleCheckMark } from '@deps/styles/elements/icons/circles/circle-checkmark.svg';


export const EditAllocationsNigoSuccess = ({ sideSheet }: { sideSheet: SideSheetContextProps; }) => {
    const { t } = useTranslation();
    return (
        <div className="flex flex-col p-8 h-full items-center">
            <CircleCheckMark width={50} height={50} color="#007B5A" />
            <Typography variant={TypographyVariant.H3} className="pt-1 pb-1">{t('fundAllocation.submitted')}</Typography>
            <Typography variant={TypographyVariant.Body}>{t('fundAllocation.editAllocationNigoSummary1')}<Typography variant={TypographyVariant.BodyBold} className="inline">{t('fundAllocation.editAllocationNigoSummary2')}</Typography></Typography>

            <div className="p-10">
                <Button
                    className="mx-auto"
                    onClick={() => { sideSheet?.handleOpen(false) }}
                    size={ButtonSize.Small}
                    type={ButtonType.Primary}
                >
                    {t('fundAllocation.close')}
                </Button>
            </div>
        </div>
    )
}