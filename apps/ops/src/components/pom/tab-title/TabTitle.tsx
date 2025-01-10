import { Icon, TabTrigger, IconType } from '@zinnia/bloom/components';

export const TabTitle = ({ value, icon, label }: { value: string; icon: IconType; label: string }) => {
    return (
        <TabTrigger value={value}>
            <Icon type={icon} />
            {label}
        </TabTrigger>
    );
};
