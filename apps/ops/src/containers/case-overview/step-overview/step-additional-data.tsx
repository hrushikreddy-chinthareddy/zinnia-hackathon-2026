import { Table, TableBody, TableCell, TableRow } from '@zinnia/bloom/components';
import dayjs from 'dayjs';
import { TFunction, useTranslation } from 'next-i18next';
import React from 'react';

import AdditionalStepStatus from '@deps/components/case-overview-box/content/additional-step-status';
import { AdditionalData } from '@deps/components/case-sub-page/case-tabs.tsx/case-tabs-helpers';
import Typography, { TypographyVariant } from '@deps/components/typography/typography';
import CardContainer from '@deps/containers/card-container/card-container';
import { formatAddressToContainer } from '@deps/containers/small-data-card/address-data/address-data';
import { AdditionalDataIds, CommunicationTypes, correspondenceTypes } from '@deps/models/case/additional-data-instance';
import { Statuses } from '@deps/models/case/case';
const getDataByDeliveryMethod = (data: AdditionalData, deliveryMethod: CommunicationTypes, t: TFunction) => {
    switch (deliveryMethod) {
        case CommunicationTypes.Fax:
            return t('caseOverview.communicationSentTemplate.fax', { fax: data[deliveryMethod] });
        case CommunicationTypes.Email:
            return t('caseOverview.communicationSentTemplate.email', { email: data[deliveryMethod] });
        case CommunicationTypes.Mail:
            return formatAddressToContainer(data, true);
        default:
            return '';
    }
};

const correspondenceStepConfig = (deliveryMethod: CommunicationTypes, t: TFunction) => [
    {
        label: t('caseOverview.correspondenceStepDetails.deliveryMethod'),
        key: correspondenceTypes[deliveryMethod].key,
        shouldDisplay: (): boolean => {
            return true;
        },
        getAdditionalDetails: () => {
            return deliveryMethod;
        },
    },
    {
        label: t('caseOverview.correspondenceStepDetails.sentDate'),
        key: 'deliveryDate',
        shouldDisplay: (): boolean => {
            return true;
        },
        getAdditionalDetails: (additionalData: AdditionalData, filterKeyBy: string) => {
            const date = additionalData[filterKeyBy].value;
            return dayjs(date, 'YYYY-MM-DD HH:mm:ss').format('MM/DD/YYYY HH:mm a CST');
        },
    },

    {
        label: t('caseOverview.correspondenceStepDetails.address'),
        key: correspondenceTypes[deliveryMethod].key,
        shouldDisplay: (deliveryMethod?: CommunicationTypes): boolean => {
            if (!deliveryMethod) return false;
            return correspondenceTypes[deliveryMethod].value === CommunicationTypes.Mail;
        },
        getAdditionalDetails: (additionalData: AdditionalData, filterKeyBy: string) => {
            const data = Object.keys(additionalData)
                .filter(key => key.includes(filterKeyBy))
                .reduce((acc, key) => ({ ...acc, [key.replace(filterKeyBy, '') || deliveryMethod]: additionalData[key].value }), {});

            return getDataByDeliveryMethod(data, deliveryMethod, t);
        },
    },
];

type StepAdditionalDataProps = {
    additionalData: AdditionalData;
    stepKey: AdditionalDataIds;
    status: string;
    date: string;
};
const StepAdditionalData = ({ additionalData, stepKey, status, date }: StepAdditionalDataProps) => {
    const deliveryMethod = additionalData['deliveryMethod']?.value as CommunicationTypes;

    const renderAdditionalData = (id: AdditionalDataIds) => {
        switch (id) {
            case AdditionalDataIds.correspondenceRequest:
                return (
                    <>
                        <AdditionalStepStatus
                            updatedAt={dayjs(date, 'YYYY-MM-DD HH:mm:ss').format('MM/DD/YYYY HH:mm a CST')}
                            status={status as Statuses}
                        />
                        <DeliveryCard additionalData={additionalData} deliveryMethod={deliveryMethod} />
                    </>
                );
            case AdditionalDataIds.sedRequest:
                return '';
            default:
                return null;
        }
    };
    return <CardContainer>{renderAdditionalData(stepKey)}</CardContainer>;
};

export default StepAdditionalData;

type DeliveryCardProps = {
    additionalData: AdditionalData;
    deliveryMethod: CommunicationTypes;
};
const DeliveryCard = ({ additionalData, deliveryMethod }: DeliveryCardProps) => {
    const { t } = useTranslation();

    const formattedData: { [key in string]?: string } = Object.keys(additionalData)
        .filter(key => key.includes(correspondenceTypes[deliveryMethod].key))
        .reduce(
            (acc, key) => ({
                ...acc,
                [key.replace(correspondenceTypes[deliveryMethod].key, '') || deliveryMethod]: additionalData[key].value,
            }),
            {}
        );

    const getTitle = (deliveryMethod: CommunicationTypes) => {
        switch (deliveryMethod) {
            case CommunicationTypes.Email:
            case CommunicationTypes.Fax:
                return formattedData[deliveryMethod];
            case CommunicationTypes.Mail:
                return `${formattedData['firstName'] || ''} ${formattedData['lastName'] || ''}`;
        }
    };
    return (
        <>
            <div className="flex flex-row my-4">
                <Typography variant={TypographyVariant.H2}>{t('caseOverview.correspondenceStepDetails.requestedRecipients')}</Typography>
            </div>
            <Table className="my-4">
                <TableBody>
                    <TableRow>
                        <TableCell colSpan={2}>{getTitle(deliveryMethod)}</TableCell>
                    </TableRow>
                    {correspondenceStepConfig(deliveryMethod, t).map(
                        (step, index) =>
                            step?.shouldDisplay(deliveryMethod) && (
                                <TableRow key={index}>
                                    <TableCell className="bg-gray-50">{step?.label}</TableCell>
                                    <TableCell className="bg-gray-50">
                                        {step?.getAdditionalDetails && step?.getAdditionalDetails(additionalData, step.key)}
                                    </TableCell>
                                </TableRow>
                            )
                    )}
                </TableBody>
            </Table>
        </>
    );
};
