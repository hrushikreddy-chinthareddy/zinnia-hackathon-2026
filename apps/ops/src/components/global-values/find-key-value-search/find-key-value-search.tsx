import clsx from 'clsx';
import { useTranslation } from 'next-i18next';

import { FieldSize } from '@deps/components/fields/field';
import SelectSearch from '@deps/components/select-search/select-search';
import { TranslationFiles } from '@deps/config/translations';
import { usePermissionsContext } from '@deps/contexts/PermissionsContext';
import { SegmentTrackedEventName } from '@deps/types/segment-analytics';

interface FindKeyValueSearchProps {
    isNavDrawerOpen?: boolean;
    keyValues?: any;
    planCode?: string;
    policyNumber?: string;
}

export const FindKeyValueSearch = ({ isNavDrawerOpen, keyValues, planCode, policyNumber }: FindKeyValueSearchProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, { useSuspense: false });
    const perms = usePermissionsContext();

    const searchClasses = clsx(
        'mt-4 flex w-full items-center sm:pl-14',
        isNavDrawerOpen ? 'lg:mt-4 lg:pl-14 xl:mt-0 xl:justify-end xl:pl-0' : 'lg:mt-0 lg:justify-end lg:pl-0'
    );

    return (
        <div className={searchClasses}>
            <SelectSearch
                classNames="flex flex-col gap-1 max-w-[328px] w-full"
                labelClassNames="mr-4"
                size={FieldSize.Small}
                label={t('label.findKeyValues') ?? ''}
                placeHolder={t('placeHolder.globalSelectSearch') ?? ''}
                values={keyValues}
                errorMessageLink={`/policies/${planCode}/${policyNumber}/policy/policy-details`}
                group={true}
                segmentTrackName={SegmentTrackedEventName.SearchSubmitted}
                userPartyId={perms.getUserPartyId()}
            />
        </div>
    );
};
