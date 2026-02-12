import { useTranslation } from 'next-i18next';
import { Dispatch, SetStateAction, useState } from 'react';

import BannerAlert, {
    BannerVariant,
} from '@deps/components/banner-alert/banner-alert';
import Button, { ButtonSize, ButtonType } from '@deps/components/button/button';
import CheckboxText from '@deps/components/checkbox/checkbox-text/checkbox-text';
import NavElement, {
    NavElementSize,
    NavElementType,
    NavElementVariant,
} from '@deps/components/nav-element/nav-element';
import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
/**
 * @deprecated Use standard Sidesheet from Bloom component library
 */
import { SideSheetContextLegacyProps } from '@deps/contexts/SideSheetContext';
import { ReactComponent as HexExclamation } from '@deps/styles/elements/icons/icons_outlined/hex-exclamation.svg';

import { FundViewModel } from '../types';
import { EditAllocationsSummary } from './edit-allocations-summary';

interface IEditAllocationNigo {
    allFunds: FundViewModel[];
    setIsNigo: Dispatch<SetStateAction<boolean>>;
    total: number;
    error: string;
    sideSheet: SideSheetContextLegacyProps;
    submitHandler: (location: string) => Promise<void>;
}
export const EditAllocationNigo = ({
    setIsNigo,
    allFunds,
    total,
    error,
    sideSheet,
    submitHandler,
}: IEditAllocationNigo) => {
    const { t } = useTranslation();
    const [isChecked, setIsChecked] = useState<boolean>(false);
    return (
        <div className="flex flex-col p-8 h-full">
            <div className="flex flex-col items-center pb-10">
                <HexExclamation
                    className="text-semantic-error"
                    width={50}
                    height={50}
                />
                <Typography
                    variant={TypographyVariant.H3}
                    className="pb-1 pt-1"
                >
                    {t('fundAllocation.nigoErrorTItle')}
                </Typography>
                <Typography variant={TypographyVariant.Body}>
                    {t('fundAllocation.nigoErrorDes')}
                </Typography>
            </div>

            <EditAllocationsSummary
                funds={allFunds}
                total={total}
                setIsNigo={setIsNigo}
                editLink={
                    <Typography
                        variant={TypographyVariant.BodySm}
                        onClick={() => {
                            setIsNigo(false);
                        }}
                    >
                        {t('fundAllocation.editAllocationsTitle')}
                    </Typography>
                }
            />

            <div className="pt-8">
                <BannerAlert canDismiss={false} variant={BannerVariant.Error}>
                    <b>{error}</b> {t('fundAllocation.errorResolution')}
                </BannerAlert>
            </div>

            <div className="flex pt-6">
                <CheckboxText
                    label={t('fundAllocation.checkBoxDes')}
                    checked={isChecked}
                    onChange={() => setIsChecked(!isChecked)}
                />
            </div>
            <div className="flex items-baseline">
                <div className="pt-10 pr-8 min-w-[100px]">
                    <Button
                        className="mx-auto"
                        onClick={
                            isChecked
                                ? () => {
                                      submitHandler('nigoFlow');
                                  }
                                : undefined
                        }
                        size={ButtonSize.Small}
                        type={ButtonType.Primary}
                    >
                        {t('fundAllocation.submit')}
                    </Button>
                </div>

                <NavElement
                    className="pt-4"
                    aria-label={t('formControls.cancel') as string}
                    onClick={() => {
                        sideSheet?.handleOpen(false);
                    }}
                    size={NavElementSize.Small}
                    type={NavElementType.Button}
                    variant={NavElementVariant.Default}
                >
                    {t('fundAllocation.cancel')}
                </NavElement>
            </div>
        </div>
    );
};
