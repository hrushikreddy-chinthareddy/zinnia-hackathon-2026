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
        relation: 'read_role',
        object: 'entity:zinnia',
      },
      {
        user: `party:${partyId}`,
        relation: 'write_role',
        object: 'entity:zinnia',
      },
      {
        user: `party:${partyId}`,
        relation: 'delete_role',
        object: 'entity:zinnia',
      },
      {
        user: `party:${partyId}`,
        relation: 'read_user',
        object: 'entity:zinnia',
      },
      {
        user: `party:${partyId}`,
        relation: 'write_user',
        object: 'entity:zinnia',
      },
      {
        user: `party:${partyId}`,
        relation: 'delete_user',
        object: 'entity:zinnia',
      },
    ],
  };
}

export function checkIfUserIsSuperAdmin(bulkCheckTuples: Array<BulkCheckTuple>) {
  const requiredTuples = [
    {
      object: 'entity:zinnia',
      relation: 'delete_user',
    },
    {
      object: 'entity:zinnia',
      relation: 'read_user',
    },
    {
      object: 'entity:zinnia',
      relation: 'read_role',
    },
    {
      object: 'entity:zinnia',
      relation: 'write_role',
    },
    {
      object: 'entity:zinnia',
      relation: 'delete_role',
    },
    {
      object: 'entity:zinnia',
      relation: 'write_user',
    },
  ];

  for (const requiredTuple of requiredTuples) {
    if (
      !bulkCheckTuples.some(
        bulkCheckTuple =>
          requiredTuple.object === bulkCheckTuple.object &&
          requiredTuple.relation === bulkCheckTuple.relation &&
          bulkCheckTuple.allowed === true
      )
    ) {
      return false;
    }
  }

  return true;
}
