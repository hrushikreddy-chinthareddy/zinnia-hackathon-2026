import clsx from 'clsx';
import { useTranslation } from 'next-i18next';

import { FieldSize } from '@deps/components/fields/field';
import SelectSearch from '@deps/components/select-search/select-search';
import { TranslationFiles } from '@deps/config/translations';
import { usePermissionsContext } from '@deps/contexts/PermissionsContext';

interface FindKeyValueSearchProps {
    keyValues?: any;
    planCode?: string;
    policyNumber?: string;
}

export const FindKeyValueSearch = ({
    keyValues,
    planCode,
    policyNumber,
}: FindKeyValueSearchProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, {
        useSuspense: false,
    });
    const { sessionId, partyId } = usePermissionsContext();

    const searchClasses = clsx(
        'mt-4 flex w-full items-center sm:pl-14',
        'lg:mt-0 lg:justify-end lg:pl-0'
    );

    return (
        <div className={searchClasses}>
            <SelectSearch
                classNames="flex flex-col gap-1 max-w-[328px] w-full relative"
                labelClassNames="mr-4"
                size={FieldSize.Small}
                label={t('label.findKeyValues') ?? ''}
                placeHolder={t('placeHolder.globalSelectSearch') ?? ''}
                values={keyValues}
                errorMessageLink={`/policies/${planCode}/${policyNumber}/policy/policy-details`}
                group={true}
                sessionId={sessionId}
                userPartyId={partyId}
            />
        </div>
    );
};
