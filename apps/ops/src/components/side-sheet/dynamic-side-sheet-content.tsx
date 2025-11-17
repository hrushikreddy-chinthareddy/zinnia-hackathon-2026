import { TabGroup, TabList, TabTrigger } from '@zinnia/bloom/components';
import React, { useEffect, useState } from 'react';

import Badge from '@deps/components/badge/badge';
import { BadgeVariant } from '@deps/components/badge/badge.helpers';
import { getFormattedZaharaDate } from '@deps/containers/role-change/role-change-helper';
import { toSentenceCase } from '@deps/helpers/string.helpers';
import { ReactComponent as InProgressIcon } from '@deps/styles/elements/icons/alert/in-progress.svg';
import { ReactComponent as Progress } from '@deps/styles/elements/icons/icons_outlined/clipboard-list.svg';
import {
    TabDataItem,
    DynamicSideSheetDataType,
} from '@deps/utils/dynamicSideSheet';

export enum SideSheetDataType {
    Number = 'number',
    Date = 'date',
    Document = 'document',
    Status = 'status',
    Link = 'link',
    Button = 'button',
}

export enum SideSheetStatus {
    Completed = 'COMPLETED',
    InProgress = 'IN_PROGRESS',
    Failed = 'FAILED',
    Pending = 'PENDING',
}

export default function DynamicSideSheetContent({
    sideSheetData,
    initialTab,
    handleButtonClick,
}: {
    sideSheetData: DynamicSideSheetDataType;
    initialTab: string;
    handleButtonClick: () => void;
}) {
    const [activeTab, setActiveTab] = useState(
        sideSheetData?.tabs
            ? sideSheetData?.tabs?.find((tab) => tab.tabName === initialTab) ||
                  sideSheetData?.tabs[0]
            : null
    );

    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (sideSheetData?.tabs) {
            const initialActiveTab =
                sideSheetData.tabs.find((tab) => tab.tabName === initialTab) ||
                sideSheetData.tabs[0];
            setActiveTab(initialActiveTab);
            setIsLoading(false);
        }
    }, [sideSheetData, initialTab]);

    const handleTabChange = (value: string) => {
        const selectedTab = sideSheetData?.tabs?.find(
            (tab) => tab.tabName === value
        );
        if (selectedTab) setActiveTab(selectedTab);
    };

    const getStatusVariant = (status: string) => {
        switch (status) {
            case SideSheetStatus.Completed:
                return BadgeVariant.Success;
            case SideSheetStatus.InProgress:
                return BadgeVariant.Info;
            case SideSheetStatus.Failed:
                return BadgeVariant.Error;
            case SideSheetStatus.Pending:
                return BadgeVariant.Pending;
            default:
                return BadgeVariant.Default;
        }
    };

    const renderValue = (item: TabDataItem) => {
        switch (item.dataType) {
            case SideSheetDataType.Number:
                return <span>{Number(item.value)}</span>;
            case 'date':
                return (
                    <span>
                        {getFormattedZaharaDate(
                            new Date(item.value).toLocaleDateString()
                        )}
                    </span>
                );
            case SideSheetDataType.Document:
                return <a href={`${item.value}`}>{item.value}</a>;
            case SideSheetDataType.Status: {
                const statusVariant = getStatusVariant(item.value);
                return (
                    <Badge
                        icon={<Progress width={16} height={16} />}
                        variant={statusVariant}
                        label={item.value}
                        rounded={true}
                        className="flex gap-1 items-center"
                    />
                );
            }
            case SideSheetDataType.Link:
                return (
                    <a
                        href={`${item.value}`}
                        className="text-blue-600 underline"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        {item.label}
                    </a>
                );
            case SideSheetDataType.Button:
                return (
                    <button
                        className="px-3 py-1 bg-blue-600 text-white rounded"
                        onClick={handleButtonClick}
                    >
                        {item.value}
                    </button>
                );
            default:
                return <span>{item.value}</span>;
        }
    };

    const renderSectionData = (data: TabDataItem[], idx: number) => {
        if (!data || data.length === 0) return null;

        return (
            <div className="grid grid-cols-3 gap-x-2 gap-y-1 w-full">
                {data.map((item, idx) => {
                    if (!item.label) return null;

                    return (
                        <React.Fragment key={item.label + idx}>
                            <div className="col-span-1 text-[--color-base-text-text-secondary] text-sm font-normal py-2 whitespace-nowrap ">
                                {item.label}
                            </div>
                            <div className="col-span-2 text-base text-gray-900 break-all text-sm font-normal py-2">
                                {item.value != null && item.value !== ''
                                    ? renderValue(item)
                                    : '--'}
                            </div>
                        </React.Fragment>
                    );
                })}
            </div>
        );
    };

    const displayIsLoading = () => {
        return (
            <div className="flex w-full h-full justify-center items-center">
                <div className="mt-0.5">
                    <InProgressIcon
                        height={18}
                        width={18}
                        role="presentation"
                        className="shrink-0 text-gray-600 transform-origin-center duration-5000 animate-spin ease-linear"
                        aria-hidden={true}
                    />
                </div>
            </div>
        );
    };

    if (isLoading) {
        return displayIsLoading();
    }

    return (
        <div>
            {activeTab && activeTab?.tabName ? (
                <div>
                    <TabGroup
                        defaultValue={activeTab.tabName}
                        value={activeTab.tabName}
                        activationMode="manual"
                        onValueChange={handleTabChange}
                    >
                        <TabList className="!mb-0 w-full md:px-6 lg:px-8">
                            {sideSheetData?.tabs?.map((tab, idx) => (
                                <TabTrigger value={tab.tabName} key={idx}>
                                    {toSentenceCase(tab.tabName)}
                                </TabTrigger>
                            ))}
                        </TabList>
                    </TabGroup>
                    <div className="flex px-8  w-full flex-col items-start pt-10">
                        {activeTab.sections.map((section, sIdx) => (
                            <div key={sIdx}>
                                <div className="font-bold text-lg mb-4">
                                    {section.sectionHeader}
                                </div>
                                {renderSectionData(section.data, sIdx)}
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="flex px-8  w-full flex-col items-start pt-10">
                    {sideSheetData?.data ? (
                        renderSectionData(sideSheetData.data, 0)
                    ) : (
                        <div>No Data</div>
                    )}
                </div>
            )}
        </div>
    );
}
