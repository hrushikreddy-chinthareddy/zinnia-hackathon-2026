import { POM_Producer_Models_SearchProducersResult } from '@zinnia/api-types/types/pom';

type FilterdPomAgentData = Pick<
  POM_Producer_Models_SearchProducersResult,
  'firstName' | 'lastName' | 'email' | 'businessPhone' | 'businessAddress'
>;

/**
 *
 * Filter out the pom data to return on the things the UI needs.
 */
export const formatPomAgentData = (
  agentResponse: POM_Producer_Models_SearchProducersResult | undefined
): FilterdPomAgentData | undefined => {
  if (!agentResponse) {
    return agentResponse;
  }

  return {
    firstName: agentResponse.firstName,
    lastName: agentResponse.lastName,
    email: agentResponse.email,
    businessPhone: agentResponse.businessPhone,
    businessAddress: agentResponse.businessAddress,
  };
};
