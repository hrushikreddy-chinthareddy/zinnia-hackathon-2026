import { isBpmError } from '@/services/bpm/types';
import { logApiNotOkDetails, parseAPIResponse } from '@/utils/api';
import { EVERLY_CONTACT_PHONE_NUMBER } from '@/utils/data';
import { logError } from '@/utils/logging/server-logging';

export enum TransactionTypes {
  ADDRESS = 'address',
  BANK = 'bank',
  COMMUNICATION_PREFERENCE = 'communication-preference',
}
export enum ActionTypes {
  ADD = 'add',
  EDIT = 'edit',
  REMOVE = 'remove',
}

export const returnSuccessResponse = async (
  rawResponse: Response,
  type: TransactionTypes,
  actionType: ActionTypes
) => {
  const parsedResponse = await parseAPIResponse(rawResponse);
  if (!rawResponse.ok) {
    logError(
      `Error ${actionType}ing ${type}`,
      await logApiNotOkDetails({
        rawResponse,
        parsedResponse: parsedResponse,
      })
    );
    if (isBpmError(parsedResponse)) {
      throw parsedResponse;
    }
    throw rawResponse;
  }

  const messages = generateSuccessMessage(type, actionType);
  return { data: { ...parsedResponse, messages }, error: null };
};

export const returnErrorResponse = (
  e: unknown,
  type: TransactionTypes,
  actionType: ActionTypes
) => {
  if (isBpmError(e)) {
    logError('A BPM error has occurred', e);

    return {
      data: null,
      error: {
        cause: e.status,
        status: e.status === 'failure' ? 400 : 502,
        name: "Sorry, that didn't work",
        message: e.validationResult[0]?.error || '',
      },
    };
  }

  logError('A server error has occurred', e);
  return {
    data: null,
    error: {
      cause: (e as Response)?.statusText,
      status: (e as Response)?.status ?? 502,
      name: "Sorry, that didn't work.",
      message:
        (e as Response)?.status >= 500
          ? `Services are down, so we couldn't ${actionType} your ${type}. Please try again later.`
          : `We couldn't ${actionType} your ${type}. Please try again later.`,
    },
  };
};

const generateActionMessage = (action: ActionTypes) => {
  switch (action) {
    case ActionTypes.ADD: {
      return 'added';
    }
    case ActionTypes.EDIT: {
      return 'updated';
    }
    case ActionTypes.REMOVE: {
      return 'removed';
    }
    default: {
      return '';
    }
  }
};

const generateSuccessMessage = (
  type: TransactionTypes,
  actionType: ActionTypes
) => {
  const phone = `<a href="tel:+${EVERLY_CONTACT_PHONE_NUMBER}">${EVERLY_CONTACT_PHONE_NUMBER}</a>`;
  const action = generateActionMessage(actionType);
  switch (type) {
    case TransactionTypes.ADDRESS: {
      return {
        title: `Thanks!`,
        message: `Address is being ${action}. Address changes may not save immediately. If you need assistance to change an address, call ${phone}.`,
      };
    }
    case TransactionTypes.BANK: {
      return {
        title: `Thanks!`,
        message: `Bank account is being ${action}. Bank account changes may not save immediately. If you need assistance to change a bank account, call ${phone}.`,
      };
    }
    case TransactionTypes.COMMUNICATION_PREFERENCE: {
      return {
        title: `Thanks!`,
        message: `Communication preference is being ${action}. Communication preference changes may not save immediately. If you need assistance to change a communication preference, call ${phone}.`,
      };
    }
    default: {
      return {
        title: `Thanks!`,
        message: '',
      };
    }
  }
};
