import { useTranslation } from 'next-i18next';
import { useState, Key } from 'react';

import { FieldSize } from '@deps/components/fields/field';
import Select from '@deps/components/select/select';
import { TranslationFiles } from '@deps/config/translations';

interface NigoDetailsProps {
    index: Key;
    subExceptions: any;
    nmId: string;
    onSubExceptionChange: (nmId: string, selections: any) => void;
    messages: { [key: string]: string } | null;
}

export const NigoMessages = ({
    subExceptions,
    index,
    nmId,
    onSubExceptionChange,
    messages,
}: NigoDetailsProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: 'nigoEntry.nigoDetails',
    });
    const [selections, setSelections] = useState<{ [key: string]: string }>(
        messages || {}
    );

    const updateSelection = (value: string, displayText: string) => {
        const newSelections = { ...selections };
        if (newSelections[value]) {
            delete newSelections[value];
        } else {
            newSelections[value] = displayText;
        }
        setSelections(newSelections);
        onSubExceptionChange(nmId, newSelections);
    };

    return (
        <div key={`{subException-${index}}`} className="mt-2 mx-8">
            <Select
                isMultiselect
                label={t('selectDetails') as string}
                options={subExceptions}
                value={selections}
                onChange={updateSelection}
                size={FieldSize.Small}
                placeholder={t('select') as string}
                name={`{subException-${index}}`}
            />
        </div>
    );
};
