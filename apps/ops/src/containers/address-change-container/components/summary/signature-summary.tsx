import { useTranslation } from 'next-i18next';

import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import { TranslationFiles } from '@deps/config/translations';
import { SignatureWithdrawal } from '@deps/models/case/withdrawal/case';

type SignatureSummary = {
    dataRows: SignatureWithdrawal[];
};

export const SignatureSummary = ({ dataRows }: SignatureSummary) => {
    const { t } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: 'addressChange.signature',
    });
    return (
        <>
            <Typography variant={TypographyVariant.H2}>
                {t('header')}
            </Typography>
            <div
                className={`mt-4 grid max-w-3xl grid-cols-5 grid-rows-${dataRows?.length} gap-2`}
            >
                <Typography variant={TypographyVariant.Label}>
                    {t('type')}
                </Typography>
                <Typography variant={TypographyVariant.Label}>
                    {t('printedName')}
                </Typography>
                <Typography variant={TypographyVariant.Label}>
                    {t('signaturePresent')}
                </Typography>
                <Typography variant={TypographyVariant.Label}>
                    {t('designation')}
                </Typography>
                <Typography variant={TypographyVariant.Label}>
                    {t('date')}
                </Typography>

                {dataRows?.map((item: SignatureWithdrawal) => (
                    <>
                        <Typography variant={TypographyVariant.Body}>
                            {item?.signType.text || '-'}
                        </Typography>
                        <Typography variant={TypographyVariant.Body}>
                            {item?.signName || '-'}
                        </Typography>
                        <Typography variant={TypographyVariant.Body}>
                            {t(`${item?.isSigned ? 'yes' : 'no'}`)}
                        </Typography>
                        <Typography variant={TypographyVariant.Body}>
                            {item?.signTitle.text || '-'}
                        </Typography>
                        <Typography variant={TypographyVariant.Body}>
                            {item?.signDate?.text || '-'}
                        </Typography>
                    </>
                ))}
            </div>
        </>
    );
};
