import { IconType, Icon, Tooltip, TooltipPlacement } from '@zinnia/bloom/components';
import { useTranslation } from 'next-i18next';

import NavElement, { NavElementSize, NavElementType, NavElementVariant } from '@deps/components/nav-element/nav-element';
import { TranslationFiles } from '@deps/config/translations';
import { AddressTypeAndAddress } from '@deps/containers/small-data-card/address-data/address-data';

import { addressType } from './case-details-content';

interface AddressTabProps {
    addresses: addressType[];
    planCode: string | undefined;
    policyNumber: string | undefined;
}
function AddressTab({ addresses, planCode, policyNumber }: AddressTabProps) {
    const { t } = useTranslation(TranslationFiles.COMMON, { keyPrefix: 'sideSheet.caseDetailsContent.addressHistoryTab' });
    const url = policyNumber && planCode ? `/policies/${planCode}/${policyNumber}/policy/policy-details` : null;
    return (
        <div className="flex-1 flex flex-col w-full !mb-0 px-4 pt-5 md:px-6 lg:px-8 gap-4">
            {addresses?.map((address: any) => {
                return (
                    <div key={address.addressId} className="px-4 mt-3">
                        <div className="flex gap-2  items-center">
                            <AddressTypeAndAddress address={address} addressType={address.addressType} isAddressChange={true} />
                            {address.preferredAddress && (
                                <Tooltip
                                    trigger={<div className=" bg-green-600 inline-block h-2 w-2 rounded-full"></div>}
                                    placement={TooltipPlacement.TopRight}
                                    tooltipClassName={'px-4 py-4 !w-auto'}
                                >
                                    {t('preferredAddress')}
                                </Tooltip>
                            )}
                        </div>
                    </div>
                );
            })}

            { url && <div className="text-[--color-base-text-text-link] font-semibold text-md p-4">
                <NavElement
                    className={'whitespace-normal break-words'}
                    href={url}
                    isNewPage={true}
                    size={NavElementSize.Small}
                    target="_blank"
                    title={t('viewFullDeatils') as string}
                    type={NavElementType.Link}
                    startIcon={<Icon type={IconType.EXTERNAL_LINK} width={20} height={20} />}
                    variant={NavElementVariant.Secondary}
                >
                    {t('viewFullDeatils')}
                </NavElement>
            </div>
            }
        </div>
    );
}

export default AddressTab;
