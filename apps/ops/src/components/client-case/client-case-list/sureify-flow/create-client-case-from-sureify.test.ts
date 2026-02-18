import { omit } from 'lodash';

import { UnderwritingClass } from '@deps/components/illustrations/helpers/illustrationApiSchemas';
import {
    createClientCase,
    patchClientCase,
    searchClientCaseByEappId,
} from '@deps/queries/api/server/v1/client-cases';
import { getNewBusinessById } from '@deps/queries/api/server/v2/new-business';
import {
    IllustrationInsuredDetails,
    IllustrationsClientCase,
    TransactionType,
} from '@deps/types/illustrations';
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
const patchClientCaseMock = jest.mocked(patchClientCase);

const loggingContext = {} as LoggingContext;

describe('createClientCaseFromSureify', () => {
    it('updates and redirects if a client case exists and feature flag is enabled', async () => {
        const newBusinessObject = {
            caseId: 'caseId',
        } as NewBusiness;

        searchClientCaseByEappIdMock.mockResolvedValue([
            { id: 'client-case-id' },
        ] as IllustrationsClientCase[]);
        getNewBusinessByIdMock.mockResolvedValue(newBusinessObject);
        buildClientCaseFromNewBusinessMock.mockResolvedValue({
            title: 'Untitled Client Case',
        });
        patchClientCaseMock.mockResolvedValue({
            id: 'client-case-id',
        } as IllustrationsClientCase);

        const { props, redirect } = await createClientCaseFromSureify(
            'eappid',
            'accessToken',
            loggingContext,
            true // upsertIfExists
        );

        expect(searchClientCaseByEappIdMock).toHaveBeenCalledWith(
            'eappid',
            'accessToken',
            expect.anything()
        );

        expect(getNewBusinessByIdMock).toHaveBeenCalledWith(
            'eappid',
            expect.anything()
        );
        expect(buildClientCaseFromNewBusinessMock).toHaveBeenCalledWith(
            newBusinessObject,
            'eappid',
            expect.anything()
        );

        expect(patchClientCaseMock).toHaveBeenCalledWith(
            expect.objectContaining({ id: 'client-case-id' }),
            'accessToken',
            expect.anything()
        );

        expect(props).toBeUndefined();
        expect(redirect).toEqual({
            destination:
                '/illustrations/client-cases/client-case-id/illustrate',
            permanent: false,
        });
    });

    it('opens the creation sideSheet if the insured sexAtBirth is not available (not a conversion)', async () => {
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
            loggingContext,
            false // upsertIfExists
        );

        expect(getNewBusinessByIdMock).toHaveBeenCalledWith(
            'eappid',
            expect.anything()
        );
        expect(buildClientCaseFromNewBusinessMock).toHaveBeenCalledWith(
            newBusinessObject,
            'eappid',
            expect.anything()
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

    const validConversionInsuredDetails: IllustrationInsuredDetails = {
        firstName: 'John',
        lastName: 'Doe',
        sexAtBirth: 'Male',
        underwritingClass: UnderwritingClass.PREFERREDTOBACCO,
        state: 'CA',
        dateOfBirth: new Date('1980-06-10T00:00:00.000Z'),
    };

    it('works when all required fields are present (conversion)', async () => {
        const newBusinessObject = {
            caseId: 'caseId',
        } as NewBusiness;
        const createclientCasePayload = {
            insuredDetails: validConversionInsuredDetails,
            originalFaceAmount: 50000,
            transactionType: 'CONVERSION' as TransactionType,
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
            loggingContext,
            false // upsertIfExists
        );

        expect(createClientCaseMock).toHaveBeenCalledWith(
            createclientCasePayload,
            'accessToken',
            expect.anything()
        );

        expect(props).toBeUndefined();
        expect(redirect).toEqual({
            destination:
                '/illustrations/client-cases/new-client-case-id/illustrate',
            permanent: false,
        });
    });

    it.each(['sexAtBirth', 'underwritingClass', 'state', 'dateOfBirth'])(
        'fails when "%s" insured details field is missing (conversion)',
        async (fieldName) => {
            const newBusinessObject = {
                caseId: 'caseId',
            } as NewBusiness;

            searchClientCaseByEappIdMock.mockResolvedValue(
                [] as IllustrationsClientCase[]
            );
            buildClientCaseFromNewBusinessMock.mockResolvedValue({
                insuredDetails: omit(validConversionInsuredDetails, [
                    fieldName,
                ]),
                originalFaceAmount: 50000,
                transactionType: 'CONVERSION' as TransactionType,
            });

            getNewBusinessByIdMock.mockResolvedValue(newBusinessObject);

            const { props, redirect } = await createClientCaseFromSureify(
                'eappid',
                'accessToken',
                loggingContext,
                false // upsertIfExists
            );

            expect(getNewBusinessByIdMock).toHaveBeenCalledWith(
                'eappid',
                expect.anything()
            );
            expect(buildClientCaseFromNewBusinessMock).toHaveBeenCalledWith(
                newBusinessObject,
                'eappid',
                expect.anything()
            );

            expect(redirect).toBeUndefined();
            expect(props?.fetchingErrorOrigin).not.toBeUndefined();
            expect(props?.fetchingErrorMessage).toMatch(
                /\bmissing insured required fields\b/
            );
        }
    );

    it('fails when originalFaceAmount field is missing (conversion)', async () => {
        const newBusinessObject = {
            caseId: 'caseId',
        } as NewBusiness;

        searchClientCaseByEappIdMock.mockResolvedValue(
            [] as IllustrationsClientCase[]
        );
        buildClientCaseFromNewBusinessMock.mockResolvedValue({
            insuredDetails: validConversionInsuredDetails,
            transactionType: 'CONVERSION' as TransactionType,
        });

        getNewBusinessByIdMock.mockResolvedValue(newBusinessObject);

        const { props, redirect } = await createClientCaseFromSureify(
            'eappid',
            'accessToken',
            loggingContext,
            false // upsertIfExists
        );

        expect(getNewBusinessByIdMock).toHaveBeenCalledWith(
            'eappid',
            expect.anything()
        );
        expect(buildClientCaseFromNewBusinessMock).toHaveBeenCalledWith(
            newBusinessObject,
            'eappid',
            expect.anything()
        );

        expect(redirect).toBeUndefined();
        expect(props?.fetchingErrorOrigin).not.toBeUndefined();
        expect(props?.fetchingErrorMessage).toMatch(/\bface amount\b/);
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
            loggingContext,
            false // upsertIfExists
        );

        expect(createClientCaseMock).toHaveBeenCalledWith(
            createclientCasePayload,
            'accessToken',
            expect.anything()
        );
        expect(props).toBeUndefined();
        expect(redirect).toEqual({
            destination:
                '/illustrations/client-cases/new-client-case-id/illustrate',
            permanent: false,
        });
    });
});
