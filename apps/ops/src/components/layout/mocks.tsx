import { IconType } from '@zinnia/bloom/components';

import { NavGroup } from '@deps/components/nav/Nav';

export const mockNavGroups: NavGroup[] = [
    {
        items: [
            {
                id: 'home',
                display: 'Home',
                icon: IconType.BANK,
                renderComponent: (
                    <article className="article-class">something</article>
                ),
            },
            { id: 'tasks', display: 'Tasks', icon: IconType.BANK, href: '' },
            { id: 'cases', display: 'Cases', icon: IconType.BANK, href: '' },
        ],
    },
    {
        heading: 'Producers',
        items: [
            { id: 'agents', display: 'Agents', icon: IconType.BANK, href: '' },
        ],
    },
    {
        items: [
            {
                id: 'manageAccess',
                display: 'Manage Access',
                icon: IconType.BANK,
                href: '',
            },
            { id: 'user', display: 'Jane Doe', icon: IconType.BANK, href: '' },
        ],
    },
];
