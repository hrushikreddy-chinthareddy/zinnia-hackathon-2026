export const bulkCheckPartyId = 'partyId123';
export const bulkCheckBodyTuples = {
  tuples: [
    {
      object: 'entity:zinnia',
      relation: 'read_role',
      user: `party:${bulkCheckPartyId}`,
    },
    {
      object: 'entity:zinnia',
      relation: 'write_role',
      user: `party:${bulkCheckPartyId}`,
    },
    {
      object: 'entity:zinnia',
      relation: 'delete_role',
      user: `party:${bulkCheckPartyId}`,
    },
    {
      object: 'entity:zinnia',
      relation: 'read_user',
      user: `party:${bulkCheckPartyId}`,
    },

    {
      object: 'entity:zinnia',
      relation: 'write_user',
      user: `party:${bulkCheckPartyId}`,
    },
    {
      object: 'entity:zinnia',
      relation: 'delete_user',
      user: `party:${bulkCheckPartyId}`,
    },
  ],
};

export const bulkCheckAllowedTuples = [
  {
    object: 'entity:zinnia',
    relation: 'delete_user',
    user: 'party:f0a832b42465472aa2d4170d23a7d1ea',
    allowed: true,
  },
  {
    object: 'entity:zinnia',
    relation: 'read_user',
    user: 'party:f0a832b42465472aa2d4170d23a7d1ea',
    allowed: true,
  },
  {
    object: 'entity:zinnia',
    relation: 'read_role',
    user: 'party:f0a832b42465472aa2d4170d23a7d1ea',
    allowed: true,
  },
  {
    object: 'entity:zinnia',
    relation: 'write_role',
    user: 'party:f0a832b42465472aa2d4170d23a7d1ea',
    allowed: true,
  },
  {
    object: 'entity:zinnia',
    relation: 'delete_role',
    user: 'party:f0a832b42465472aa2d4170d23a7d1ea',
    allowed: true,
  },
  {
    object: 'entity:zinnia',
    relation: 'write_user',
    user: 'party:f0a832b42465472aa2d4170d23a7d1ea',
    allowed: true,
  },
];

export const bulkCheckUnallowedTuples = [
  {
    object: 'entity:zinnia',
    relation: 'delete_user',
    user: 'party:f0a832b42465472aa2d4170d23a7d1ea',
    allowed: false,
  },
  {
    object: 'entity:zinnia',
    relation: 'read_user',
    user: 'party:f0a832b42465472aa2d4170d23a7d1ea',
    allowed: false,
  },
  {
    object: 'entity:zinnia',
    relation: 'read_role',
    user: 'party:f0a832b42465472aa2d4170d23a7d1ea',
    allowed: false,
  },
  {
    object: 'entity:zinnia',
    relation: 'write_role',
    user: 'party:f0a832b42465472aa2d4170d23a7d1ea',
    allowed: false,
  },
  {
    object: 'entity:zinnia',
    relation: 'delete_role',
    user: 'party:f0a832b42465472aa2d4170d23a7d1ea',
    allowed: false,
  },
  {
    object: 'entity:zinnia',
    relation: 'write_user',
    user: 'party:f0a832b42465472aa2d4170d23a7d1ea',
    allowed: false,
  },
];

export const bulkCheckIncompleteTuples = [
  {
    object: 'entity:zinnia',
    relation: 'delete_user',
    user: 'party:f0a832b42465472aa2d4170d23a7d1ea',
    allowed: true,
  },
  {
    object: 'entity:zinnia',
    relation: 'read_user',
    user: 'party:f0a832b42465472aa2d4170d23a7d1ea',
    allowed: true,
  },
  {
    object: 'entity:zinnia',
    relation: 'read_role',
    user: 'party:f0a832b42465472aa2d4170d23a7d1ea',
    allowed: true,
  },
  {
    object: 'entity:zinnia',
    relation: 'write_role',
    user: 'party:f0a832b42465472aa2d4170d23a7d1ea',
    allowed: true,
  },
  {
    object: 'entity:zinnia',
    relation: 'delete_role',
    user: 'party:f0a832b42465472aa2d4170d23a7d1ea',
    allowed: true,
  },
];
