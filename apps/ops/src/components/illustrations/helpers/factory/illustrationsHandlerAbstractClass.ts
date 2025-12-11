import { QuestionnaireBlueprint } from '@zinnia/form-engine-sdk';
import dayjs from 'dayjs';
import { Result } from 'typegate';

import { calculateAgeNumber } from '@deps/helpers/age.helpers';
import { ZAHARA_DATE_FORMAT } from '@deps/helpers/date.helpers';
import { calculateAge } from '@deps/helpers/string.helpers';
import {
    IllustrationsClientCase,
    TransactionType,
} from '@deps/types/illustrations';
import { ProductTypes } from '@deps/types/product';

import {
    CreateIllustrationPayload,
    CreateIllustrationPayloadParsingError,
    UnderwritingClass,
} from '../illustrationApiSchemas';

export class OutputDataParsingError extends Error {
    readonly _tag = 'OutputDataParsingError';
}

// Shared interface for all client cases
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export abstract class IllustrationHandler<TOutputEntities> {
    protected clientCase: IllustrationsClientCase;

    constructor(clientCase: IllustrationsClientCase) {
        this.clientCase = clientCase;
    }

    abstract createIllustrationPayloadFromAnswerOutput(
        answerOutputData: unknown
    ): Result<
        OutputDataParsingError | CreateIllustrationPayloadParsingError,
        CreateIllustrationPayload
    >;

    // abstract mapIllustrationPayloadToEngineInputData(data: CreateIllustrationPayload): TOutputEntities;

    abstract getIllustrationDataFromResponse(data: any, formInputs: any): any;

    abstract getBlueprint(): QuestionnaireBlueprint;

    abstract getLabel(): string;

    abstract getPlanCode(): string;

    abstract getPlanType(): ProductTypes;

    abstract getCarrier(): string;

    abstract getCarrierCode(): string;

    abstract getIllustrationApiPath(): string;

    public getClientCase(): IllustrationsClientCase {
        return this.clientCase;
    }

    abstract generateTitle(data: any, formInputs: any): string;

    public mapClientCaseInsuredData() {
        const clientCase = this.clientCase;
        const insuredAge = calculateAgeNumber(
            clientCase.insuredDetails?.dateOfBirth?.toString()
        );

        function getPremiumClass(
            age: number | undefined,
            isNicotineUser: boolean | undefined,
            underwritingClass: UnderwritingClass | undefined
        ): string | null {
            if (age && age < 18) {
                return 'juvenile';
            } else if (isNicotineUser) {
                return UnderwritingClass.STANDARDTOBACCO;
            } else if (underwritingClass !== undefined) {
                return underwritingClass;
            }
            return null;
        }

        const isConversion =
            clientCase.transactionType === TransactionType.CONVERSION;

        // get the premium class default based on client case details
        // if null, the default will be set by the blueprint
        const premiumClass = getPremiumClass(
            insuredAge,
            clientCase.insuredDetails?.nicotineUser,
            clientCase.insuredDetails?.underwritingClass
        );

        return {
            ...(clientCase.originalFaceAmount && {
                baseCoverage: {
                    currentAmount: clientCase.originalFaceAmount,
                },
            }),
            isConversion,
            ...(isConversion && {
                maxConversionFaceAmount: clientCase.originalFaceAmount,
                isMec: clientCase.isMec || false,
                preventMec: !clientCase.isMec,
            }),
            ...(premiumClass && {
                premiumClass: premiumClass,
            }),
            ...(clientCase?.insuredDetails?.state && {
                jurisdiction: clientCase.insuredDetails.state,
            }),

            insured: {
                nicotineUser: clientCase.insuredDetails?.nicotineUser
                    ? 'Nicotine'
                    : 'Non-Nicotine',
                ...(clientCase?.insuredDetails?.dateOfBirth && {
                    issueAge: calculateAgeNumber(
                        clientCase.insuredDetails.dateOfBirth.toString()
                    ),
                }),
                ...(clientCase?.insuredDetails?.sexAtBirth && {
                    gender: clientCase.insuredDetails.sexAtBirth.toUpperCase(),
                }),
                ...(clientCase?.insuredDetails?.dateOfBirth && {
                    dateOfBirth: dayjs(
                        new Date(clientCase?.insuredDetails?.dateOfBirth)
                    ).format(ZAHARA_DATE_FORMAT),
                }),
                ...(clientCase?.insuredDetails?.firstName && {
                    firstName: clientCase.insuredDetails.firstName,
                }),
                ...(clientCase?.insuredDetails?.lastName && {
                    lastName: clientCase.insuredDetails.lastName,
                }),
            },
            agent: {
                ...(clientCase?.agentDetails?.firstName && {
                    firstName: clientCase.agentDetails.firstName,
                }),
                ...(clientCase?.agentDetails?.lastName && {
                    lastName: clientCase.agentDetails.lastName,
                }),
            },
            insuredAgeTag: calculateAge(
                clientCase.insuredDetails?.dateOfBirth?.toString(),
                ''
            ),
        };
    }
}
