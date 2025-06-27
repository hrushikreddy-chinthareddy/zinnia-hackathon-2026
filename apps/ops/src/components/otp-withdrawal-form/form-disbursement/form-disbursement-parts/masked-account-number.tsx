import { useTranslation } from 'next-i18next';
import * as React from 'react';
import { SetStateAction } from 'react';
import xss from 'xss';

import Content, { ContentVariant } from '@deps/components/content/content';
import Field, {
    FieldSize,
    FieldType,
    FieldVariant,
} from '@deps/components/fields/field';
import { DisbursementParts } from '@deps/models/case/withdrawal/disbursement-types';

export type IMaskedAccountNumberProps = {
    setDisbursementInformation: React.Dispatch<
        SetStateAction<DisbursementParts>
    >;
    maskedAccountNumber?: string | null;
    disabled?: boolean;
};

export const MaskedAccountNumber = ({
    maskedAccountNumber,
    disabled,
    setDisbursementInformation,
}: IMaskedAccountNumberProps) => {
    const { t } = useTranslation(undefined, {
        keyPrefix: 'caseWithdrawal.request.distributionMethod',
    });
    const onChangeHandler = (value: string) => {
        setDisbursementInformation((fs) => ({
            ...fs,
            maskedAccountNumber: value,
        }));
    };

    return (
        <div className="mt-8 flex max-w-lg flex-col gap-4 md:flex-row">
            <Content
                details={t('bankAccountEndingIn') as string}
                variant={ContentVariant.BodySm}
                contentClassName="items-center flex"
            />
            <Field
                className="max-w-lg"
                data-testid="maskedAccountNumber"
                onChange={(e) => onChangeHandler(xss(e?.target?.value))}
                size={FieldSize.Small}
                type={FieldType.BaseActive}
                value={maskedAccountNumber ?? ''}
                variant={
                    disabled ? FieldVariant.Inactive : FieldVariant.Default
                }
                maxLength={4}
                disabled={disabled}
            />
            <Content
                details={t('toProcessThisRequest') as string}
                variant={ContentVariant.BodySm}
                contentClassName="items-center flex"
            />
        </div>
    );
};
