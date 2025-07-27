import { QuestionnaireBlueprint } from '@zinnia/form-engine-sdk';
import dayjs from 'dayjs';
import { Result } from 'typegate';

import { calculateAgeNumber } from '@deps/helpers/age.helpers';
import { ZAHARA_DATE_FORMAT } from '@deps/helpers/date.helpers';
import { calculateAge } from '@deps/helpers/string.helpers';
import { IllustrationsClientCase } from '@deps/types/illustrations';
import { ProductTypes } from '@deps/types/product';

import {
    CreateIllustrationPayload,
    CreateIllustrationPayloadParsingError,
} from '../illustrationApiSchemas';

export class OutputDataParsingError extends Error {
    readonly _tag = 'OutputDataParsingError';
}

// Shared interface for all client cases
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

    abstract getIllustrationDataFromResponse(data: any): any;

    abstract getBlueprint(): QuestionnaireBlueprint;

    abstract getLabel(): string;

    abstract getPlanCode(): string;

    abstract getPlanType(): ProductTypes;

    abstract getCarrier(): string;

    abstract getIllustrationApiPath(): string;

    public getClientCase(): IllustrationsClientCase {
        return this.clientCase;
    }

    abstract generateTitle(data: any): string;

    public mapClientCaseInsuredData() {
        const clientCase = this.clientCase;

        return {
            ...(clientCase?.insuredDetails?.state && {
                jurisdiction: clientCase.insuredDetails.state,
            }),
            insured: {
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
