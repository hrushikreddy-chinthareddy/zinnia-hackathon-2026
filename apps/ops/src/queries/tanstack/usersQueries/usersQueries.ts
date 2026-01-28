import { searchUsersInGroupCSR } from '@deps/queries/api/server/fga/searchUsers';

export type SearchUsersQuery = {
    carrier: string;
    queue: string;
    access: string;
};

export const SearchUsersQuery = async (payload: SearchUsersQuery) => {
    if (!payload) {
        throw 'SearchUsersQuery::No payload provided';
    }
    const result = await searchUsersInGroupCSR(payload);
    if (!result) {
        throw 'SearchUsersQuery::No data in response';
    } else {
        return result;
    }
};
