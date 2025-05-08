import { Table, TableBody, TableCell, TableRow } from '@zinnia/bloom/components';
import { TFunction, useTranslation } from 'next-i18next';

import AdditionalStepStatus from '@deps/components/case-overview-box/content/additional-step-status';
import { formatTimestamp, TransformedStep } from '@deps/components/case-sub-page/case-tabs/progress/progress-tab-helpers';
import { CaseAdditionalData } from '@deps/components/case-sub-page/case-tabs/progress/progress-tab-types';
import Typography, { TypographyVariant } from '@deps/components/typography/typography';
import { formatAddressToContainer } from '@deps/containers/small-data-card/address-data/address-data';
import { toTitleCase } from '@deps/helpers/string.helpers';
import { AdditionalDataStepIds, CommunicationTypes, correspondenceTypes } from '@deps/models/case/additional-data-instance';
import { Statuses } from '@deps/models/case/case';

type DeliveryCardProps = {
    additionalData: CaseAdditionalData;
    deliveryMethod: CommunicationTypes;
    title?: string;
};

type StepAdditionalDataProps = {
    additionalData: CaseAdditionalData;
    stepKey: AdditionalDataStepIds;
    status: string;
    date: string;
};

export const hasAdditionalDataSideSheet = (step: TransformedStep): boolean => {
    if (!Object.keys(step.additionalData).length) return false;
    return Object.values(AdditionalDataStepIds).includes(step.id as AdditionalDataStepIds);
};
const getDataByDeliveryMethod = (data: CaseAdditionalData, deliveryMethod: CommunicationTypes, t: TFunction) => {
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
            return toTitleCase(deliveryMethod);
        },
    },
    {
        label: t('caseOverview.correspondenceStepDetails.sentDate'),
        key: 'deliveryDate',
        shouldDisplay: (): boolean => {
            return true;
        },
        getAdditionalDetails: (additionalData: CaseAdditionalData, filterKeyBy: string) => {
            const date = additionalData[filterKeyBy].value;
            return formatTimestamp(date);
        },
    },
    {
        label: t('caseOverview.correspondenceStepDetails.address'),
        key: correspondenceTypes[deliveryMethod].key,
        shouldDisplay: (deliveryMethod?: CommunicationTypes): boolean => {
            if (!deliveryMethod) return false;
            return correspondenceTypes[deliveryMethod].value === CommunicationTypes.Mail;
        },
        getAdditionalDetails: (additionalData: CaseAdditionalData, filterKeyBy: string) => {
            const data = Object.keys(additionalData)
                .filter(key => key.includes(filterKeyBy))
                .reduce((acc, key) => ({ ...acc, [key.replace(filterKeyBy, '') || deliveryMethod]: additionalData[key].value }), {});
            return getDataByDeliveryMethod(data, deliveryMethod, t);
        },
    },
];

const DeliveryCard = ({ additionalData, deliveryMethod, title }: DeliveryCardProps) => {
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
                <Typography variant={TypographyVariant.H3}>
                    {title ?? t('caseOverview.correspondenceStepDetails.requestedRecipients')}
                </Typography>
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
                                    <TableCell className="bg-gray-50 text-md text-gray-500 !border-b-0">{step?.label}</TableCell>
                                    <TableCell className="bg-gray-50 text-md text-gray-700 !border-b-0">
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

const StepAdditionalData = ({ additionalData, stepKey, status, date }: StepAdditionalDataProps) => {
    const { t } = useTranslation(undefined, { keyPrefix: 'caseOverview.correspondenceStepDetails' });
    const deliveryMethod = additionalData['deliveryMethod']?.value as CommunicationTypes;

    const renderAdditionalData = (id: AdditionalDataStepIds) => {
        const updatedAt = formatTimestamp(date);
        switch (id) {
            case AdditionalDataStepIds.correspondenceRequest:
                return (
                    <>
                        <AdditionalStepStatus updatedAt={updatedAt} status={status as Statuses} />
                        <DeliveryCard
                            additionalData={additionalData}
                            deliveryMethod={deliveryMethod}
                            title={t('requestedRecipients') as string}
                        />
                    </>
                );
            case AdditionalDataStepIds.sedRequest:
                return (
                    <>
                        <AdditionalStepStatus updatedAt={updatedAt} status={status as Statuses} />
                    </>
                );
            case AdditionalDataStepIds.completeRequest:
                return (
                    <>
                        <AdditionalStepStatus updatedAt={updatedAt} status={status as Statuses} />
                        <DeliveryCard additionalData={additionalData} deliveryMethod={deliveryMethod} title={t('recipients') as string} />
                    </>
                );
            default:
                return null;
        }
    };
    return (
        <>
            <Typography variant={TypographyVariant.H3}>{t('additionalData')}</Typography>
            {renderAdditionalData(stepKey)}
        </>
    );
};

export default StepAdditionalData;
