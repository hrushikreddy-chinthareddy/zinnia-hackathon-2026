import { useTranslation } from 'next-i18next';

import { TranslationFiles } from '@deps/config/translations';

import { PiiWrapper } from '../pii/PiiWrapper';
import Typography, { TypographyVariant } from "../typography/typography";

interface DocumentInfoProps {
    documentNumber: string;
}

export const DocumentInfo = ({ documentNumber }: DocumentInfoProps) => {
    const { t } = useTranslation(TranslationFiles.COLDEFS, { useSuspense: false });
    return (
       <div className="mt-4 flex shrink-0 items-center sm:ml-14 md:ml-0 md:mt-0">
            <div className="flex flex-col">
                <label className="font-primary text-[12px] font-bold text-gray-900">
                    {t('document.title')}
                </label>
                <Typography variant={TypographyVariant.BodySm}><PiiWrapper>{documentNumber}</PiiWrapper></Typography>
            </div>
        </div>
    )
};