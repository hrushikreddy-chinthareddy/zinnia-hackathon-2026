import { Tooltip, TooltipPlacement } from '@zinnia/bloom/components';
import { setCookie } from 'cookies-next';
import { useTranslation } from 'next-i18next';
import React from 'react';

import Content, { ContentVariant } from '@deps/components/content/content';
import NavElement, {
    NavElementSize,
    NavElementType,
} from '@deps/components/nav-element/nav-element';
import { DocumentTypeView } from '@deps/components/side-sheet/documents/DocumentTypeView';
import Title, { TitleVariant } from '@deps/components/title/title';
import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import { DetailTypesEnum } from '@deps/constants/case';
import { usePermissionsContext } from '@deps/contexts/PermissionsContext';
import { getValidFullName } from '@deps/helpers/case-management';
import {
    convertKebabedDateString,
    formatSSN,
} from '@deps/helpers/string.helpers';
import {
    AdditionalDataInstance,
    CaseAdditionalDataKeys,
    CommunicationTypes,
} from '@deps/models/case/additional-data-instance';
import { Processes } from '@deps/models/case/case';
import { TransactionTypes } from '@deps/models/case/correspondence';
import { CaseSource } from '@deps/models/case/enums';
import { ReactComponent as CircleInfoIcon } from '@deps/styles/elements/icons/circles/circle-info.svg';
import { formatTimestamp } from '@deps/utils/dates';
import { toSentenceCase } from '@deps/utils/strings';

import { getDetailsByDetailType } from './case-helpers';

export type CaseDetailsSideNavProps = {
    CaseAdditionalDetails: AdditionalDataInstance;
    carrier: string;
    process?: Processes;
    applicationType?: string;
    estimatedCompletionAt?: string | null;
    caseProcessingDetails?: {
        detailType: string;
        details: {
            performedBy?: string;
            source?: string;
            partyId?: string;
            applicationType?: string;
        };
        eventTimeStamp: number;
    }[];
};

const parentCaseDetailsKeys: string[] = [
    'caseId',
    'caseTransactionType',
    'caseCompletionDate',
];
const CaseDetailsSideNav = ({
    CaseAdditionalDetails,
    carrier,
    process,
    estimatedCompletionAt,
    applicationType,
    caseProcessingDetails,
}: CaseDetailsSideNavProps) => {
    const { hasCaseInsightPermission } = usePermissionsContext();

    const { t } = useTranslation();
    const submissionDetails = getDetailsByDetailType(
        caseProcessingDetails,
        DetailTypesEnum.Submission
    );

    const { agentFirstName, agentLastName, agentNPN, agentSSN, transactionId } =
        CaseAdditionalDetails;
    const displayAgentDetails = !!(
        agentFirstName ||
        agentLastName ||
        agentNPN ||
        agentSSN
    );

    const parentCaseDetails = parentCaseDetailsKeys.filter(
        (key: string) => CaseAdditionalDetails?.[key]
    );
    const parentCaseKeysFormatter: Record<string, () => string> = {
        caseId: () => CaseAdditionalDetails.caseId.toUpperCase(),
        caseCompletionDate: () =>
            convertKebabedDateString(CaseAdditionalDetails.caseCompletionDate),
        caseTransactionType: () =>
            toSentenceCase(CaseAdditionalDetails.caseTransactionType),
    };

    const setCookies = () => {
        setCookie('documentType', DocumentTypeView.Correspondence);
        setCookie('carrierCode', carrier);
    };

    const showSubmissionDetails = Object.values(CaseSource).includes(
        submissionDetails?.source as CaseSource
    );

    const url =
        CaseAdditionalDetails[CaseAdditionalDataKeys.requestSubType] !==
        TransactionTypes.Statements
            ? `/contact-center/document/${
                  CaseAdditionalDetails[CaseAdditionalDataKeys.formId]
              }`
            : `/documents/${
                  CaseAdditionalDetails[CaseAdditionalDataKeys.formId]
              }`;

    const deliveryMethod =
        CaseAdditionalDetails[CaseAdditionalDataKeys.deliveryMethod];
    CaseAdditionalDetails[CaseAdditionalDataKeys.deliveryMethod];

    const appTypeLowerCase = (
        submissionDetails?.applicationType || applicationType
    )?.toLowerCase();
    const submissionType = appTypeLowerCase
        ? appTypeLowerCase === 'digital' || appTypeLowerCase === 'electronic'
            ? t('sidenav.electronic')
            : t(`sidenav.${appTypeLowerCase}`)
        : '';
    const formattedEstimatedCompletion = estimatedCompletionAt
        ? formatTimestamp(estimatedCompletionAt, 'dateTimeWithTZ')
        : null;

    return (
        <>
            <div className="flex w-full flex-col border-t-2 border-gray-100 p-4">
                <Typography
                    asTag="h2"
                    variant={TypographyVariant.BodyBold}
                    className="mb-2"
                >
                    {t('sidenav.navButtons.caseDetails')}
                </Typography>

                <div className="grid grid-cols-2 my-4 gap-y-2">
                    {process && (
                        <>
                            <Typography
                                variant={TypographyVariant.BodySm}
                                className="text-[--color-base-text-secondary]"
                            >
                                {t('sidenav.type')}
                            </Typography>
                            <Content
                                details={toSentenceCase(process)}
                                variant={ContentVariant.BodySm}
                            />
                        </>
                    )}

                    {submissionType && (
                        <>
                            <Typography
                                variant={TypographyVariant.BodySm}
                                className="text-[--color-base-text-secondary]"
                            >
                                {t('sidenav.submissionType')}
                            </Typography>
                            <Content
                                details={toSentenceCase(submissionType)}
                                variant={ContentVariant.BodySm}
                            />
                        </>
                    )}

                    {transactionId && (
                        <>
                            <Typography
                                variant={TypographyVariant.BodySm}
                                className="text-[--color-base-text-secondary]"
                            >
                                {t('sidenav.transactionId')}
                            </Typography>
                            <Content
                                details={toSentenceCase(transactionId)}
                                variant={ContentVariant.BodySm}
                            />
                        </>
                    )}

                    {showSubmissionDetails && submissionDetails?.source && (
                        <>
                            <Typography
                                variant={TypographyVariant.BodySm}
                                className="text-[--color-base-text-secondary]"
                            >
                                {t('sidenav.submissionSource')}
                            </Typography>
                            <Content
                                details={toSentenceCase(
                                    submissionDetails?.source
                                )}
                                variant={ContentVariant.BodySm}
                            />
                        </>
                    )}
                    {showSubmissionDetails && (
                        <>
                            <Typography
                                variant={TypographyVariant.BodySm}
                                className="text-[--color-base-text-secondary]"
                            >
                                {t('sidenav.submittedBy')}
                            </Typography>
                            <Content
                                details={toSentenceCase(
                                    submissionDetails?.performedBy || ''
                                )}
                                variant={ContentVariant.BodySm}
                            />
                        </>
                    )}

                    {process === Processes.Correspondence && (
                        <>
                            <Typography
                                variant={TypographyVariant.BodySm}
                                className="text-[--color-base-text-secondary]"
                            >
                                {t('sidenav.navButtons.document')}
                            </Typography>
                            <NavElement
                                className={'whitespace-normal break-words'}
                                href={url}
                                isNewPage={true}
                                size={NavElementSize.Small}
                                target="_blank"
                                type={NavElementType.Link}
                                onClick={setCookies}
                            >
                                {CaseAdditionalDetails[
                                    CaseAdditionalDataKeys.formName
                                ] ||
                                    CaseAdditionalDetails[
                                        CaseAdditionalDataKeys.formId
                                    ]}
                            </NavElement>
                        </>
                    )}

                    {deliveryMethod && (
                        <>
                            <Typography
                                variant={TypographyVariant.BodySm}
                                className="text-[--color-base-text-secondary]"
                            >
                                {t('sidenav.navButtons.deliveryType')}
                            </Typography>
                            <Content
                                details={toSentenceCase(deliveryMethod)}
                                variant={ContentVariant.BodySm}
                            />
                        </>
                    )}

                    {deliveryMethod === CommunicationTypes.Mail &&
                        CaseAdditionalDetails[
                            CaseAdditionalDataKeys.documentId
                        ] && (
                            <div>
                                <Typography
                                    variant={TypographyVariant.BodySm}
                                    className="text-[--color-base-text-secondary]"
                                >
                                    {t('sidenav.navButtons.correspondence')}
                                </Typography>
                                <NavElement
                                    className={''}
                                    href={`/documents/${
                                        CaseAdditionalDetails[
                                            CaseAdditionalDataKeys.documentId
                                        ]
                                    }`}
                                    isNewPage={true}
                                    size={NavElementSize.Small}
                                    target="_blank"
                                    title={
                                        CaseAdditionalDetails[
                                            CaseAdditionalDataKeys?.documentName
                                        ] ?? ''
                                    }
                                    type={NavElementType.Link}
                                    onClick={setCookies}
                                >
                                    {CaseAdditionalDetails[
                                        CaseAdditionalDataKeys?.documentName
                                    ] ?? ''}
                                </NavElement>
                            </div>
                        )}

                    {parentCaseDetails.length > 0 &&
                        parentCaseDetails.map(
                            (parentCaseKey: string, idx: number) => (
                                <React.Fragment key={idx}>
                                    <Typography
                                        variant={TypographyVariant.BodySm}
                                        className="text-[--color-base-text-secondary]"
                                    >
                                        {t(`sidenav.${parentCaseKey}`)}
                                    </Typography>
                                    {parentCaseKey === 'caseId' ? (
                                        <NavElement
                                            href={`/cases/${CaseAdditionalDetails[parentCaseKey]}`}
                                            isNewPage={true}
                                            size={NavElementSize.Small}
                                            target="_blank"
                                            type={NavElementType.Link}
                                            onClick={setCookies}
                                        >
                                            {
                                                CaseAdditionalDetails[
                                                    parentCaseKey
                                                ]
                                            }
                                        </NavElement>
                                    ) : (
                                        <Content
                                            details={parentCaseKeysFormatter[
                                                parentCaseKey
                                            ]()}
                                            variant={ContentVariant.BodySm}
                                        />
                                    )}
                                </React.Fragment>
                            )
                        )}
                    {estimatedCompletionAt && hasCaseInsightPermission && (
                        <>
                            <div className="flex items-center gap-1">
                                <Typography
                                    variant={TypographyVariant.BodySm}
                                    className="text-[--color-base-text-secondary]"
                                >
                                    {t('sidenav.estimatedCompletion')}
                                </Typography>
                                <Tooltip
                                    trigger={
                                        <CircleInfoIcon
                                            height={'16px'}
                                            width={'16px'}
                                            className="text-primary"
                                        />
                                    }
                                    placement={TooltipPlacement.TopRight}
                                    triggerClassName="w-fit"
                                    triggerAriaLabel={
                                        t('allFields.moreInformation') as string
                                    }
                                >
                                    {t('sidenav.estimatedCompletionToolTip')}
                                </Tooltip>
                            </div>
                            <Content
                                details={
                                    formattedEstimatedCompletion || undefined
                                }
                                variant={ContentVariant.BodySm}
                            />
                        </>
                    )}
                </div>
            </div>

            {displayAgentDetails && (
                <div className="flex w-full flex-col px-4 pb-4">
                    <Title className="mb-2" variant={TitleVariant.SubTitle}>
                        {t('sidenav.navButtons.agentDetails')}
                    </Title>

                    <div className="grid grid-cols-2 my-4 gap-y-2">
                        {(agentFirstName || agentLastName) && (
                            <>
                                <Typography
                                    variant={TypographyVariant.BodySm}
                                    className="text-[--color-base-text-secondary]"
                                >
                                    {t('sidenav.name')}
                                </Typography>
                                <Content
                                    details={toSentenceCase(
                                        getValidFullName({
                                            firstName: agentFirstName,
                                            lastName: agentLastName,
                                        })
                                    )}
                                    variant={ContentVariant.BodySm}
                                />
                            </>
                        )}

                        {agentSSN && (
                            <>
                                <Typography
                                    variant={TypographyVariant.BodySm}
                                    className="text-[--color-base-text-secondary]"
                                >
                                    {t('sidenav.socialSecurityNumber')}
                                </Typography>
                                <Content
                                    details={toSentenceCase(
                                        formatSSN(agentSSN)
                                    )}
                                    variant={ContentVariant.BodySm}
                                />
                            </>
                        )}

                        {agentNPN && (
                            <>
                                <Typography
                                    variant={TypographyVariant.BodySm}
                                    className="text-[--color-base-text-secondary]"
                                >
                                    {t('sidenav.nationalProducerNumber')}
                                </Typography>
                                <Content
                                    details={toSentenceCase(agentNPN)}
                                    variant={ContentVariant.BodySm}
                                />
                            </>
                        )}
                    </div>
                </div>
            )}
        </>
    );
};

export default CaseDetailsSideNav;
