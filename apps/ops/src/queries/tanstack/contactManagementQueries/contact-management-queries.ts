import {
    ContactFilterRequest,
    ContactSearchResult,
} from '@zinnia/api-types/types/contact-management';

// ToDo - BPB: Replace with actual API call once it is up and running appropriately
export async function getContactsQuery(
    searchCriteria: ContactFilterRequest
): Promise<ContactSearchResult> {
    console.log(searchCriteria);
    // return await client.post('/api/contact-management/v1/contacts', searchCriteria);
    return {
        data: [
            {
                id: '1',
                partyId: 'f0513562045944faa77400cd2f58dd98', // Mackenzie's partyId to get some data back
                personalInfo: {
                    firstName: 'Mackenzie',
                    lastName: 'Clarkson',
                    dateOfBirth: '2000-01-01',
                    phoneNumber: '555-555-5555',
                    email: 'mackenzie.clarkson@example.com',
                },
                address: {
                    street1: '123 Main St',
                    city: 'Springfield',
                    state: 'IL',
                    zipCode: '62704',
                },
            },
            {
                id: '2',
                partyId: '74fd807d55734e21bec100fe694fd610',
                personalInfo: {
                    firstName: 'Brian',
                    lastName: 'Byers',
                    dateOfBirth: '2000-01-01',
                    phoneNumber: '555-555-5555',
                    email: 'brian.byers@example.com',
                },
            },
        ],
        total: 2,
        offset: 0,
        limit: 10,
    };
}
