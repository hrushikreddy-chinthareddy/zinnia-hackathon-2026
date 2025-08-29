import { toSentenceCase } from '@zinnia/utils';
import { setCookie } from 'cookies-next';
import { useTranslation } from 'next-i18next';

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
import { getValidFullName } from '@deps/helpers/case-management';
import { formatSSN } from '@deps/helpers/string.helpers';
import {
    AdditionalDataInstance,
    CaseAdditionalDataKeys,
    CommunicationTypes,
} from '@deps/models/case/additional-data-instance';
import { Processes } from '@deps/models/case/case';
import { TransactionTypes } from '@deps/models/case/correspondence';

type CaseDetailsSideNavProps = {
    CaseAdditionalDetails: AdditionalDataInstance;
    carrier: string;
    process?: Processes;
    applicationType?: string;
};
const CaseDetailsSideNav = ({
    CaseAdditionalDetails,
    carrier,
    process,
    applicationType,
}: CaseDetailsSideNavProps) => {
    const { t } = useTranslation();
    const { agentFirstName, agentLastName, agentNPN, agentSSN } =
        CaseAdditionalDetails;
    const displayAgentDetails = !!(
        agentFirstName ||
        agentLastName ||
        agentNPN ||
        agentSSN
    );

    const setCookies = () => {
        setCookie('documentType', DocumentTypeView.Correspondence);
        setCookie('carrierCode', carrier);
    };

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

    const appTypeLowerCase = applicationType?.toLocaleLowerCase();
    const submissionType =
        appTypeLowerCase === 'digital' || appTypeLowerCase === 'electronic'
            ? t('sidenav.electronic')
            : t(`sidenav.${appTypeLowerCase}`);

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
                                className="text-[--color-base-text-text-secondary]"
                            >
                                {t('sidenav.type')}
                            </Typography>
                            <Content
                                details={toSentenceCase(process)}
                                variant={ContentVariant.BodySm}
                            />
                        </>
                    )}

                    {applicationType && (
                        <>
                            <Typography
                                variant={TypographyVariant.BodySm}
                                className="text-[--color-base-text-text-secondary]"
                            >
                                {t('sidenav.submissionType')}
                            </Typography>
                            <Content
                                details={toSentenceCase(submissionType)}
                                variant={ContentVariant.BodySm}
                            />
                        </>
                    )}

                    {process === Processes.Correspondence && (
                        <>
                            <Typography
                                variant={TypographyVariant.BodySm}
                                className="text-[--color-base-text-text-secondary]"
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
                                className="text-[--color-base-text-text-secondary]"
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
                                    className="text-[--color-base-text-text-secondary]"
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
                                    className="text-[--color-base-text-text-secondary]"
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
                                    className="text-[--color-base-text-text-secondary]"
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
                                    className="text-[--color-base-text-text-secondary]"
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
