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
import { default as PomStyles } from '../../styles/pom.module.css';
import { useParams, useSearchParams } from 'react-router';
import EntityInformation from '../entity-information/EntityInformation';
import LicensesAppointments from '../licenses-appointments/LicensesAppointments';
import TrainingEducation from '../training-education/TrainingEducation';
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getProducer } from '../../queries/producers';
import { Error } from '../../components/transaction-response-card/TransactionResponseCard';
import { generateMockProducer } from './__mock';
import {
  ApiGetProducerResponse,
  MockGetProducerResponse,
} from '../../types/get.types';
import { DEFAULT_ERROR_STRING } from '@zinnia/utils';

export const Producer = ({
  producerType,
  isMockProducer,
}: {
  producerType: ProducerType;
  isMockProducer?: boolean;
}) => {
  //@todo: play with react router's search params to set the selected tab in the url
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const isMockFromUrl = searchParams.get('isMock') === 'true';
  const isMock = isMockFromUrl || isMockProducer;

  const { data: queryData, isPending } = useQuery({
    queryKey: ['producer', id],
    queryFn: () => getProducer(id ?? ''),
  });

  if (isPending) {
    return <div>Loading...</div>;
  }

  const data: ApiGetProducerResponse | MockGetProducerResponse | undefined =
    isMock ? generateMockProducer(id ?? '') : queryData;

  // Show error if data is invalid or missing
  const isDataInvalid = !data || !id || data.producerType !== producerType;
  if (isDataInvalid && !isMock) {
    return (
      <div
        className={styles.container}
        id={PomStyles['producer-onboarding-maintenance']}
      >
        <Error message="Error finding producer" />
      </div>
    );
  }

  const tabs = [
    {
      label: 'Entity Information',
      icon: IconType.IDENTIFICATION,
      value: 'personalInfo',
      content: <EntityInformation />,
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
      content: <div>Section 4: waiting for product walkthrough of designs</div>,
    },
  ];

  const cardHeaderTitle =
    data?.producerType === ProducerType.CORPORATION
      ? (data?.fullName ?? DEFAULT_ERROR_STRING)
      : `${data?.firstName ?? DEFAULT_ERROR_STRING} ${data?.lastName ?? DEFAULT_ERROR_STRING}`;

  const cardHeaderIcon =
    data?.producerType === ProducerType.CORPORATION
      ? IconType.OFFICEBUILDING
      : IconType.USER;

  // API spec has nationalProducerNumber possibly nullable
  // which doesn't make sense since we use this field to uniquely identify a producer
  // @TODO: ask product what to do if api returns null for nationalProducerNumber (or any other field for which we need to display a value)
  const cardHeaderSubtext = `National producer number: ${data?.nationalProducerNumber ?? DEFAULT_ERROR_STRING}`;

  return (
    <div
      className={styles.container}
      id={PomStyles['producer-onboarding-maintenance']}
    >
      <div className={clsx(styles.cardContainer)}>
        <CardHeader
          iconType={cardHeaderIcon}
          title={cardHeaderTitle}
          subtext={cardHeaderSubtext}
        />
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
