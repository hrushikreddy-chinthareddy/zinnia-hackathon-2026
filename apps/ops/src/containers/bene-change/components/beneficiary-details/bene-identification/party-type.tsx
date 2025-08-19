import { PartyType } from '@zinnia/api-types/types/sor';
import { useTranslation } from 'next-i18next';

import Radio, {
    RadioOrientation,
    RadioVariant,
} from '@deps/components/radio/radio';
import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import { TranslationFiles } from '@deps/config/translations';

export enum ContactTypes {
    Address = 'address',
    Phone = 'phone',
}

const PartyTypes = ({
    partyIdentification,
    onPartyChange,
    isReadOnly,
    orientation = RadioOrientation.Vertical,
    variant = TypographyVariant.H4,
}: any) => {
    const { t } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: 'beneChange.beneDetails.identification',
    });

    const partyTypes = [
        {
            label: t('partyType.individual'),
            value: PartyType.INDIVIDUAL,
        },
        {
            label: t('partyType.trust'),
            value: PartyType.TRUST,
        },
        {
            label: t('partyType.estate/Organisation'),
            value: PartyType.ORGANIZATION,
        },
    ];

    return (
        <div className="">
            <Typography variant={variant}>Party type</Typography>
            <div className="my-2 flex">
                <Radio
                    items={partyTypes}
                    onChange={(event) => {
                        onPartyChange(event.target.value as any);
                    }}
                    value={partyIdentification}
                    disabled={isReadOnly}
                    variant={
                        isReadOnly
                            ? RadioVariant.Inactive
                            : RadioVariant.Default
                    }
                    orientation={orientation}
                />
            </div>
        </div>
    );
};

export default PartyTypes;
