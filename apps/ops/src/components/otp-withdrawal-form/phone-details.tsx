import { useTranslation } from 'next-i18next';
import { useState, useEffect } from 'react';

import Field, { FieldSize, FieldType } from '@deps/components/fields/field';
import Typography, { TypographyVariant } from '@deps/components/typography/typography';
import CardContainer from '@deps/containers/card-container/card-container';
import { Party } from '@deps/models/case/withdrawal/case';

interface PhoneDetailsProps {
    formData: Party['phones'];
    onDataChange: (value: Party['phones']) => void;
}

const DEFAULT_DAY_PHONE = {
    phoneCountry: null,
    phoneNumber: null,
    phoneTypeDesc: null,
    phoneType: {
        text: 'Owner_Phone_Day',
    },
};

const DEFAULT_HOME_PHONE = {
    phoneCountry: null,
    phoneNumber: null,
    phoneTypeDesc: null,
    phoneType: {
        text: 'Owner_Phone_Home',
    },
};
const PhoneDetailsComponent = ({ formData, onDataChange }: PhoneDetailsProps) => {
    const { t } = useTranslation();
    const BASE_TRANSLATION_KEY = 'caseWithdrawal.request.phoneDetails.';
    const numberFormat = { format: '################' };
    const [ownerPhoneDay, setOwnerPhoneDay] = useState(formData?.[0]?.phoneNumber || '');
    const [ownerPhoneHome, setownerPhoneHome] = useState(formData?.[1]?.phoneNumber || '');

    useEffect(() => {
        onDataChange([
            {
                ...(formData?.[0] || DEFAULT_DAY_PHONE),
                phoneNumber: ownerPhoneDay,
            },
            {
                ...(formData?.[1] || DEFAULT_HOME_PHONE),
                phoneNumber: ownerPhoneHome,
            },
        ]);
    }, [ownerPhoneDay, ownerPhoneHome]);

    return (
        <CardContainer classNames="w-full" containerClassNames="border-b-2 border-gray-100">
            <Typography variant={TypographyVariant.H3} className="mb-4">
                {t(`${BASE_TRANSLATION_KEY}title`)}
            </Typography>
            <div className="mt-4 grid grid-rows-2 gap-8 sm:grid-cols-2 sm:grid-rows-1 md:grid-cols-3 ">
                <Field
                    label={t(`${BASE_TRANSLATION_KEY}daytimePhone`) as string}
                    onChange={e => setOwnerPhoneDay(e.target.value as string)}
                    size={FieldSize.Small}
                    type={FieldType.BaseActive}
                    value={ownerPhoneDay}
                    formatOptions={numberFormat}
                />
                <Field
                    label={t(`${BASE_TRANSLATION_KEY}homePhone`) as string}
                    onChange={e => setownerPhoneHome(e.target.value as string)}
                    size={FieldSize.Small}
                    type={FieldType.BaseActive}
                    value={ownerPhoneHome}
                    formatOptions={numberFormat}
                />
            </div>
        </CardContainer>
    );
};

export default PhoneDetailsComponent;
