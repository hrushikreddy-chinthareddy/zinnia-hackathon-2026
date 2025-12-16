export type TabDataItem = {
    label: string;
    value: any;
    dataType?: string;
    taskId?: string;
};
export type Section = {
    sectionHeader: string;
    data: TabDataItem[];
};
export type Tab = {
    tabName: string;
    sections: Section[];
};
export type DynamicSideSheetDataType = {
    title: string;
    tabs?: Tab[];
    data?: TabDataItem[];
};
