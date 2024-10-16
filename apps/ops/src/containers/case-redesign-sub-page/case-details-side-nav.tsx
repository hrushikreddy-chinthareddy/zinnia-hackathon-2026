import { setCookie } from 'cookies-next';
import { useTranslation } from 'next-i18next';
import React from 'react';

import Content, { ContentVariant } from '@deps/components/content/content';
import NavElement, { NavElementSize, NavElementType, NavElementVariant } from '@deps/components/nav-element/nav-element';
import { DocumentTypeView } from '@deps/components/side-sheet/documents/documents-content';
import Title, { TitleVariant } from '@deps/components/title/title';
import Typography, { TypographyVariant } from '@deps/components/typography/typography';
import { toTitleCase } from '@deps/helpers/string.helper';
import { AdditionalDataInstance, CaseAdditionalDataKeys, CommunicationTypes } from '@deps/models/case/additional-data-instance';
import { TransactionTypes } from '@deps/models/case/correspondence';
import { ReactComponent as DocumentIcon } from '@deps/styles/elements/icons/icons_outlined/document-text-2.svg';

type CaseDetailsSideNavProps = {
    CaseAdditionalDetails: AdditionalDataInstance;
    carrier: string;
};
const CaseDetailsSideNav = ({ CaseAdditionalDetails, carrier }: CaseDetailsSideNavProps) => {
    const { t } = useTranslation();

    const setCookies = () => {
        setCookie('documentType', DocumentTypeView.Correspondence);
        setCookie('carrierCode', carrier);
    };

    const url =
        CaseAdditionalDetails[CaseAdditionalDataKeys.requestSubType] !== TransactionTypes.Statements
            ? `/contact-center/document/${CaseAdditionalDetails[CaseAdditionalDataKeys.formId]}`
            : `/documents/${CaseAdditionalDetails[CaseAdditionalDataKeys.formId]}`;

    return (
        <div className="flex w-full flex-col border-b-2 border-gray-100 p-4 md:px-8">
            <Title className="mb-2" variant={TitleVariant.SubTitle}>
                {t('sidenav.navButtons.caseDetails')}
            </Title>

            <NavElement
                className={''}
                href={url}
                isNewPage={true}
                size={NavElementSize.Small}
                target="_blank"
                title={CaseAdditionalDetails[CaseAdditionalDataKeys.formName]}
                type={NavElementType.Link}
                startIcon={<DocumentIcon width={20} height={20} />}
                onClick={setCookies}
                variant={NavElementVariant.Secondary}
            >
                {CaseAdditionalDetails[CaseAdditionalDataKeys.formName]}
            </NavElement>

            <div className="grid grid-cols-2 my-4">
                <div>
                    <Typography variant={TypographyVariant.BodyBold}> {t('sidenav.navButtons.deliveryMethod')}</Typography>
                    <Content
                        details={toTitleCase(CaseAdditionalDetails[CaseAdditionalDataKeys.deliveryMethod])}
                        variant={ContentVariant.BodySm}
                    />
                </div>
                {CaseAdditionalDetails[CaseAdditionalDataKeys.deliveryMethod] === CommunicationTypes.Mail && (
                    <div>
                        <Typography variant={TypographyVariant.BodyBold}> {t('sidenav.navButtons.correspondence')}</Typography>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CaseDetailsSideNav;
