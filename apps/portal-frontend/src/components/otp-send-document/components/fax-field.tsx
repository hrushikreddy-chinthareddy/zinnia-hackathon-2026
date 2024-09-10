import { useTranslation } from 'next-i18next';
import React from 'react';
import xss from 'xss';

import Field, { FieldSize, FieldType } from '@deps/components/fields/field';

type FaxNumberProps = {
    fax: string;
    setFax: (val: string) => void;
};
const FaxNumber = ({ fax, setFax }: FaxNumberProps) => {
    const { t } = useTranslation(undefined, { keyPrefix: 'sendDocument.correspondence' });
    return (
        <Field
            label={t('fax') as string}
            onChange={e => {
                setFax(xss(e?.target?.value));
            }}
            value={fax as string}
            size={FieldSize.Small}
            type={FieldType.BaseActive}
            className="max-w-xs"
        />
    );
};

export default FaxNumber;
