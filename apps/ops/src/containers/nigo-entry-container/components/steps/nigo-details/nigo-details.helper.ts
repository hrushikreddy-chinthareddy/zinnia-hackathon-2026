import { searchNigoExceptions, searchNigoExceptionsFilters } from '@deps/queries/api/exception-refs';
import { LoggingContext } from '@deps/utils/server-logging';

import { ExceptionSubRef, SubException, NigoException, NigoSubException } from './nigo-details.types';

export const getSubExceptions = (exceptionSubRefs: ExceptionSubRef[]) => {
    const subExceptions: SubException[] = [];
    exceptionSubRefs?.map(({ subNmIdDetail, subNmId }) => {
        subExceptions.push({ label: subNmIdDetail, value: subNmId, displayText: subNmIdDetail });
    });
    return subExceptions;
};

export const getNigoExceptions = async (
    filters: searchNigoExceptionsFilters,
    accessToken: string | undefined,
    loggingContext: LoggingContext
) => {
    const response = await searchNigoExceptions(filters, accessToken, loggingContext);

    const nigoExceptions: NigoException[] = [];
    const nigoSubExceptions: NigoSubException[] = [];
    response?.map(({ detailedReason, nmId, exceptionSubRefs }) => {
        nigoExceptions.push({ label: detailedReason, value: nmId });

        nigoSubExceptions.push({ nmId, subExceptions: exceptionSubRefs ? getSubExceptions(exceptionSubRefs) : [] });
    });

    return { nigoExceptions, nigoSubExceptions };
};
