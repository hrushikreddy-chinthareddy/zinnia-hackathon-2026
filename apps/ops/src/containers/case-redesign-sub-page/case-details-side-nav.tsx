import { setCookie } from 'cookies-next';
import { useTranslation } from 'next-i18next';
import React from 'react';

import Content, { ContentVariant } from '@deps/components/content/content';
import NavElement, { NavElementSize, NavElementType } from '@deps/components/nav-element/nav-element';
import { DocumentTypeView } from '@deps/components/side-sheet/documents/documents-content';
import Title, { TitleVariant } from '@deps/components/title/title';
import Typography, { TypographyVariant } from '@deps/components/typography/typography';
import { AdditionalDataInstance, CaseAdditionalDataKeys, CommunicationTypes } from '@deps/models/case/additional-data-instance';
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

    return (
        <div className="flex w-full flex-col border-b-2 border-gray-100 p-4 md:px-8">
            <Title className="mb-2" variant={TitleVariant.SubTitle}>
                {t('sidenav.navButtons.caseDetails')}
            </Title>

            <NavElement
                href={`/documents/${CaseAdditionalDetails[CaseAdditionalDataKeys.formId]}}`}
                isNewPage={true}
                size={NavElementSize.Small}
                target="_blank"
                title={CaseAdditionalDetails[CaseAdditionalDataKeys.formName]}
                type={NavElementType.Link}
                startIcon={<DocumentIcon width={20} height={20} />}
                onClick={setCookies}
            >
                {CaseAdditionalDetails[CaseAdditionalDataKeys.formName]}
            </NavElement>

            <div className="grid grid-cols-2 my-4">
                <div>
                    <Typography variant={TypographyVariant.BodyBold}> {t('sidenav.navButtons.deliveryMethod')}</Typography>
                    <Content details={CaseAdditionalDetails[CaseAdditionalDataKeys.deliveryMethod]} variant={ContentVariant.BodySm} />
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
