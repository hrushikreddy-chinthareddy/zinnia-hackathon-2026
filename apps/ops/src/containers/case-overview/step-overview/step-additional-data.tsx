import { TFunction, useTranslation } from 'next-i18next';
import React, { ReactNode } from 'react';

import { AdditionalData, formatTimestamp } from '@deps/components/case-sub-page/case-tabs.tsx/case-tabs-helpers';
import Content, { ContentVariant } from '@deps/components/content/content';
import CardContainer from '@deps/containers/card-container/card-container';
import { formatAddressToContainer } from '@deps/containers/small-data-card/address-data/address-data';
import {
    AdditionalDataIds,
    CommunicationTypes,
    CorrespondenceStatus,
    correspondenceTypes,
} from '@deps/models/case/additional-data-instance';
import { ReactComponent as NotStartedIcon } from '@deps/styles/elements/icons/alert/not-started.svg';
import { ReactComponent as CompletedIcon } from '@deps/styles/elements/icons/icons_outlined/check-circle.svg';
import { ReactComponent as ExceptionIcon } from '@deps/styles/elements/icons/icons_outlined/hex-exclamation.svg';
const getDataByDeliveryMethod = (data: AdditionalData, deliveryMethod: CommunicationTypes, t: TFunction) => {
    switch (deliveryMethod) {
        case CommunicationTypes.Fax:
            return t('caseOverview.communicationSentTemplate.fax', { fax: data[deliveryMethod] });
        case CommunicationTypes.Email:
            return t('caseOverview.communicationSentTemplate.email', { email: data[deliveryMethod] });
        case CommunicationTypes.Mail:
            return t('caseOverview.communicationSentTemplate.mail', { address: formatAddressToContainer(data, true) });
        default:
            return '';
    }
};

const getCorrespondenceStatusIconTooltip = (status: CorrespondenceStatus): ReactNode => {
    let icon = null;

    switch (status) {
        case CorrespondenceStatus.INITIATED:
            icon = <NotStartedIcon className="text-gray-300" width={24} height={24} />;
            break;
        case CorrespondenceStatus.DELIVERED:
            icon = <CompletedIcon className="text-semantic-success" width={24} height={24} />;
            break;

        case CorrespondenceStatus.BOUNCE:
        case CorrespondenceStatus.DROPPED:
        case CorrespondenceStatus.FAILURE:
            icon = <ExceptionIcon className="text-semantic-error" width={24} height={24} />;
            break;

        default:
            return null;
    }
    return (
        <div className="mr-4 flex w-max flex-row items-center gap-2 justify-self-start">
            {icon}
            <Content contentClassName="min-w-max" variant={ContentVariant.BodySm} details={status} />
        </div>
    );
};

type StepAdditionalDataProps = {
    additionalData: AdditionalData;
    stepKey: AdditionalDataIds;
};
const StepAdditionalData = ({ additionalData, stepKey }: StepAdditionalDataProps) => {
    const { t } = useTranslation();
    const deliveryMethod = additionalData['deliveryMethod']?.value as CommunicationTypes;

    const correspondenceStepConfig = (deliveryMethod: CommunicationTypes) => [
        {
            label: t('caseOverview.correspondenceStepDetails.status'),
            key: 'deliveryStatus',
            getAdditionalDetails: (additionalData: AdditionalData, filterKeyBy: string) => {
                const status = additionalData[filterKeyBy].value as CorrespondenceStatus;
                return getCorrespondenceStatusIconTooltip(status);
            },
        },
        {
            label: t('caseOverview.correspondenceStepDetails.dateStarted'),
            key: 'deliveryDate',
            getAdditionalDetails: (additionalData: AdditionalData, filterKeyBy: string) => {
                const date = additionalData[filterKeyBy].value;
                return formatTimestamp(date, 'YYYY-MM-DD HH:mm:ss');
            },
        },
        {
            label: t('caseOverview.correspondenceStepDetails.deliveryMethod'),
            key: correspondenceTypes[deliveryMethod].key,
            getAdditionalDetails: (additionalData: AdditionalData, filterKeyBy: string) => {
                const data = Object.keys(additionalData)
                    .filter(key => key.includes(filterKeyBy))
                    .reduce((acc, key) => ({ ...acc, [key.replace(filterKeyBy, '') || deliveryMethod]: additionalData[key].value }), {});

                return getDataByDeliveryMethod(data, deliveryMethod, t);
            },
        },
    ];

    const renderAdditionalData = (id: AdditionalDataIds) => {
        switch (id) {
            case AdditionalDataIds.correspondenceRequest:
                return correspondenceStepConfig(deliveryMethod).map((step, index) => (
                    <div className="my-2 grid grid-cols-3 gap-8" key={index}>
                        <div>{step.label}</div>
                        <div className="col-span-2">
                            {step?.getAdditionalDetails && step?.getAdditionalDetails(additionalData, step.key)}
                        </div>
                    </div>
                ));
            case AdditionalDataIds.sedRequest:
                return '';
            default:
                return null;
        }
    };
    return <CardContainer>{renderAdditionalData(stepKey)}</CardContainer>;
};

export default StepAdditionalData;
