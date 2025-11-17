import { ActionTypes, BpmAction, PropertyKeys } from '@/store/store';
import { PolicyProfile } from '@/types/policy';

import { refetchHandler, shouldStopPolling } from './transactions';

const POLL_LIMIT = 5;
const POLL_INTERVAL = 1000;
jest.mock('./transactions', () => ({
  ...jest.requireActual('./transactions'),
}));

describe('refetchHandler', () => {
  let policyProfile: PolicyProfile;
  let pollCount: { current: number };
  let logHandler: jest.Mock;
  let finishedHandler: jest.Mock;
  let bpmAction: BpmAction;

  beforeEach(() => {
    policyProfile = {
      partyId: '123',
      bankDetails: [
        {
          accountNumber: '123',
          routingNumber: 'value1',
          autopayEnabled: false,
        },
        {
          accountNumber: '456',
          routingNumber: 'value2',
          autopayEnabled: false,
        },
      ],
      addresses: [
        { addressId: 'abc', addressLine1: '123 Main St', isPreferred: true },
        { addressId: 'def', addressLine2: '456 Elm St' },
      ],
      phones: [],
      name: {
        firstName: 'Joe',
        lastName: 'Schmo',
      },
      emails: [],
      parties: [],
    };

    pollCount = { current: 0 };
    logHandler = jest.fn();
    finishedHandler = jest.fn();
    bpmAction = {
      actionType: ActionTypes.ADD,
      itemValue: '123',
      itemKey: 'accountNumber',
      propertyKey: PropertyKeys.BANK_DETAILS,
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return false if bpmAction propertyKey does not match', () => {
    bpmAction.propertyKey = PropertyKeys.ADDRESSES;
    const result = refetchHandler({
      data: policyProfile.bankDetails,
      bpmAction,
      propertyKey: PropertyKeys.BANK_DETAILS,
      pollCount,
      logHandler,
      finishedHandler,
    });
    expect(result).toBe(false);
  });

  it('should return false and call finishedHandler if shouldStopPolling returns true', () => {
    const result = refetchHandler({
      data: policyProfile.bankDetails,
      bpmAction,
      propertyKey: PropertyKeys.BANK_DETAILS,
      pollCount,
      logHandler,
      finishedHandler,
    });
    expect(result).toBe(false);
    expect(finishedHandler).toHaveBeenCalled();
    expect(pollCount.current).toBe(0);
  });

  it('should return false and call logHandler and finishedHandler if pollCount reaches limit and shouldStopPolling returns false', () => {
    pollCount.current = POLL_LIMIT;

    //Fake the action for an accountNumber of 789 that does not exist in bankDetails
    const action = {
      ...bpmAction,
      itemValue: '789',
      itemKey: 'accountNumber',
    };
    const result = refetchHandler({
      data: policyProfile.bankDetails,
      bpmAction: action,
      propertyKey: PropertyKeys.BANK_DETAILS,
      pollCount,
      logHandler,
      finishedHandler,
    });
    expect(result).toBe(false);
    expect(logHandler).toHaveBeenCalled();
    expect(finishedHandler).toHaveBeenCalled();
    expect(pollCount.current).toBe(0);
  });

  it('should increment pollCount and return POLL_INTERVAL if shouldStopPolling returns false and pollCount is below limit', () => {
    //Fake the action for an accountNumber of 789 that does not exist in bankDetails
    const action = {
      ...bpmAction,
      itemValue: '789',
      itemKey: 'accountNumber',
    };
    const result = refetchHandler({
      data: policyProfile.bankDetails,
      bpmAction: action,
      propertyKey: PropertyKeys.BANK_DETAILS,
      pollCount,
      logHandler,
      finishedHandler,
    });
    expect(result).toBe(POLL_INTERVAL);
    expect(pollCount.current).toBe(1);
    expect(logHandler).not.toHaveBeenCalled();
    expect(finishedHandler).not.toHaveBeenCalled();
  });
});

describe('shouldStopPolling', () => {
  let policyProfile: PolicyProfile;
  let bpmAction: BpmAction;

  beforeEach(() => {
    policyProfile = {
      partyId: '123',
      bankDetails: [
        {
          accountNumber: '123',
          routingNumber: 'value1',
          autopayEnabled: false,
        },
        {
          accountNumber: '456',
          routingNumber: 'value2',
          autopayEnabled: false,
        },
      ],
      addresses: [
        { addressId: 'abc', addressLine1: '123 Main St', isPreferred: true },
        { addressId: 'def', addressLine2: '456 Elm St' },
      ],
      phones: [],
      name: {
        firstName: 'Joe',
        lastName: 'Schmo',
      },
      emails: [],
      parties: [],
    };

    bpmAction = {
      actionType: ActionTypes.ADD,
      itemValue: '123',
      itemKey: 'accountNumber',
      propertyKey: PropertyKeys.BANK_DETAILS,
    };
  });

  it('should return true if bpmAction is null', () => {
    expect(shouldStopPolling(policyProfile.bankDetails, null)).toBe(true);
  });

  describe('ADD action', () => {
    it('should return true if itemId is found in data', () => {
      bpmAction.actionType = ActionTypes.ADD;
      expect(shouldStopPolling(policyProfile.bankDetails, bpmAction)).toBe(
        true
      );
    });

    it('should return false if itemId is not found in data', () => {
      bpmAction.actionType = ActionTypes.ADD;
      bpmAction.itemValue = '999';
      expect(shouldStopPolling(policyProfile.bankDetails, bpmAction)).toBe(
        false
      );
    });
  });

  describe('EDIT action', () => {
    it('should return true if all changes are found in data', () => {
      bpmAction.actionType = ActionTypes.EDIT;
      bpmAction.changes = [{ fieldName: 'routingNumber', value: 'value1' }];
      expect(shouldStopPolling(policyProfile.bankDetails, bpmAction)).toBe(
        true
      );
    });

    it('should return false if any change is not found in data', () => {
      bpmAction.actionType = ActionTypes.EDIT;
      bpmAction.changes = [
        { fieldName: 'routingNumber', value: 'nonExistentValue' },
      ];
      expect(shouldStopPolling(policyProfile.bankDetails, bpmAction)).toBe(
        false
      );
    });
  });

  describe('REMOVE action', () => {
    it('should return true if itemId is not found in data', () => {
      bpmAction.actionType = ActionTypes.REMOVE;
      bpmAction.itemValue = '999';
      expect(shouldStopPolling(policyProfile.bankDetails, bpmAction)).toBe(
        true
      );
    });

    it('should return false if itemId is found in data', () => {
      bpmAction.actionType = ActionTypes.REMOVE;
      expect(shouldStopPolling(policyProfile.bankDetails, bpmAction)).toBe(
        false
      );
    });
  });
});
