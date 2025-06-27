import dayjs from 'dayjs';
import { useTranslation } from 'next-i18next';
import { useContext, useEffect, useState } from 'react';

import CardContainer from '@deps/containers/card-container/card-container';
import { FormDataContext } from '@deps/contexts/OtpWithdrawalFormContext';
import { SignatureWithdrawal } from '@deps/models/case/withdrawal/case';
import { ZAHARA_API_DATE_FORMAT } from '@deps/types/constants';

import ButtonGroup from '../button-group/button-group';
import { FieldSize, FieldType, FieldVariant } from '../fields/field';
import FieldDateSelect, {
    DATE_PICKER_FORMAT,
} from '../fields/field-date-select/field-date-select';
import Typography, { TypographyVariant } from '../typography/typography';

enum Authorized {
    Unselected = 'unselected',
    Yes = 'yes',
    No = 'no',
}

const convertAuthorizedFromValue = (
    isAuthorization: boolean | null | undefined
): Authorized => {
    if (isAuthorization === null || isAuthorization === undefined) {
        return Authorized.Unselected;
    }

    return isAuthorization ? Authorized.Yes : Authorized.No;
};

const convertDateFromValue = (
    signature: SignatureWithdrawal | undefined
): string | null => {
    if (!signature?.signDate) {
        return null;
    }

    return (
        signature?.signDate?.text &&
        dayjs(signature.signDate.text, ZAHARA_API_DATE_FORMAT).format(
            DATE_PICKER_FORMAT
        )
    );
};

interface EmployerTpaAuthorizationProps {
    isFormStateReadOnly: boolean;
}

export default function EmployerTpaAuthorization({
    isFormStateReadOnly,
}: EmployerTpaAuthorizationProps) {
    const { formTpaAuthorization, setFormTpaAuthorization } =
        useContext(FormDataContext);
    const { t } = useTranslation(undefined, {
        keyPrefix: 'caseWithdrawal.request.employerTpaAuthorization',
    });
    const [authorized, setAuthorized] = useState<Authorized>(
        convertAuthorizedFromValue(
            formTpaAuthorization?.isAuthorization?.text || null
        )
    );
    const [date, setDate] = useState<string>(
        convertDateFromValue(formTpaAuthorization?.signature) || ''
    );

    useEffect(() => {
        setFormTpaAuthorization({
            isAuthorization: {
                text:
                    authorized === Authorized.Unselected
                        ? null
                        : authorized === Authorized.Yes,
            },
            isAgreementAttached: {
                text: null,
            },
            signOf: {
                text: null,
            },
            signature: {
                isSigned: false,
                signDate: {
                    text: date
                        ? dayjs(date, DATE_PICKER_FORMAT).format(
                              ZAHARA_API_DATE_FORMAT
                          )
                        : null,
                },
                signExtension: null,
                signName: null,
                signOtherTitle: null,
                signTitle: {
                    text: null,
                },
                signTitles: [
                    {
                        text: null,
                    },
                ],
                signType: {
                    text: null,
                },
                spousalConsent: {
                    text: null,
                },
            },
        });
    }, [authorized, date]);

    return (
        <CardContainer containerClassNames="border-b-2 border-gray-100">
            <Typography variant={TypographyVariant.H3} className="mb-4">
                {t('header')}
            </Typography>
            <div className="flex flex-wrap gap-8 max-md:flex-col">
                <ButtonGroup
                    activeValue={authorized}
                    toggle={(value) => {
                        if (!value) {
                            value = authorized;
                        }
                        setAuthorized(value as Authorized);
                    }}
                    labels={[
                        {
                            label: t('yes'),
                            value: Authorized.Yes,
                        },
                        {
                            label: t('no'),
                            value: Authorized.No,
                        },
                    ]}
                    size={'xxs'}
                    variant={'primary'}
                    groupLabel={t('authorized')}
                    disabled={isFormStateReadOnly}
                />
                <div className="mt-1">
                    <FieldDateSelect
                        isFutureDateDisabled={false}
                        label={t('date') as string}
                        onChange={(e) => {
                            setDate(e.target.value);
                        }}
                        size={FieldSize.Small}
                        type={FieldType.BaseActive}
                        value={date}
                        disabled={isFormStateReadOnly}
                        variant={
                            isFormStateReadOnly
                                ? FieldVariant.Inactive
                                : FieldVariant.Default
                        }
                    />
                </div>
            </div>
        </CardContainer>
    );
}
