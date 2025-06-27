import dayjs from 'dayjs';
import { useTranslation } from 'next-i18next';
import { useContext, useEffect, useState } from 'react';
import xss from 'xss';

import CardContainer from '@deps/containers/card-container/card-container';
import { FormDataContext } from '@deps/contexts/OtpWithdrawalFormContext';
import {
    SignPresent,
    SignatureValidationTypeWithdrawal,
} from '@deps/models/case/renewal/signature-validation';
import { convertIsSignedFromValue } from '@deps/models/case/utils';
import { SignatureWithdrawal } from '@deps/models/case/withdrawal/case';
import {
    NUMERIC_DATE_FORMAT,
    ZAHARA_API_DATE_FORMAT,
} from '@deps/types/constants';

import ButtonGroup from '../button-group/button-group';
import Field, { FieldSize, FieldType, FieldVariant } from '../fields/field';
import FieldDateSelect from '../fields/field-date-select/field-date-select';
import FieldLabel from '../fields/field-label';
import SelectSimple from '../select/select';
import Typography, { TypographyVariant } from '../typography/typography';

enum Consulted {
    Yes = 'yes',
    No = 'no',
    Unselected = '',
}

const convertConsultedFromValue = (
    value: boolean | null | undefined
): Consulted => {
    if (value === true) {
        return Consulted.Yes;
    }
    if (value === false) {
        return Consulted.No;
    }

    return Consulted.Unselected;
};

interface FinancialProfessionalSignatureProps {
    isFormStateReadOnly: boolean;
}

export default function FinancialProfessionalSignature({
    isFormStateReadOnly,
}: FinancialProfessionalSignatureProps) {
    const { formFullSurrenderAck, setFormFullSurrenderAck } =
        useContext(FormDataContext);
    const { t } = useTranslation(undefined, {
        keyPrefix: 'caseWithdrawal.request.financialProfessionalSignature',
    });
    const initialSignature = formFullSurrenderAck.signature?.[0] || null;
    const [consulted, setConsulted] = useState<Consulted>(
        convertConsultedFromValue(
            formFullSurrenderAck?.isFinancialProfessionAck?.text
        )
    );
    const [name, setName] = useState<string>(initialSignature?.signName || '');
    const [signPresent, setSignPresent] = useState<SignPresent>(
        convertIsSignedFromValue(initialSignature?.isSigned)
    );
    const [date, setDate] = useState<string>(
        initialSignature?.signDate?.text
            ? dayjs(
                  initialSignature?.signDate?.text,
                  ZAHARA_API_DATE_FORMAT
              ).format(NUMERIC_DATE_FORMAT)
            : ''
    );
    const signPresentOptions = [
        { label: t('selectOption'), value: SignPresent.Unselected },
        { label: t('yes'), value: SignPresent.Yes },
        { label: t('no'), value: SignPresent.No },
    ];

    useEffect(() => {
        const isConsulted: boolean = consulted === Consulted.Yes;
        const signature: SignatureWithdrawal[] = [];

        if (!isConsulted) {
            return;
        }
        signature.push({
            isSigned: signPresent === SignPresent.Yes,
            signDate: {
                text:
                    date &&
                    dayjs(date, NUMERIC_DATE_FORMAT).format(
                        ZAHARA_API_DATE_FORMAT
                    ), //changed date format
            },
            signExtension: null,
            signName: name?.length ? name : null,
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
                text: SignatureValidationTypeWithdrawal.FinancialProfessional,
            },
            spousalConsent: {
                text: null,
            },
        });

        setFormFullSurrenderAck({
            isFinancialProfessionAck: {
                text: isConsulted,
            },
            signature,
        });
    }, [consulted, name, signPresent, date]);

    return (
        <CardContainer containerClassNames="border-b-2 border-gray-100">
            <Typography variant={TypographyVariant.H3} className="mb-4">
                {t('title')}
            </Typography>
            <div className="flex flex-wrap gap-8 max-md:flex-col">
                <div className="flex-1">
                    <div className="flex-1">
                        <FieldLabel label={t('consulted') as string} />
                    </div>
                    <div className="flex-1">
                        <ButtonGroup
                            activeValue={consulted}
                            toggle={(value) => {
                                if (!value) {
                                    value = consulted;
                                }
                                setConsulted(value as Consulted);
                            }}
                            labels={[
                                {
                                    label: t('yes'),
                                    value: Consulted.Yes,
                                },
                                {
                                    label: t('no'),
                                    value: Consulted.No,
                                },
                            ]}
                            size={'xxs'}
                            variant={'primary'}
                            groupLabel={t('consulted')}
                            hideLabel={true}
                            disabled={isFormStateReadOnly}
                        />
                    </div>
                </div>

                <div className="flex flex-wrap gap-6 max-md:flex-col">
                    <div className="flex-1">
                        <Field
                            label={t('name') as string}
                            onChange={(e) => setName(xss(e.target.value))}
                            size={FieldSize.Small}
                            type={FieldType.BaseActive}
                            value={name}
                            variant={
                                isFormStateReadOnly
                                    ? FieldVariant.Inactive
                                    : FieldVariant.Default
                            }
                        />
                    </div>
                    <div className="flex-1">
                        <SelectSimple
                            label={t('signPresent') as string}
                            onChange={(val: string) => {
                                setSignPresent(val as SignPresent);
                            }}
                            options={signPresentOptions}
                            size={FieldSize.Small}
                            type={FieldType.BaseActive}
                            value={signPresent as string}
                            disabled={isFormStateReadOnly}
                        />
                    </div>
                    <div className="flex-1">
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
            </div>
        </CardContainer>
    );
}
