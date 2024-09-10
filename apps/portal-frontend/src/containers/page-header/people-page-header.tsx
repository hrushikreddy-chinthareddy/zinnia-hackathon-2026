import { useTranslation } from 'next-i18next';
import React from 'react';

import NavElement, { NavElementSize, NavElementType } from '@deps/components/nav-element/nav-element';
import TempNavInactive, { isStillInactive } from '@deps/components/nav-element/temp-nav-inactive/temp-nav-inactive';
import { PageHeader } from '@deps/components/page-header/page-header';
import { ReactComponent as UserAdd } from '@deps/styles/elements/icons/icons_outlined/user-add.svg';

interface PeoplePageHeaderContainerProps {
    breadcrumbText?: string;
    breadcrumbUrl?: string;
    onClick?: () => void;
}

const PeoplePageHeaderContainer = ({ breadcrumbText, breadcrumbUrl, onClick }: PeoplePageHeaderContainerProps) => {
    const { t } = useTranslation();

    const headerTextSiblingsGroupTwo = (
        <NavElement
            startIcon={<UserAdd height={16} />}
            type={NavElementType.Button}
            size={NavElementSize.Small}
            tabIndex={0}
            className="flex h-[21px] items-center self-center whitespace-nowrap leading-[21px] [&_svg]:mr-1"
        >
            {t('pageHeader.people.actionButton.addANewPerson')}
        </NavElement>
    );

    const unavailableTransactionsHeaderSiblingsGroupTwo = (
        // https://zinnia.atlassian.net/browse/DEPU-1936
        <TempNavInactive triggerClassName="self-center" tooltipBody={isStillInactive.peoplePageHeader}>
            {t('pageHeader.people.actionButton.addANewPerson')}
        </TempNavInactive>
    );

    return (
        <PageHeader
            headerText={t('pageHeader.people.headerText') || ''}
            headerTextSiblingsGroupTwo={
                isStillInactive.peoplePageHeader ? unavailableTransactionsHeaderSiblingsGroupTwo : headerTextSiblingsGroupTwo
            }
            breadcrumbText={breadcrumbText}
            breadcrumbUrl={breadcrumbUrl}
            onClick={onClick}
        />
    );
};

export default PeoplePageHeaderContainer;
