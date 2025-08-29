export enum FgaRoles {
  CASE_STATS_DASHBOARD_ENTITY = 'entity:case_stats_dashboard',
  CASE_INSIGHTS_ENTITY = 'entity:case_insights',
  ADVISORS_EXCEL = 'role:advisors_excel_imo_support',
  SUPER_ADMIN = 'role:zinnia_super_admin',
  CASE_MANAGEMENT_ZL_ENTITY = 'entity:zinnia_live_case_management',
  POLICY_MANAGEMENT_ZL_ENTITY = 'entity:zinnia_live_policy_management',
  POLICY_INDEX_ZL_ENTITY = 'entity:zinnia_live_policy_index',
  WELB_SALES_MATERIALS = 'entity:welb_sales_materials',
  CALL_LOG_ACCESS = 'entity:zinnia_live_call_log_audio',
  ILLUSTRATIONS_EXPERIENCE = 'entity:zinnia_live_illustrations_experience',
  USAGE_DASHBOARD_ENTITY = 'entity:zinnia_live_usage_dashboard',
  NOTES_ACCESS = 'entity:zinnia_live_notes',
  CALL_LOGS_ZL = 'entity:zinnia_live_call_logs',
  TEST_HARNESS_ACCESS = 'entity:zinnia_live_test_harness',
  ZINNIA_INTERNAL_VIEWER = 'role:zinnia_internal_viewer',
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

export enum TransactionPermission {
  WritePolicy = 'write_policy',
  WriteAllTransactions = 'write_all_transactions',
  WriteNotificationOfDeathClaim = 'write_notification_of_death_claim',
  // Add future ones here
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
      {
        user,
        relation: FgaRelation.UiAccess,
        object: FgaRoles.WELB_SALES_MATERIALS,
      },
      {
        user,
        relation: FgaRelation.UiAccess,
        object: FgaRoles.CALL_LOG_ACCESS,
      },
      {
        user,
        relation: FgaRelation.UiAccess,
        object: FgaRoles.POLICY_INDEX_ZL_ENTITY,
      },
      {
        user,
        relation: FgaRelation.UiAccess,
        object: FgaRoles.ILLUSTRATIONS_EXPERIENCE,
      },
      {
        user,
        relation: FgaRelation.UiAccess,
        object: FgaRoles.USAGE_DASHBOARD_ENTITY,
      },
      {
        user,
        relation: FgaRelation.UiAccess,
        object: FgaRoles.NOTES_ACCESS,
      },
      {
        user,
        relation: FgaRelation.UiAccess,
        object: FgaRoles.CALL_LOGS_ZL,
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

export function checkIfUserHasPolicyIndexAccess(
  bulkCheckTuples: Array<BulkCheckTuple>
) {
  const roleVals = {
    object: FgaRoles.POLICY_INDEX_ZL_ENTITY,
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

export function checkRelation(
  bulkCheckTuples: Array<BulkCheckTuple>,
  objToCheck: string,
  relationToCheck: string
) {
  return bulkCheckTuples.find(
    (tuple) =>
      tuple.object === objToCheck &&
      tuple.relation === relationToCheck &&
      tuple.allowed
  );
}

export function checkIfUserHasUsageAccess(
  bulkCheckTuples: Array<BulkCheckTuple>
) {
  const roleVals = {
    object: FgaRoles.USAGE_DASHBOARD_ENTITY,
    relation: FgaRelation.UiAccess,
  };

  return bulkCheckTuples.find(
    (tuple) =>
      tuple.object === roleVals.object &&
      tuple.relation === roleVals.relation &&
      tuple.allowed
  );
}
