import { Timezone } from '@zinnia/form-engine-sdk';
import { FC } from 'react';

import { IllustrationsClientCase } from '@deps/types/illustrations';

import { Eapp } from './Eapp';
import { IllustrationHandlerFactory } from '../../helpers/factory/illustrationsHandlerFactory';
// TODO: timezone needs to be taken from the user
const DEFAULT_TIMEZONE_NAME = 'America/Toronto';

interface EappContainer {
    clientCase?: IllustrationsClientCase;
    planCode: string;
    isEdit?: boolean;
    illustrationId?: string;
}

const EappContainer: FC<EappContainer> = ({
    clientCase,
    planCode,
    isEdit,
    illustrationId,
}) => {
    const timezoneResult = Timezone.from(DEFAULT_TIMEZONE_NAME);
    if (!timezoneResult.success) {
        // TODO: better error handling if that happens. We will need to retrieve the timezone from the user and validate
        throw new Error('Invalid timezone');
    }

    const illustrationHandlerFactory = IllustrationHandlerFactory(
        planCode,
        clientCase
    );

    if (!illustrationHandlerFactory) {
        console.log(`Plan code ${planCode} not found.`);
        return null;
    }

    return (
        <Eapp
            carrier={illustrationHandlerFactory.getCarrier()}
            label={illustrationHandlerFactory.getLabel()}
            planCode={illustrationHandlerFactory.getPlanCode()}
            planType={illustrationHandlerFactory.getPlanType()}
            isEdit={isEdit}
            illustrationId={illustrationId}
        />
    );
};

export default EappContainer;
