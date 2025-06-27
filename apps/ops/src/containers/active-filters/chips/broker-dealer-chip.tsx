import { TFunction } from 'next-i18next';

import ChipX from '@deps/components/chip/chip-x';

const BrokerDealerChip = ({
    brokerDealerName,
    handleRemoveFilter,
    t,
}: {
    brokerDealerName: string;
    handleRemoveFilter: (arg: { brokerDealerName: '' }) => void;
    t: TFunction;
}) => {
    return (
        <ChipX
            ariaLabel={
                t('ariaLabel.clearFilter', {
                    filter: brokerDealerName,
                }) as string
            }
            label={brokerDealerName}
            onDelete={() => {
                handleRemoveFilter({ brokerDealerName: '' });
            }}
        />
    );
};

export default BrokerDealerChip;
