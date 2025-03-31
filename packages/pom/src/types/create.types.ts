import { ProducerType } from '.';

// @TODO: these types will be replaced with the actual types from the API once the API is ready
export type CreateProducerResponse =
  | ProducerSuccessResponse
  | ProducerValidationResponse
  | AccessDeniedResponse
  | ServerErrorResponse
  | ResourceNotFoundResponse;

interface ProducerSuccessResponse {
  statusCode: 202;
  timestamp?: string;
  message?: string;
  nationalProducerNumber: string;
  caseId: string;
  correlationId: string;
}

interface ProducerValidationResponse {
  statusCode: 400;
  timestamp?: string;
  message?: string;
  errors?: string[];
  path?: string;
}

interface AccessDeniedResponse {
  statusCode: 403;
  timestamp?: number;
  errorId?: string;
  message: string;
}

interface ServerErrorResponse {
  statusCode: 500;
  timestamp?: number;
  errorId?: string;
  message: string;
}

interface ResourceNotFoundResponse {
  statusCode: 404;
  timestamp?: number;
  errorId?: string;
  message: string;
  error?: string[];
}

export interface CreateProducerRequestBody {
  firstName?: string;
  lastName?: string;
  fullName?: string;
  nationalProducerNumber: number;
  dateOfBirth?: string;
  email: string;
  carrier: string;
  agencyType?: string;
  channel?: string;
  producerType?: ProducerType;
  externalHierarchies?: {
    producerLookupId: string;
    level: string;
    carrierShortName: string;
    effectiveDate: string;
    uplineProducersInformation: {
      lookupId: string;
      level: string;
    }[];
  }[];
}
