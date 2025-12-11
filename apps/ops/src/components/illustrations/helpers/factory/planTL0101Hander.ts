import { CarrierName } from '@zinnia/bloom/components';
import { QuestionnaireBlueprint } from '@zinnia/form-engine-sdk';
import { Result } from 'typegate';

import { numberFormatify } from '@deps/helpers/numbers.helpers';
import { IllustrationsClientCase } from '@deps/types/illustrations';
import { ProductTypes } from '@deps/types/product';
import { getRiderNames } from 'components/illustrations/helpers/get-rider-names';

import {
    CreateIllustrationPayload,
    CreateIllustrationPayloadParsingError,
} from '../illustrationApiSchemas';
import {
    IllustrationHandler,
    OutputDataParsingError,
} from './illustrationsHandlerAbstractClass';
import {
    FarmersEntities,
    getFarmersCreateIllustrationPayload,
    getIllustrationDataFromResponse,
    mapIllustrationPayloadToEngineInputData,
} from '../farmers/famersBlueprintToIllustrationPayloadTL0101';
import { farmersTermBlueprintTL0101 } from '../farmers/farmersTermBlueprintTL0101';

export class PlanTL0101Handler extends IllustrationHandler<FarmersEntities> {
    constructor(clientCase: IllustrationsClientCase) {
        super(clientCase);
    }

    createIllustrationPayloadFromAnswerOutput(
        answerOutputData: unknown
    ): Result<
        OutputDataParsingError | CreateIllustrationPayloadParsingError,
        CreateIllustrationPayload
    > {
        // Parse and return result

        const data = answerOutputData as Record<string, any>;
        data.planCode = this.getPlanCode();

        return getFarmersCreateIllustrationPayload(data);
    }

    mapIllustrationPayloadToEngineInputData(
        data: CreateIllustrationPayload
    ): unknown {
        return mapIllustrationPayloadToEngineInputData(data);
    }

    getIllustrationDataFromResponse(data: any, formInputs: any): any {
        return getIllustrationDataFromResponse(data, formInputs);
    }

    getBlueprint(): QuestionnaireBlueprint {
        return farmersTermBlueprintTL0101;
    }

    getLabel(): string {
        return 'Farmers Term Life';
    }

    getPlanCode(): string {
        return 'TL0101';
    }

    getPlanType(): ProductTypes {
        return ProductTypes.TERM;
    }

    getCarrier(): string {
        return CarrierName.FARMERS;
    }

    getCarrierCode(): string {
        return 'fnwl';
    }

    getIllustrationApiPath(): string {
        return 'api/illustration/v3/term-life/new-business';
    }

    public generateTitle(data: any, formInputs: any): string {
        const assumed = data.assumed;
        const creationDate = new Date().toLocaleDateString();

        const riderNames = getRiderNames(data);

        return [
            creationDate,
            `Face Amount ${numberFormatify(assumed.initial.totalFaceAmount)}`,
            `${formInputs.fixedCostPeriod} yr`,
            ...riderNames,
        ]
            .filter((x) => x)
            .join(', ');
    }
}
