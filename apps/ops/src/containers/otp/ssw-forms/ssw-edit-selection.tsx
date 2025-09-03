import { useRouter } from 'next/router';
import { TFunction, useTranslation } from 'next-i18next';
import { useContext, useState } from 'react';

import { FieldSize } from '@deps/components/fields/field';
import PageLoader, {
    PageLoaderVariant,
} from '@deps/components/page-loader/page-loader';
import SelectSimple from '@deps/components/select/select';
import { SimpleOption } from '@deps/components/select/select.helpers';
import { FormDataContext } from '@deps/contexts/OtpWithdrawalFormContext';
import { SswUpdateOption } from '@deps/models/case/enums';
import { Carrier } from '@deps/models/case/withdrawal/case';

export const sswUpdateOptions = (t: TFunction, carrier = '') =>
    [
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
        carrier !== Carrier.MASS && {
            label: t('sswUpdateOptions.withholdingUpdate'),
            value: SswUpdateOption.WITHHOLDING_UPDATE,
        },
    ].filter(Boolean) as Array<{
        label: string;
        value: SswUpdateOption;
    }>;

interface SswEditSelectionProps {
    carrier?: string;
    isLC?: boolean;
    fastOptions?: Array<{ label: string; value: SswUpdateOption }>;
}

const SswEditSelection = ({
    carrier = '',
    isLC = true,
    fastOptions,
}: SswEditSelectionProps) => {
    const { t } = useTranslation(undefined, { keyPrefix: 'caseSSW.request' });
    const router = useRouter();
    const { initialForm, isFormStateReadOnly } = useContext(FormDataContext);
    const [sswRequest, setSswRequest] = useState(SswUpdateOption.NEW);
    const [loading, setLoading] = useState(false);

    const handleChange = (val: string) => {
        const routeMap: Record<string, string> = {
            [SswUpdateOption.BANK_UPDATE]: '/ssw-edit/bank-update',
            [SswUpdateOption.SSW_UPDATE]: '/ssw-edit/ssw-update',
            [SswUpdateOption.RMD_UPDATE]: '/ssw-edit/ssw-update',
            [SswUpdateOption.EFT_DRAW_UPDATE]: '/ssw-edit/ssw-update',
            [SswUpdateOption.WITHHOLDING_UPDATE]:
                '/ssw-edit/withholding-update',
        };

        const route = routeMap[val];
        if (route) {
            setSswRequest(val as SswUpdateOption);
            setLoading(true);

            if (route === '/ssw-edit/ssw-update') {
                switch (val as SswUpdateOption) {
                    case SswUpdateOption.SSW_UPDATE: {
                        setLoading(true);
                        router.push(
                            `${route}?taskId=${initialForm?.taskId}&programType=SSW`
                        );
                        break;
                    }
                    case SswUpdateOption.RMD_UPDATE: {
                        setLoading(true);
                        router.push(
                            `${route}?taskId=${initialForm?.taskId}&programType=RMD`
                        );
                        break;
                    }
                    case SswUpdateOption.EFT_DRAW_UPDATE: {
                        setLoading(true);
                        router.push(
                            `${route}?taskId=${initialForm?.taskId}&programType=EFT`
                        );
                        break;
                    }
                }
            } else {
                router.push(`${route}?taskId=${initialForm?.taskId}`);
            }
        }
    };

    if (loading)
        return (
            <div className="fixed left-0 top-0 z-10 flex h-screen w-screen justify-center bg-gray-800 opacity-80">
                <PageLoader variant={PageLoaderVariant.Center} />
            </div>
        );

    return (
        <div data-testid="ssw-edit-select-dropdown">
            <SelectSimple
                className="max-w-lg my-3"
                label={t('sswRequest') as string}
                options={
                    isLC
                        ? sswUpdateOptions(t, carrier)
                        : (fastOptions as SimpleOption[])
                }
                onChange={(val) => handleChange(val)}
                size={FieldSize.Small}
                value={sswRequest}
                name="sswRequest"
                disabled={isFormStateReadOnly}
            />
        </div>
    );
};

export default SswEditSelection;
