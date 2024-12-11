import Image from 'next/image';

import { GlobalValues } from '@deps/components/global-values/global-values.types';
import Tooltip, { PopoverPlacement } from '@deps/components/tooltip/tooltip';
import { getCarrierLogoByClientId, getCarrierNameByClientId } from '@deps/utils/carriers';

export const CarrierLogo = ({ carrierId, tooltipPlacements = PopoverPlacement.TopRight }: Partial<GlobalValues>) => {
    const carrierName = getCarrierNameByClientId(carrierId as string);
    return (
        <div className="mr-2">
            {carrierId &&
                (carrierName ? (
                    <Tooltip placement={tooltipPlacements} body={carrierName} triggerClassName="!rounded cursor-default">
                        <div className="self-center pb-[1.5px] pt-[1.5px]">
                            <div className="default-focus flex h-12 w-12 items-center justify-center rounded border-2 border-gray-100 bg-white">
                                <Image alt={carrierName} width={48} height={48} src={getCarrierLogoByClientId(carrierId)} />
                            </div>
                        </div>
                    </Tooltip>
                ) : (
                    <div className="self-center pb-[1.5px] pt-[1.5px]">
                        <div className="default-focus flex h-12 w-12 items-center justify-center rounded border-2 border-gray-100 bg-white">
                            <Image
                                alt={getCarrierNameByClientId(carrierId) || carrierId}
                                width={48}
                                height={48}
                                src={getCarrierLogoByClientId(carrierId)}
                            />
                        </div>
                    </div>
                ))}
        </div>
    );
};

export interface TaskInfoProps {
    carrierId: string;
    caseId: string;
}

const TaslInfo = ({ carrierId, caseId }: TaskInfoProps) => {
    return (
        <div className="flex items-center">
            <CarrierLogo carrierId={carrierId} />
            <div className="flex w-max flex-col">
                <div className="flex items-center">
                    <div className="mr-4 mt-[-1px] font-primary text-[22px] leading-6 text-gray-900">{caseId}</div>
                </div>
            </div>
        </div>
    );
};

export default TaslInfo;
