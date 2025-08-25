import {
    createClientCase,
    searchClientCaseByEappId,
} from '@deps/queries/api/server/v1/client-cases';
import { getNewBusinessById } from '@deps/queries/api/server/v2/new-business';
import { IllustrationsClientCase } from '@deps/types/illustrations';
import { NewBusiness } from '@deps/types/new-business';
import { LoggingContext } from '@deps/utils/server-logging';

import { buildClientCaseFromNewBusiness } from './build-client-case-from-new-business';
import { createClientCaseFromSureify } from './create-client-case-from-sureify';

jest.mock('@deps/queries/api/server/v1/client-cases');
jest.mock('@deps/queries/api/server/v2/new-business');
jest.mock('./build-client-case-from-new-business');

const searchClientCaseByEappIdMock = jest.mocked(searchClientCaseByEappId);
const getNewBusinessByIdMock = jest.mocked(getNewBusinessById);
const buildClientCaseFromNewBusinessMock = jest.mocked(
    buildClientCaseFromNewBusiness
);
const createClientCaseMock = jest.mocked(createClientCase);

const loggingContext = {} as LoggingContext;

describe('createClientCaseFromSureify', () => {
    it('redirects if a client case exists', async () => {
        searchClientCaseByEappIdMock.mockResolvedValue([
            { id: 'client-case-id' },
        ] as IllustrationsClientCase[]);

        const { props, redirect } = await createClientCaseFromSureify(
            'eappid',
            'accessToken',
            loggingContext
        );

        expect(searchClientCaseByEappIdMock).toHaveBeenCalledWith(
            'eappid',
            'accessToken',
            loggingContext
        );

        expect(props).toBeUndefined();
        expect(redirect).toEqual({
            destination:
                '/illustrations/client-cases/client-case-id/illustrate',
            permanent: false,
        });
    });

    it('opens the creation sideSheet if the insured sexAtBirth is not available', async () => {
        const newBusinessObject = {
            caseId: 'caseId',
        } as NewBusiness;

        searchClientCaseByEappIdMock.mockResolvedValue(
            [] as IllustrationsClientCase[]
        );
        buildClientCaseFromNewBusinessMock.mockResolvedValue({
            insuredDetails: {
                firstName: 'John',
                lastName: 'Doe',
                sexAtBirth: '',
            },
        });

        getNewBusinessByIdMock.mockResolvedValue(newBusinessObject);

        const { props, redirect } = await createClientCaseFromSureify(
            'eappid',
            'accessToken',
            loggingContext
        );

        expect(getNewBusinessByIdMock).toHaveBeenCalledWith(
            'eappid',
            loggingContext
        );
        expect(buildClientCaseFromNewBusinessMock).toHaveBeenCalledWith(
            newBusinessObject,
            'eappid',
            loggingContext
        );

        expect(redirect).toBeUndefined();
        expect(props).toEqual({
            clientCase: {
                insuredDetails: {
                    firstName: 'John',
                    lastName: 'Doe',
                    sexAtBirth: 'MALE',
                },
            },
        });
    });

    it('redirects to the new client case page after creation', async () => {
        const newBusinessObject = {
            caseId: 'caseId',
        } as NewBusiness;
        const createclientCasePayload = {
            insuredDetails: {
                firstName: 'Jane',
                lastName: 'Doe',
                sexAtBirth: 'FEMALE',
            },
        };

        searchClientCaseByEappIdMock.mockResolvedValue(
            [] as IllustrationsClientCase[]
        );
        buildClientCaseFromNewBusinessMock.mockResolvedValue(
            createclientCasePayload
        );

        getNewBusinessByIdMock.mockResolvedValue(newBusinessObject);
        createClientCaseMock.mockResolvedValue({
            id: 'new-client-case-id',
        });

        const { props, redirect } = await createClientCaseFromSureify(
            'eappid',
            'accessToken',
            loggingContext
        );

        expect(createClientCaseMock).toHaveBeenCalledWith(
            createclientCasePayload,
            'accessToken',
            loggingContext
        );
        expect(props).toBeUndefined();
        expect(redirect).toEqual({
            destination:
                '/illustrations/client-cases/new-client-case-id/illustrate',
            permanent: false,
        });
    });
});
