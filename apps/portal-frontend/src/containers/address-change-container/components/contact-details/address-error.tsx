import { useTranslation } from 'next-i18next';

import CardInfo from '@deps/components/card/card-info/card-info';
import { ReactComponent as HexExclamationIcon } from '@deps/styles/elements/icons/icons_outlined/hex-exclamation.svg';

export const AddressError = () => {
    const { t } = useTranslation(undefined, { keyPrefix: 'addressChange.contactDetails.addressError' });

    return (
        <div className="flex h-[118px] items-center justify-center rounded border-2 border-solid border-semantic-warning bg-white shadow-sm">
            <CardInfo
                icon={<HexExclamationIcon className="text-semantic-error" height={35} width={35} />}
                title={t('title')}
                subtitle={t('paragraph')}
            />
        </div>
    );
};
