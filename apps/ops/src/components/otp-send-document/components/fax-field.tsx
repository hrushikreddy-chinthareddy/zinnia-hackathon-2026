import { useTranslation } from 'next-i18next';
import xss from 'xss';

import Field, {
    FieldSize,
    FieldType,
    FieldVariant,
} from '@deps/components/fields/field';

type FaxNumberProps = {
    fax: string;
    setFax: (val: string) => void;
    isDisabled?: boolean;
};
const FaxNumber = ({ fax, setFax, isDisabled }: FaxNumberProps) => {
    const { t } = useTranslation(undefined, {
        keyPrefix: 'sendDocument.correspondence',
    });
    return (
        <Field
            label={t('fax') as string}
            onChange={(e) => {
                setFax(xss(e?.target?.value));
            }}
            variant={isDisabled ? FieldVariant.Inactive : FieldVariant.Default}
            disabled={isDisabled}
            value={fax as string}
            size={FieldSize.Small}
            type={FieldType.BaseActive}
            className="max-w-xs"
            formatOptions={{ format: '(###) ###-####' }}
        />
    );
};

export default FaxNumber;
