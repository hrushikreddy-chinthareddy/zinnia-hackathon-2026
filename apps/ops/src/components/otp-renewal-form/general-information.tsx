import { useTranslation } from 'next-i18next';
import { useContext } from 'react';

import SelectSimple from '@deps/components/select/select';
import { RenewalFormDataContext } from '@deps/contexts/OtpRenewalFormContext';
import { Channel } from '@deps/models/case/renewal/case-renewal';

import { FieldSize, FieldType } from '../fields/field';
import FieldLabel from '../fields/field-label';
import Typography, { TypographyVariant } from '../typography/typography';

interface GeneralInformationProps {
    isFormStateReadOnly: boolean,
}

export default function GeneralInformation({ isFormStateReadOnly }: GeneralInformationProps) {
    const { document, channel, setChannel } = useContext(RenewalFormDataContext);
    const { t } = useTranslation(undefined, { keyPrefix: 'caseRenewal.request' });

    return (
        <>
            <Typography variant={TypographyVariant.H3} className="mb-4">
                {t('generalInformation')}
            </Typography>
            <div className="mb-4 flex">
                <div className="mr-8">
                    <FieldLabel classNames="font-secondary text-md !mb-0" label={t('contractId') as string} />
                    <p className="mb-2 font-secondary text-md">{document?.contract}</p>
                </div>
                <SelectSimple
                    className="w-full max-w-[200px]"
                    options={[
                        { label: t('emailFaxMail'), value: Channel.Form },
                        { label: t('phone'), value: Channel.Phone },
                    ]}
                    label={t('channel') as string}
                    onChange={val => {
                        setChannel(val as Channel);
                    }}
                    size={FieldSize.Small}
                    type={FieldType.BaseActive}
                    value={channel || t('channel')}
                    disabled={isFormStateReadOnly}
                />
            </div>
        </>
    );
}
