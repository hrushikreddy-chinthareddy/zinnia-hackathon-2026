import { Meta } from '@storybook/react';
import { Tag } from '@zinnia/bloom/components';

import WithdrawalsPageHeaderContainer from '@deps/containers/page-header/withdrawals-page-header';
import { calculateAge, formatDate } from '@deps/helpers/string.helpers';
import { mockPolicy } from '@deps/jest/data/mockPolicy';
import { ReactComponent as User } from '@deps/styles/elements/icons/actions/user.svg';
import { ReactComponent as CircleInfoIcon } from '@deps/styles/elements/icons/circles/circle-info.svg';
import { ReactComponent as EditIcon } from '@deps/styles/elements/icons/icons_outlined/edit-alt.svg';
import { ReactComponent as UserAdd } from '@deps/styles/elements/icons/icons_outlined/user-add.svg';
import { ReactComponent as UserGroup } from '@deps/styles/elements/icons/icons_outlined/user-group.svg';

import { PageHeader, PageHeaderProps } from './page-header';
import '@deps/styles/styles.css';
import AssistiveText, {
    AssistiveTextVariant,
} from '../assistive-text/assistive-text';
import Badge from '../badge/badge';
import { BadgeVariant } from '../badge/badge.helpers';
import NavElement, {
    NavElementType,
    NavElementSize,
} from '../nav-element/nav-element';
import Popover, { PopoverPlacement } from '../popover/popover';

export default {
    title: 'Components/PageHeader',
    component: PageHeader,
    decorators: [
        (Story) => (
            <div className="h-screen w-screen bg-gray-200 p-10">
                <Story />
            </div>
        ),
    ],
    argTypes: {
        headerText: {
            control: 'text',
        },
        breadcrumbText: {
            control: 'text',
        },
        breadcrumbUrl: {
            control: 'text',
        },
    },
} as Meta<typeof PageHeader>;

export const HeaderWithGroupTwoSiblings = (args: PageHeaderProps) => (
    <PageHeader {...args} />
);
HeaderWithGroupTwoSiblings.args = {
    headerText: 'People',
    headerTextSiblingsGroupTwo: (
        <NavElement
            startIcon={<UserAdd height={16} />}
            type={NavElementType.Button}
            size={NavElementSize.Small}
            tabIndex={0}
            className="flex h-[21px] items-center self-center whitespace-nowrap leading-[21px] [&_svg]:mr-1"
        >
            Add a new person
        </NavElement>
    ),
};

export const HeaderWithBreadcrumb = (args: PageHeaderProps) => (
    <PageHeader {...args} />
);
HeaderWithBreadcrumb.args = {
    headerText: 'People',
    breadcrumbText: 'Back to policy search',
    breadcrumbUrl: '/policies',
    headerTextSiblingsGroupTwo: (
        <NavElement
            startIcon={<UserAdd height={16} />}
            type={NavElementType.Button}
            size={NavElementSize.Small}
            tabIndex={0}
            className="flex h-[21px] items-center self-center whitespace-nowrap leading-[21px] [&_svg]:mr-1"
        >
            Add a new person
        </NavElement>
    ),
};

const calendarSVG = (
    <svg
        width="16px"
        height="16px"
        preserveAspectRatio="none"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
    >
        <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M8 2C8.55228 2 9 2.44772 9 3V4H15V3C15 2.44772 15.4477 2 16 2C16.5523 2 17 2.44772 17 3V4H19C20.6569 4 22 5.34315 22 7V19C22 20.6569 20.6569 22 19 22H5C3.34315 22 2 20.6569 2 19V7C2 5.34315 3.34315 4 5 4H7V3C7 2.44772 7.44772 2 8 2ZM7 6H5C4.44772 6 4 6.44772 4 7V19C4 19.5523 4.44772 20 5 20H19C19.5523 20 20 19.5523 20 19V7C20 6.44772 19.5523 6 19 6H17V7C17 7.55228 16.5523 8 16 8C15.4477 8 15 7.55228 15 7V6H9V7C9 7.55228 8.55228 8 8 8C7.44772 8 7 7.55228 7 7V6ZM6 11C6 10.4477 6.44772 10 7 10H17C17.5523 10 18 10.4477 18 11C18 11.5523 17.5523 12 17 12H7C6.44772 12 6 11.5523 6 11Z"
            fill="#212121"
        />
    </svg>
);
const currencyDollarSVG = (
    <svg
        width="16px"
        height="16px"
        preserveAspectRatio="none"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
    >
        <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4ZM2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12ZM12 6C12.5523 6 13 6.44772 13 7V7.09236C13.9405 7.26915 14.7915 7.69637 15.354 8.34462C15.7159 8.76176 15.6712 9.39335 15.254 9.7553C14.8369 10.1173 14.2053 10.0725 13.8434 9.65538C13.6808 9.4681 13.391 9.27771 13 9.15075L13 11.092C13.6216 11.2087 14.1965 11.4341 14.676 11.7537C15.3977 12.2348 16 13.0093 16 14C16 14.9907 15.3977 15.7651 14.676 16.2463C14.1965 16.5659 13.6216 16.7913 13 16.908L13 17C13 17.5523 12.5523 18 12 18C11.4477 18 11 17.5523 11 17L11 16.9076C10.0596 16.7308 9.20855 16.3036 8.64607 15.6554C8.28411 15.2382 8.32885 14.6067 8.74599 14.2447C9.16313 13.8827 9.79471 13.9275 10.1567 14.3446C10.3192 14.5319 10.609 14.7223 11 14.8492L11 12.908C10.3784 12.7913 9.80348 12.5659 9.32398 12.2463C8.6023 11.7651 8 10.9907 8 10C8 9.00933 8.6023 8.23485 9.32398 7.75374C9.80348 7.43407 10.3784 7.20873 11 7.09199V7C11 6.44772 11.4477 6 12 6ZM11 9.15101C10.7794 9.2224 10.5882 9.31464 10.4334 9.41784C10.0693 9.66058 10 9.8861 10 10C10 10.1139 10.0693 10.3394 10.4334 10.5822C10.5882 10.6854 10.7794 10.7776 11 10.849L11 9.15101ZM13 13.151L13 14.849C13.2206 14.7776 13.4118 14.6854 13.5666 14.5822C13.9308 14.3394 14 14.1139 14 14C14 13.8861 13.9308 13.6606 13.5666 13.4178C13.4118 13.3146 13.2206 13.2224 13 13.151Z"
            fill="#212121"
        />
    </svg>
);

export const HeaderWithFlags = (args: PageHeaderProps) => (
    <PageHeader {...args} />
);
HeaderWithFlags.args = {
    headerText: 'Premiums',
    breadcrumbText: 'Back to transactions',
    breadcrumbUrl: '/policies',
    belowHeaderTextChildren: (
        <div className="mt-4 flex xs:w-[328px] xs:flex-wrap xs:gap-4 md:w-full md:flex-nowrap md:gap-8">
            <div className="my-0 w-fit xs:mr-4 md:mr-0">
                <div className="flex items-center gap-2">
                    <span className="label relative font-primary text-sm font-bold leading-4.5">
                        Label
                    </span>

                    <Popover
                        title={'Here is a popover'}
                        body="here is the popover body"
                        placement={PopoverPlacement.TopRight}
                    >
                        <CircleInfoIcon
                            height={'13px'}
                            width={'13px'}
                            className="text-primary"
                        />
                    </Popover>
                </div>

                <div
                    id="ddId"
                    className="mb-0 ml-0 h-[25px] break-words text-[22px] leading-[26px]"
                >
                    Add Value
                </div>
            </div>
            <div className="my-0 w-fit xs:mr-4 md:mr-0">
                <div className="flex items-center gap-2">
                    <span className="label relative font-primary text-sm font-bold leading-4.5">
                        Label
                    </span>

                    <Popover
                        title={'Here is a popover'}
                        body="here is the popover body"
                        placement={PopoverPlacement.TopRight}
                    >
                        <CircleInfoIcon
                            height={'13px'}
                            width={'13px'}
                            className="text-primary"
                        />
                    </Popover>
                </div>

                <div
                    id="ddId"
                    className="mb-0 ml-0 h-[25px] break-words text-[22px] leading-[26px]"
                >
                    Add Value
                </div>
            </div>
            <div className="my-0 w-fit xs:mr-4 md:mr-0">
                <div className="flex items-center gap-2">
                    <span className="label relative font-primary text-sm font-bold leading-4.5">
                        Label
                    </span>

                    <Popover
                        title={'Here is a popover'}
                        body="here is the popover body"
                        placement={PopoverPlacement.TopRight}
                    >
                        <CircleInfoIcon
                            height={'13px'}
                            width={'13px'}
                            className="text-primary"
                        />
                    </Popover>
                </div>

                <div className="mb-0 ml-0 h-[25px] break-words text-[22px] leading-[26px]">
                    Add Value
                </div>
            </div>
        </div>
    ),

    groupOneFlexClassNames: 'flex xs:flex-col md:flex-row',
    headerTextSiblingsGroupOne: (
        <div className="flex gap-2 xs:ml-0 xs:mt-4 md:ml-4 md:mt-0">
            <Badge
                key="bg1"
                className="flex h-fit items-center gap-2 self-center"
                icon={calendarSVG}
                variant={BadgeVariant.Neutral}
                label={'In Free Look Period'}
            />
            <Badge
                key="bg2"
                className="flex h-fit items-center gap-2 self-center"
                icon={currencyDollarSVG}
                variant={BadgeVariant.Neutral}
                label={'Temporary Flat Extra'}
            />
        </div>
    ),
};

export const HeaderWithPartyInfo = () => {
    const icon = <User height={24} className="self-center" />;
    const headerText = (
        <span className="flex xs:flex-col xs:gap-0 md:flex-row md:gap-2">
            <span>Florence</span>
            <span>Anderson</span>
        </span>
    );
    const headerRowFlexClassNames = 'xs:flex-col lg:flex-row';
    const groupOneFlexClassNames = 'flex xs:flex-col lg:flex-row';

    const headerTextSiblingsGroupOne = (
        <div className="flex gap-2 xs:mb-4 xs:mt-1 lg:mb-0 lg:ml-4 lg:mt-0 lg:self-center">
            <p className="font-primary text-sm font-bold">She/her</p>
            <NavElement
                type={NavElementType.Button}
                size={NavElementSize.Small}
                tabIndex={0}
                className=" h-4"
            >
                <EditIcon height={16} />
            </NavElement>
        </div>
    );

    const headerTextSiblingsGroupTwo = (
        <div className="flex">
            <div>
                <p className="field-label font-primary font-bold">
                    Communication Method
                </p>
                <p className="body-sm">(956)-251-3392</p>
                <AssistiveText
                    text="SMS preferred"
                    variant={AssistiveTextVariant.Success}
                />
            </div>

            <div className="ml-8">
                <span className="flex gap-2">
                    <p className="field-label font-primary font-bold">
                        Birth date
                    </p>

                    <NavElement
                        type={NavElementType.Button}
                        size={NavElementSize.Small}
                        tabIndex={0}
                        className="flex self-center"
                    >
                        <EditIcon height={16} />
                    </NavElement>
                </span>

                <p className="body-sm">{formatDate('1972-04-04')}</p>
                <p className="body-sm">
                    {calculateAge('1972-04-04', ' years old')}
                </p>
            </div>
        </div>
    );

    const belowHeaderTextChildren = (
        <div className="mt-4 flex xs:flex-col md:flex-row">
            <div className="flex flex-wrap gap-1">
                <Tag text="Primary Beneficiary" />
                <Tag text="Prime" />
            </div>
            <NavElement
                startIcon={<UserGroup height={16} />}
                type={NavElementType.Button}
                size={NavElementSize.Small}
                tabIndex={0}
                className="flex h-[21px] w-fit items-center whitespace-nowrap leading-[21px] xs:ml-0 xs:mt-4 md:ml-4 md:mt-0 [&_svg]:mr-1"
            >
                Add or remove roles
            </NavElement>
        </div>
    );

    return (
        <PageHeader
            breadcrumbText="Back to people"
            breadcrumbUrl={'/people'}
            icon={icon}
            headerText={headerText}
            headerTextSiblingsGroupOne={headerTextSiblingsGroupOne}
            headerTextSiblingsGroupTwo={headerTextSiblingsGroupTwo}
            belowHeaderTextChildren={belowHeaderTextChildren}
            headerRowFlexClassNames={headerRowFlexClassNames}
            groupOneFlexClassNames={groupOneFlexClassNames}
        />
    );
};

export const WithdrawalsPageHeader = () => {
    return (
        <WithdrawalsPageHeaderContainer
            policyNumber={mockPolicy.policyNumber}
        />
    );
};
