import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';

import Button, { ButtonSize, ButtonType } from '@deps/components/button/button';
import NavElement, { NavElementSize, NavElementType, NavElementVariant } from '@deps/components/nav-element/nav-element';
import Typography, { TypographyVariant } from '@deps/components/typography/typography';
import { SideSheetContextProps } from '@deps/contexts/SideSheetContext';


export const EditAllocationSuccess = ({ caseId, sideSheet, policyOwner }: { caseId: string, sideSheet: SideSheetContextProps, policyOwner: string }) => {
    const { t } = useTranslation();
    const router = useRouter();
    return (
        <div className="flex flex-col p-8 h-full">
            <Typography variant={TypographyVariant.H3} className="text-center pb-2">{t('fundAllocation.successTitle')}</Typography>
            {/* need to ask how to get name */}
            <Typography variant={TypographyVariant.Body}>
                <Typography variant={TypographyVariant.BodyBold} className="inline">{policyOwner}'s </Typography>
                {t('fundAllocation.requestTo')} <Typography variant={TypographyVariant.BodyBold} className="inline">{t('fundAllocation.editAllocations')}</Typography> {t('fundAllocation.editSuccessMsg')}</Typography>
            <div className="pt-10 min-w-[100px]">
                <Button
                    className="mx-auto"
                    onClick={() => {
                        router.push(`/cases/${caseId}/progress`);
                    }}
                    size={ButtonSize.Small}
                    type={ButtonType.Primary}
                >
                    {t('fundAllocation.goToCase')}
                </Button>
            </div>

            <NavElement
                className="pt-4"
                aria-label={t('formControls.cancel') as string}
                onClick={() => { sideSheet.handleOpen(false) }}
                size={NavElementSize.Small}
                type={NavElementType.Button}
                variant={NavElementVariant.Default}
            >
                {t('fundAllocation.close')}
            </NavElement>
        </div>
    )
}