import { AgentAddress, AgentData, AgentEmail, AgentPhone } from '@/types/agent';

const mCSNormalizePhone = ({ number, ...rest }: AgentPhone) => {
  return { dialNumber: number, ...rest };
};

const mCSNormalizeEmail = ({ email, ...rest }: AgentEmail) => {
  return { emailAddress: email, ...rest };
};

/**
 * This is very specifically for MCS agent data because there are multiple modifications
 * we have to make to normalize the data, return only business emails of the agent
 * there are no endDates like there are in SOR, standardize property return names to be
 * used in our UI components
 */
export const transformMcsAgentData = (data: AgentData) => {
  if (!data) {
    return null;
  }

  const currentBusinessAddresses = data.addresses?.filter(
    (address: AgentAddress) => address.addressType === 'Business'
  );

  const currentBusinesPhones = data.phones?.filter(
    (phone: AgentPhone) => phone.phoneType === 'BUSINESS'
  );

  const currentBusinessEmails = data.emails?.filter(
    (email: AgentEmail) => email.emailType === 'BUSINESS'
  );

  return {
    fullName: data.individuals?.[0]?.fullName || '',
    phones: currentBusinesPhones.map(mCSNormalizePhone),
    emails: currentBusinessEmails.map(mCSNormalizeEmail),
    addresses: currentBusinessAddresses,
  };
};
