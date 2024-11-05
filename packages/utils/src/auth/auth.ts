export const CASE_STATS_DASHBOARD_ROLE = 'role:zinnia_read_stats_dashboard';

export interface FGA_Tuple {
  user: string;
  relation: string;
  object: string;
}

export interface BulkCheckTuple extends FGA_Tuple {
  allowed: boolean;
}
export function createBulkCheckBodyRequest(partyId: string) {
  return {
    tuples: [
      {
        user: `party:${partyId}`,
        relation: 'party',
        object: 'role:zinnia_super_admin',
      },
      {
        user: `party:${partyId}`,
        relation: 'party',
        object: CASE_STATS_DASHBOARD_ROLE,
      },
    ],
  };
}

export function checkIfUserIsSuperAdmin(
  bulkCheckTuples: Array<BulkCheckTuple>
) {
  const superAdminVals = {
    object: 'role:zinnia_super_admin',
    relation: 'party',
  };

  return bulkCheckTuples.find(
    (tuple) =>
      tuple.object === superAdminVals.object &&
      tuple.relation === superAdminVals.relation &&
      tuple.allowed
  );
}

export function checkIfUserHasDashboardAccess(
  bulkCheckTuples: Array<BulkCheckTuple>
) {
  const superAdminVals = {
    object: 'role:zinnia_read_stats_dashboard',
    relation: 'party',
  };

  return bulkCheckTuples.find(
    (tuple) =>
      tuple.object === superAdminVals.object &&
      tuple.relation === superAdminVals.relation &&
      tuple.allowed
  );
}
