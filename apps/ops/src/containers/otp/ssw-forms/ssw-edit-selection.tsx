import { useRouter } from 'next/router';
import { TFunction, useTranslation } from 'next-i18next';
import { useContext, useEffect, useState } from 'react';

import { FieldSize } from '@deps/components/fields/field';
import PageLoader, { PageLoaderVariant } from '@deps/components/page-loader/page-loader';
import SelectSimple from '@deps/components/select/select';
import { FormDataContext } from '@deps/contexts/OtpWithdrawalFormContext';
import { SswUpdateOption } from '@deps/models/case/enums';

export const sswUpdateOptions = (t: TFunction) => [
    {
        label: t('sswUpdateOptions.new'),
        value: SswUpdateOption.NEW,
    },
    {
        label: t('sswUpdateOptions.rmdUpdate'),
        value: SswUpdateOption.RMD_UPDATE,
    },
    {
        label: t('sswUpdateOptions.sswUpdate'),
        value: SswUpdateOption.SSW_UPDATE,
    },
    {
        label: t('sswUpdateOptions.bankUpdate'),
        value: SswUpdateOption.BANK_UPDATE,
    },
    {
        label: t('sswUpdateOptions.eftDrawUpdate'),
        value: SswUpdateOption.EFT_DRAW_UPDATE,
    },
];

const SswEditSelection = () => {
    const { t } = useTranslation(undefined, { keyPrefix: 'caseSSW.request' });
    const router = useRouter();
    const { initialForm } = useContext(FormDataContext);
    const [sswRequest, setSswRequest] = useState(SswUpdateOption.NEW);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        switch (sswRequest) {
            case SswUpdateOption.BANK_UPDATE: {
                setLoading(true);
                router.push(`/ssw-edit/bank-update?taskId=${initialForm?.taskId}`);
                break;
            }
            case SswUpdateOption.SSW_UPDATE: {
                setLoading(true);
                router.push(`/ssw-edit/ssw-update?taskId=${initialForm?.taskId}&programType=SSW`);
                break;
            }
            case SswUpdateOption.RMD_UPDATE: {
                setLoading(true);
                router.push(`/ssw-edit/ssw-update?taskId=${initialForm?.taskId}&programType=RMD`);
                break;
            }
            case SswUpdateOption.EFT_DRAW_UPDATE: {
                setLoading(true);
                router.push(`/ssw-edit/ssw-update?taskId=${initialForm?.taskId}&programType=EFT`);
                break;
            }
        }
    }, [sswRequest]);

    if (loading)
        return (
            <div className="fixed left-0 top-0 z-10 flex h-screen w-screen justify-center bg-gray-800 opacity-80">
                <PageLoader variant={PageLoaderVariant.Center} />
            </div>
        );

    return (
        <div>
            <SelectSimple
                disabled={false}
                className="max-w-lg my-3"
                label={t('sswRequest') as string}
                options={sswUpdateOptions(t)}
                onChange={(val: string) => {
                    setSswRequest(val as SswUpdateOption);
                    setLoading(true);
                }}
                size={FieldSize.Small}
                value={sswRequest}
                name="sswRequest"
            />
        </div>
    );
};

export default SswEditSelection;
