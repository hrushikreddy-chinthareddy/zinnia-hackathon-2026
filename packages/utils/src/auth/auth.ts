export enum FgaRoles {
  CASE_STATS_DASHBOARD_ENTITY = 'entity:case_stats_dashboard',
  CASE_INSIGHTS_ENTITY = 'entity:case_insights',
}

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
        relation: 'ui_access',
        object: FgaRoles.CASE_STATS_DASHBOARD_ENTITY,
      },
      {
        user: `party:${partyId}`,
        relation: 'ui_access',
        object: FgaRoles.CASE_INSIGHTS_ENTITY,
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
  const roleVals = {
    object: FgaRoles.CASE_STATS_DASHBOARD_ENTITY,
    relation: 'ui_access',
  };

  return bulkCheckTuples.find(
    (tuple) =>
      tuple.object === roleVals.object &&
      tuple.relation === roleVals.relation &&
      tuple.allowed
  );
}

export function checkIfUserHasCaseInsightsAccess(
  bulkCheckTuples: Array<BulkCheckTuple>
) {
  const roleVals = {
    object: FgaRoles.CASE_INSIGHTS_ENTITY,
    relation: 'ui_access',
  };

  return bulkCheckTuples.find(
    (tuple) =>
      tuple.object === roleVals.object &&
      tuple.relation === roleVals.relation &&
      tuple.allowed
  );
}
