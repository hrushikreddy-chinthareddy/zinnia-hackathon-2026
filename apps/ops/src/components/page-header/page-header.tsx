import { useTranslation } from 'next-i18next';
import { useContext } from 'react';

import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import CardContainer from '@deps/containers/card-container/card-container';
import { PolicyData } from '@deps/contexts/PolicyDataContext';
import { toSentenceCase } from '@deps/helpers/string.helpers';
import { ReactComponent as LeftArrow } from '@deps/styles/elements/icons/arrow/direction-left-3.svg';
import { Parties } from '@zinnia/api-types/types/sor';

import styles from './page-header.module.css';
import NavElement, {
    NavElementSize,
    NavElementType,
} from '../nav-element/nav-element';
import { PiiWrapper } from '../pii/PiiWrapper';

export interface PageHeaderProps {
    icon?: JSX.Element;
    headerText?: string | JSX.Element;
    headerTextSiblingsGroupOne?: React.ReactNode;
    headerTextSiblingsGroupTwo?: React.ReactNode;
    breadcrumbText?: string;
    breadcrumbUrl?: string;
    breadcrumbSiblings?: React.ReactNode;
    subHeaderTextChildren?: React.ReactNode;
    belowHeaderTextChildren?: React.ReactNode;
    onClick?: () => void;
    groupOneFlexClassNames?: string;
    headerRowFlexClassNames?: string;
}

export const Breadcrumb = ({
    breadcrumbUrl,
    breadcrumbText,
    onClick,
}: PageHeaderProps) => {
    const { t } = useTranslation();

    const { policy } = useContext(PolicyData);

    const checkBreadcrumbForPartyPii = (
        breadcrumbText?: string,
        PolicyPartyRoles?: Parties[]
    ) => {
        const partyNames = PolicyPartyRoles?.map(
            (party) =>
                `${toSentenceCase(party.firstName)} ${toSentenceCase(
                    party.middleName
                )} ${toSentenceCase(party.lastName)}`
        );
        const matchedName = partyNames?.find((name) =>
            breadcrumbText?.includes(name)
        );

        if (matchedName) {
            return (
                <>
                    {t('piiBreadcrumb')} <PiiWrapper>{matchedName}</PiiWrapper>
                </>
            );
        } else {
            return breadcrumbText;
        }
    };

    const piiBreadcrumb = checkBreadcrumbForPartyPii(
        breadcrumbText,
        policy.parties
    );

    return (
        <>
            {breadcrumbUrl && (
                <NavElement
                    href={breadcrumbUrl}
                    type={NavElementType.Link}
                    size={NavElementSize.Small}
                    onClick={onClick}
                    className={styles.breadcrumbLink}
                    startIcon={<LeftArrow height={16} width={16} />}
                    aria-labelledby="breadcrumb-text"
                >
                    <p id="breadcrumb-text">{piiBreadcrumb}</p>
                </NavElement>
            )}
        </>
    );
};

const HeaderText = ({ headerText }: Pick<PageHeaderProps, 'headerText'>) => {
    return (
        <Typography
            className={styles.headerTypography}
            variant={TypographyVariant.H1}
            data-testid="header-text"
        >
            {headerText}
        </Typography>
    );
};

const Icon = ({ icon }: Pick<PageHeaderProps, 'icon'>) => {
    return (
        <>
            {icon && (
                <div data-testid="icon" className={styles.iconWrapper}>
                    {icon}
                </div>
            )}
        </>
    );
};

export const PageHeader = ({
    breadcrumbText,
    breadcrumbUrl,
    breadcrumbSiblings,
    icon,
    headerText,
    headerTextSiblingsGroupOne,
    headerTextSiblingsGroupTwo,
    subHeaderTextChildren,
    belowHeaderTextChildren,
    onClick,
    groupOneFlexClassNames,
    headerRowFlexClassNames,
}: PageHeaderProps) => {
    const headerRowClassNames = `${styles.headerRow} ${
        headerRowFlexClassNames ?? ''
    }`;

    return (
        <CardContainer
            data-testid="page-header"
            containerClassNames={styles.cardContainer}
            classNames={styles.cardContent}
        >
            {/* breadcrumb and breadcrumb siblings -- elements above header text row */}
            {(breadcrumbText || breadcrumbSiblings) && (
                <div className={styles.breadcrumbRow}>
                    <Breadcrumb
                        breadcrumbText={breadcrumbText}
                        breadcrumbUrl={breadcrumbUrl}
                        onClick={onClick}
                    />
                    {breadcrumbSiblings && breadcrumbSiblings}
                </div>
            )}
            {/* header text row */}
            <div className={headerRowClassNames}>
                {/* header text and header text siblings - group one -- elements justified on left side within the header text row */}
                <div
                    data-testid="group-one-siblings"
                    className={groupOneFlexClassNames}
                >
                    <div className={styles.groupOneColumn}>
                        <div className={styles.iconAndHeaderText}>
                            <Icon icon={icon} />
                            <HeaderText headerText={headerText} />
                        </div>
                        {subHeaderTextChildren && (
                            <div data-testid="children-below">
                                {subHeaderTextChildren}
                            </div>
                        )}
                    </div>
                    {headerTextSiblingsGroupOne && headerTextSiblingsGroupOne}
                </div>

                {/* header text siblings - group two -- elements justified on the right side within the header text row */}
                {headerTextSiblingsGroupTwo && (
                    <div
                        data-testid="group-two-siblings"
                        className={styles.groupTwoSiblings}
                    >
                        {headerTextSiblingsGroupTwo}
                    </div>
                )}
            </div>
            {/* below header text children - elements below header text row */}
            {belowHeaderTextChildren && (
                <div data-testid="children-below">
                    {belowHeaderTextChildren}
                </div>
            )}
        </CardContainer>
    );
};

export default PageHeader;
