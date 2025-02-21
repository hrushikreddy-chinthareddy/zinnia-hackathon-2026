import { PiiWrapper } from '../../pii/PiiWrapper';

const formatPhoneNumber = (phoneNumber: string) => {
  const digits = phoneNumber.slice(-4);
  return `*-***-***-${digits}`;
};

export const MfaPhoneNumber = ({ phoneNumber }: { phoneNumber: string }) => {
  return <PiiWrapper>{formatPhoneNumber(phoneNumber)}</PiiWrapper>;
};
