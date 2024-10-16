import { useTranslation } from 'next-i18next';
import React from 'react';

import NavElement, { NavElementSize, NavElementType } from '@deps/components/nav-element/nav-element';
import Title, { TitleVariant } from '@deps/components/title/title';
import { AdditionalDataInstance, CaseAdditionalDataKeys } from '@deps/models/case/additional-data-instance';
import { ReactComponent as DocumentIcon } from '@deps/styles/elements/icons/icons_outlined/document-text-2.svg';
type CaseDetailsSideNavProps = {
    CaseAdditionalDetails: AdditionalDataInstance;
};
const CaseDetailsSideNav = ({ CaseAdditionalDetails }: CaseDetailsSideNavProps) => {
    console.log('🚀 ~ CaseDetailsSideNav ~ CaseAdditionalDetails:', CaseAdditionalDetails);
    const { t } = useTranslation();
    return (
        <div className="flex w-full flex-col border-b-2 border-gray-100 p-4 md:px-8">
            <Title className="mb-2" variant={TitleVariant.SubTitle}>
                {t('sidenav.navButtons.caseDetails')}
            </Title>

            <NavElement
                href={`/documents/${CaseAdditionalDetails[CaseAdditionalDataKeys.formName]}}`}
                isNewPage={true}
                size={NavElementSize.Small}
                target="_blank"
                title={CaseAdditionalDetails[CaseAdditionalDataKeys.formName]}
                type={NavElementType.Link}
                startIcon={<DocumentIcon width={20} height={20} />}
            >
                {CaseAdditionalDetails[CaseAdditionalDataKeys.formName]}
            </NavElement>
        </div>
    );
};

export default CaseDetailsSideNav;
