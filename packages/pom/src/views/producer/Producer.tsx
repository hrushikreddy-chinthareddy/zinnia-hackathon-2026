import {
  Icon,
  IconType,
  TabContent,
  TabGroup,
  TabList,
  TabTrigger,
} from '@zinnia/bloom/components';
import { ProducerType } from '../../types';
import { CardHeader } from '../../components/card-header/CardHeader';
import clsx from 'clsx';
import styles from './Producer.module.css';
import { useParams } from 'react-router';
import EntityInformation from '../entity-information/EntityInformation';
import LicensesAppointments from '../licenses-appointments/LicensesAppointments';
import TrainingEducation from '../training-education/TrainingEducation';
import React from 'react';

export const Producer = ({ producerType }: { producerType: ProducerType }) => {
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
      content: <TrainingEducation />,
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
        className={clsx(styles.cardContainer)}
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
          {tabs.map(
            ({
              value,
              content,
            }: {
              value: string;
              content: React.ReactNode;
            }) => (
              <TabContent
                className={styles.tabContent}
                key={value}
                value={value}
              >
                {content}
              </TabContent>
            )
          )}
        </TabGroup>
      </div>
    </div>
  );
};

export default Producer;