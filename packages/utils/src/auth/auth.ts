export enum FgaRoles {
  CASE_STATS_DASHBOARD_ENTITY = 'entity:case_stats_dashboard',
  CASE_INSIGHTS_ENTITY = 'entity:case_insights',
  ADVISORS_EXCEL = 'role:advisors_excel_imo_support',
  SUPER_ADMIN = 'role:zinnia_super_admin',
}

export enum FgaRelation {
  Party = 'party',
  UiAccess = 'ui_access',
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
  const user = `party:${partyId}`;
  return {
    tuples: [
      {
        user,
        relation: FgaRelation.Party,
        object: FgaRoles.SUPER_ADMIN,
      },
      {
        user,
        relation: FgaRelation.UiAccess,
        object: FgaRoles.CASE_STATS_DASHBOARD_ENTITY,
      },
      {
        user,
        relation: FgaRelation.UiAccess,
        object: FgaRoles.CASE_INSIGHTS_ENTITY,
      },
      {
        user,
        relation: FgaRelation.Party,
        object: FgaRoles.ADVISORS_EXCEL,
      },
    ],
  };
}

export function checkIfUserIsSuperAdmin(
  bulkCheckTuples: Array<BulkCheckTuple>
) {
  const superAdminVals = {
    object: FgaRoles.SUPER_ADMIN,
    relation: FgaRelation.Party,
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
    relation: FgaRelation.UiAccess,
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
    relation: FgaRelation.UiAccess,
  };

  return bulkCheckTuples.find(
    (tuple) =>
      tuple.object === roleVals.object &&
      tuple.relation === roleVals.relation &&
      tuple.allowed
  );
}

export function checkIfUserHasAdvisorsExcel(
  bulkCheckTuples: Array<BulkCheckTuple>
) {
  const roleVals = {
    object: FgaRoles.ADVISORS_EXCEL,
    relation: FgaRelation.Party,
  };

  return bulkCheckTuples.find(
    (tuple) =>
      tuple.object === roleVals.object &&
      tuple.relation === roleVals.relation &&
      tuple.allowed
  );
}
