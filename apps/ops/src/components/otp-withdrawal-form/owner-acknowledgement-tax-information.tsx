import dayjs from 'dayjs';
import { useTranslation } from 'next-i18next';
import { useEffect, useState } from 'react';
import xss from 'xss';

import CardContainer from '@deps/containers/card-container/card-container';
import { SignPresent } from '@deps/models/case/renewal/signature-validation';
import { convertIsSignedFromValue } from '@deps/models/case/utils';
import { OwnerAcknowledgement, PartyRoles } from '@deps/models/case/withdrawal/case';
import { NUMERIC_DATE_FORMAT, ZAHARA_API_DATE_FORMAT } from '@deps/types/constants';

import Field, { FieldSize, FieldType, FieldVariant } from '../fields/field';
import FieldDateSelect from '../fields/field-date-select/field-date-select';
import SelectSimple from '../select/select';
import Typography, { TypographyVariant } from '../typography/typography';

interface OwnerAcknowledgementOfTaxInformationProps {
    ownerAcknowledgement?: OwnerAcknowledgement;
    onChange: (ownerAcknowledgement?: OwnerAcknowledgement) => void;
    isFormStateReadOnly: boolean;
}

export default function OwnerAcknowledgementOfTaxInformation(props: OwnerAcknowledgementOfTaxInformationProps) {
    const { ownerAcknowledgement, onChange, isFormStateReadOnly } = props;
    const { t } = useTranslation(undefined, { keyPrefix: 'caseWithdrawal.request.ownerAcknowledgementOfTaxInformation' });

    const [type, setType] = useState<string>(ownerAcknowledgement?.type.text || PartyRoles.OWNER);
    const [signPresent, setSignPresent] = useState<SignPresent>(convertIsSignedFromValue(ownerAcknowledgement?.isSigned?.text));
    const [date, setDate] = useState<string>(
        ownerAcknowledgement?.signDate?.text
            ? dayjs(ownerAcknowledgement?.signDate?.text, ZAHARA_API_DATE_FORMAT).format(NUMERIC_DATE_FORMAT)
            : ''
    );

    const signPresentOptions = [
        { label: t('selectOption'), value: SignPresent.Unselected },
        { label: t('yes'), value: SignPresent.Yes },
        { label: t('no'), value: SignPresent.No },
    ];

    useEffect(() => {
        onChange({
            type: {
                text: PartyRoles.OWNER,
            },
            isSigned: { text: signPresent === SignPresent.Yes },
            signDate: {
                text: date && dayjs(date, NUMERIC_DATE_FORMAT).format(ZAHARA_API_DATE_FORMAT),
            },
        });
    }, [type, signPresent, date, onChange]);

    return (
        <CardContainer containerClassNames="border-b-2 border-gray-100">
            <Typography variant={TypographyVariant.H3} className="mb-4">
                {t('title')}
            </Typography>
            <div className="flex flex-wrap gap-8 max-md:flex-col">
                <div className="flex flex-wrap gap-6 max-md:flex-col">
                    <div className="flex-1">
                        <Field
                            label={t('type') as string}
                            onChange={e => setType(xss(e.target.value))}
                            size={FieldSize.Small}
                            type={FieldType.BaseActive}
                            value={type}
                            variant={FieldVariant.Inactive}
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
                            onChange={e => {
                                setDate(e.target.value);
                            }}
                            size={FieldSize.Small}
                            type={FieldType.BaseActive}
                            value={date}
                            disabled={isFormStateReadOnly}
                            variant={isFormStateReadOnly ? FieldVariant.Inactive : FieldVariant.Default}
                        />
                    </div>
                </div>
            </div>
        </CardContainer>
    );
}
