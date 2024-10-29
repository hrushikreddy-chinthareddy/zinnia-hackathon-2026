import {
  checkIfUserIsSuperAdmin,
  createBulkCheckBodyRequest,
} from './auth';

import {
  bulkCheckPartyId,
  bulkCheckBodyTuples,
  bulkCheckAllowedTuples,
  bulkCheckIncompleteTuples,
  bulkCheckUnallowedTuples,
} from './bulkCheckTuples.mock';

describe('utils/auth.helper', () => {
  describe('createBulkCheckBodyRequest', () => {
    it('should return bulk check body request', () => {
      const result = createBulkCheckBodyRequest(bulkCheckPartyId);
      expect(result).toStrictEqual(bulkCheckBodyTuples);
    });
  });

  describe('checkIfUserIsSuperAdmin', () => {
    it('should return false when response is incomplete', () => {
      const result = checkIfUserIsSuperAdmin(bulkCheckIncompleteTuples);
      expect(result).toBeFalsy();
    });

    it('should return false when response has unallowed tuples', () => {
      const result = checkIfUserIsSuperAdmin(bulkCheckUnallowedTuples);
      expect(result).toBeFalsy();
    });

    it('should return true when response has all required allowed tuples', () => {
      const result = checkIfUserIsSuperAdmin(bulkCheckAllowedTuples);
      expect(result).toBeTruthy();
    });
  });
});
