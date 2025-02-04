import {
  IconType,
  TabContent,
  TabGroup,
  TabList,
} from '@zinnia/bloom/components';
import { ProducerType } from './types';
import { TabTitle } from './tab-title/TabTitle';
import { CardHeader } from './card-header/CardHeader';
import clsx from 'clsx';
import { default as styles } from './Pom.module.css';
import { HashRouter, Route, Routes, useParams } from 'react-router';
import PersonalInfo from './personal-info/PersonalInfo';

export const Pom = ({
  translations,
}: {
  translations?: (key: string) => string;
}) => {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<div>{translations?.('pomTitle')}</div>} />
        <Route path="/agents">
          <Route
            path=":id"
            element={<Producer producerType={ProducerType.INDIVIDUAL} />}
          />
        </Route>

        <Route path="/agencies">
          <Route
            path=":id"
            element={<Producer producerType={ProducerType.CORPORATION} />}
          />
        </Route>
      </Routes>
    </HashRouter>
  );
};

const Producer = ({ producerType }: { producerType: ProducerType }) => {
  //@todo: play with react router's search params to set the selected tab in the url
  const { id } = useParams();

  const tabs = [
    {
      label: 'Entity Information',
      icon: IconType.IDENTIFICATION,
      value: 'personalInfo',
      content: <PersonalInfo producerType={producerType} />,
    },
    {
      label: 'Licenses and Appointments',
      icon: IconType.CALENDAR,
      value: 'licenses',
      content: <div>Section 2</div>,
    },
    {
      label: 'Training and Education',
      icon: IconType.BOOKMARK_ALT,
      value: 'training',
      content: <div>Section 3</div>,
    },
    {
      label: 'Hierarchies',
      icon: IconType.COLLECTION,
      value: 'hierarchies',
      content: <div>Section 4</div>,
    },
  ];

  return (
    <div className={clsx(styles.cardContainer)}>
      {/* @todo: will remove this once we have the api integration */}
      <CardHeader producerType={producerType} id={id} />
      <TabGroup defaultValue={tabs[0].value}>
        <TabList className={clsx(styles.tabList)}>
          {tabs.map(({ label, icon, value }) => (
            <TabTitle key={value} value={value} icon={icon} label={label} />
          ))}
        </TabList>
        {tabs.map(({ value, content }: { value: string; content: any }) => (
          <TabContent key={value} value={value}>
            {content}
          </TabContent>
        ))}
      </TabGroup>
    </div>
  );
};
