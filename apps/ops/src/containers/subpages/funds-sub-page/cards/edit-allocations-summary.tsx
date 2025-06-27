import { useTranslation } from 'next-i18next';
import { Dispatch, SetStateAction } from 'react';

import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import { ReactComponent as EditAlt } from '@deps/styles/elements/icons/icons_outlined/edit-alt.svg';

import { FundViewModel } from '../types';

interface IEditAllocationsSummary {
    funds: FundViewModel[];
    total: number;
    setIsNigo?: Dispatch<SetStateAction<boolean>>;
    setIsSuccessFlow?: Dispatch<SetStateAction<boolean>>;
    editLink: React.ReactElement;
}
export const EditAllocationsSummary: React.FC<IEditAllocationsSummary> = ({
    funds,
    total,
    editLink,
}) => {
    const { t } = useTranslation();
    return (
        <div className="border p-6">
            <div className="flex gap-1 cursor-pointer text-[#00628B]">
                <EditAlt className="mt-1" width={16} height={16} />
                {editLink}
            </div>
            <div>
                <div className="flex justify-between pt-6">
                    <Typography variant={TypographyVariant.FieldLabel}>
                        {t('fundAllocation.availableFunds')}
                    </Typography>
                    <Typography variant={TypographyVariant.FieldLabel}>
                        {t('fundAllocation.allocation')}
                    </Typography>
                </div>
                <div>
                    {funds?.map((fund) => {
                        return (
                            <div
                                className="flex pt-4 justify-between break-normal"
                                key={fund.fundId}
                            >
                                <span className="max-w-[300px]">
                                    <Typography
                                        variant={TypographyVariant.LabelLgAlt}
                                    >
                                        {fund.fundName}
                                    </Typography>
                                </span>
                                <Typography variant={TypographyVariant.BodySm}>
                                    {fund.allocation}
                                </Typography>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="flex justify-between pt-6">
                <Typography variant={TypographyVariant.FieldLabel}>
                    {t('fundAllocation.total')}
                </Typography>
                <Typography variant={TypographyVariant.FieldLabel}>
                    {total}%
                </Typography>
            </div>
        </div>
    );
};
