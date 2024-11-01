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
