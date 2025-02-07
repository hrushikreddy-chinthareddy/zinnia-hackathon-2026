import {
  Icon,
  IconType,
  TabContent,
  TabGroup,
  TabList,
  TabTrigger,
} from '@zinnia/bloom/components';
import { ProducerType } from './types/types';
import { CardHeader } from './components/card-header/CardHeader';
import clsx from 'clsx';
import styles from './Pom.module.css';
import { HashRouter, Route, Routes, useParams } from 'react-router';
import './styles/globals.css';
import EntityInformation from './views/entity-information/EntityInformation';
import LicensesAppointments from './views/licenses-appointments/LicensesAppointments';

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
      content: <EntityInformation producerType={producerType} />,
    },
    {
      label: 'Licenses and Appointments',
      icon: IconType.CALENDAR,
      value: 'licenses',
      content: <LicensesAppointments />,
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
    <div className={styles.container}>
      <div
        className={clsx(styles.cardContainer, 'typography-content-body-sm')}
        id="producer-onboarding-maintenance"
      >
        {/* @todo: will remove this once we have the api integration */}
        <CardHeader producerType={producerType} id={id} />
        <TabGroup defaultValue={tabs[0].value}>
          <TabList className={styles.tabList}>
            {tabs.map(({ label, icon, value }) => (
              <TabTrigger value={value} className={clsx(styles.tabTitle)}>
                <div>
                  <Icon type={icon} />
                </div>
                <span style={{ whiteSpace: 'nowrap' }}>{label}</span>
              </TabTrigger>
            ))}
          </TabList>
          {/* TODO: why is this letting us push to the repo, shouldn't linting catch this? */}
          {/* TODO: fix this type */}
          {tabs.map(({ value, content }: { value: string; content: any }) => (
            <TabContent key={value} value={value}>
              {content}
            </TabContent>
          ))}
        </TabGroup>
      </div>
    </div>
  );
};
