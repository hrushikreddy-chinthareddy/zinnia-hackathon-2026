import { useTranslation } from 'next-i18next';

import CardInfo from '@deps/components/card/card-info/card-info';
import { ReactComponent as HexExclamationIcon } from '@deps/styles/elements/icons/icons_outlined/hex-exclamation.svg';

export const EmptyAssociatedAddress = () => {
    const { t } = useTranslation(undefined, { keyPrefix: 'addressChange.rolesAndContracts.tableData.error' });

    return (
        <div className="flex h-[300px] w-full items-center justify-center rounded border-2 border-solid border-semantic-warning bg-white shadow-sm">
            <CardInfo
                icon={<HexExclamationIcon className="text-semantic-error" height={50} width={50} />}
                title={t('title')}
                subtitle={t('paragraph')}
            />
        </div>
    );
};
