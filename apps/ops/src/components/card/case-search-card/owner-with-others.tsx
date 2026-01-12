import { useTranslation } from 'next-i18next';

import Highlighter from '@deps/components/highlighter/highlighter';
import Label, { LabelVariant } from '@deps/components/label/label';
import { PiiProps } from '@deps/components/pii/pii';
import { PiiWrapper } from '@deps/components/pii/PiiWrapper';
import PlusOthers from '@deps/components/plus-others/plus-others';
import PopoverOnTruncate from '@deps/components/popover-on-truncate/popover-on-truncate';
import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import { TranslationFiles } from '@deps/config/translations';
import { DEFAULT_ERROR_STRING } from '@deps/utils/strings';

interface OwnerWithOthersProps extends PiiProps {
    label: string;
    text?: string | null;
    highlights?: string[] | null;
    entities: { name: string; ssn: string }[];
}

const OwnerWithOthers = ({
    label,
    text,
    entities,
    highlights,
}: OwnerWithOthersProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON);
    const textWithHighlights =
        !!text && highlights && highlights.length ? (
            <Highlighter text={text} highlights={highlights} />
        ) : (
            text
        );

    const textToRender = text ? (
        <PopoverOnTruncate title={text}>
            <span className="line-clamp-1 break-all font-secondary text-md">
                {textWithHighlights}
            </span>
        </PopoverOnTruncate>
    ) : (
        textWithHighlights
    );

    return (
        <div>
            <div className="flex">
                <Label label={label} variant={LabelVariant.FieldLabel} />
                <PlusOthers
                    entities={entities}
                    tooltipTitle={t('tooltip.jointOwner')}
                />
            </div>
            <Typography variant={TypographyVariant.BodySm}>
                <PiiWrapper>{textToRender || DEFAULT_ERROR_STRING}</PiiWrapper>
            </Typography>
        </div>
    );
};

export default OwnerWithOthers;
