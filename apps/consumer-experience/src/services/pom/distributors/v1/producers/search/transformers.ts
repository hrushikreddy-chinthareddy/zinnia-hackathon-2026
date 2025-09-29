import { POM_Producer_Models_SearchProducersResult } from '@zinnia/api-types/types/pom';

export type FilteredPomAgentData = Pick<
  POM_Producer_Models_SearchProducersResult,
  | 'firstName'
  | 'lastName'
  | 'email'
  | 'businessPhone'
  | 'businessAddress'
  | 'producerType'
  | 'producerName'
>;

/**
 *
 * Filter out the pom data to return on the things the UI needs.
 */
export const formatPomAgentData = (
  agentResponse: POM_Producer_Models_SearchProducersResult | undefined
): FilteredPomAgentData | undefined => {
  if (!agentResponse) {
    return agentResponse;
  }

  return {
    firstName: agentResponse.firstName,
    lastName: agentResponse.lastName,
    email: agentResponse.email,
    businessPhone: agentResponse.businessPhone,
    businessAddress: agentResponse.businessAddress,
    producerType: agentResponse.producerType,
    producerName: agentResponse.producerName,
  };
};
