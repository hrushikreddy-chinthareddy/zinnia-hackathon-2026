import { useTranslation } from 'next-i18next';

import Label, { LabelVariant } from '@deps/components/label/label';
import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import { TranslationFiles } from '@deps/config/translations';

import { DeceasedRecord } from './deceased-record';
import { DeceasedParty } from '../../death-claim.types';

interface DeceasedDetailsProps {
    deceasedData: DeceasedParty[];
    handleDeceased: (owner: DeceasedParty, index: number) => void;
    selectedNotifierPartyId?: string;
}

export const DeceasedDetails = ({
    deceasedData,
    handleDeceased,
    selectedNotifierPartyId = undefined,
}: DeceasedDetailsProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: 'deathClaims.deceasedDetails',
    });

    return (
        <div className="flex flex-col gap-4">
            <Typography variant={TypographyVariant.LabelLg}>
                {t('title')}
            </Typography>
            <div className="grid auto-rows-fr grid-cols-1 gap-2 lg:grid-cols-3">
                <div className="flex-1">
                    <Label
                        label={t('labels.deceased') as string}
                        variant={LabelVariant.LabelSm}
                    />
                    {deceasedData?.map((owner, index) => {
                        let isDisabled = false;
                        if (
                            selectedNotifierPartyId &&
                            owner.party.partyId === selectedNotifierPartyId
                        ) {
                            isDisabled = true;
                        }
                        return (
                            <DeceasedRecord
                                index={index}
                                key={owner.party.partyId}
                                owner={owner}
                                handleDeceased={handleDeceased}
                                isDisabled={isDisabled}
                            />
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
