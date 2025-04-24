import { IconType } from '@zinnia/bloom/components';
import { NavGroup } from '../components/Nav/Nav.js';

export const mockNavGroups: NavGroup[] = [
  {
    items: [
      {
        id: 'home',
        display: 'Home',
        icon: IconType.BANK,
        renderComponent: <article className="article-class">something</article>,
      },
      { id: 'tasks', display: 'Tasks', icon: IconType.BANK },
      { id: 'cases', display: 'Cases', icon: IconType.BANK },
    ],
  },
  {
    heading: 'Producers',
    items: [{ id: 'agents', display: 'Agents', icon: IconType.BANK }],
  },
  {
    items: [
      { id: 'manageAccess', display: 'Manage Access', icon: IconType.BANK },
      { id: 'user', display: 'Jane Doe', icon: IconType.BANK },
    ],
    alignEnd: true,
  },
];
