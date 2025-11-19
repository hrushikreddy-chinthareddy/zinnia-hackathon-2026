export type NotificationCenterNotification = {
  id: string;
  title: string;
  date: Date;
  completed: boolean;
  stepsToAcknowledge?: string[];
};

export type NotificationCenterProps = {
  policyNumber: string;
  planCode: string;
};
