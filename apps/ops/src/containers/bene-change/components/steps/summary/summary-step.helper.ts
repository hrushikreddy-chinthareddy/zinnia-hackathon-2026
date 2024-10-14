import { TagVariant } from '@zinnia/bloom/components';
import { TFunction } from 'next-i18next';

import { ENTERPRISE_ADDRESS_TYPE } from '../../beneficiary-details/address-details/address-details.helper';

export const getTagVariant = (action: string, t: TFunction) => {
    let tagVariant = '';
    let tagText = '';
    if (action === 'NONE') {
        tagVariant = TagVariant.White;
        tagText = t('tag.none');
    } else if (action === 'UPDATE') {
        tagVariant = TagVariant.Information;
        tagText = t('tag.updated');
    } else if (action === 'DELETE') {
        tagVariant = TagVariant.White;
        tagText = t('tag.removed');
    } else if (action === 'ADD') {
        tagVariant = TagVariant.Information;
        tagText = t('tag.new');
    }

    return {tagVariant, tagText};
};

export const DEFAULT_BENE_ADDRESS = {
    addressType: ENTERPRISE_ADDRESS_TYPE.HOME,
    country: 'US'
};

export const isEqualObjects = (obj1: any, obj2: any) => {
    const diffInFields = Object.entries(obj2).filter(([field, obj2Value]) => obj1[field] !== obj2Value);
    return diffInFields.length > 0 ? false : true;
};