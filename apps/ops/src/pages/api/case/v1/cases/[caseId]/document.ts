import { se2ApiServerUrl } from '@deps/queries/api-config';
import { requestHandler } from '@deps/queries/api-utils/server';
import { withAuthAndLogging } from '@deps/utils/server-logging';
const ssrCasesUrl = `${se2ApiServerUrl}/cases`;

export default withAuthAndLogging(
    async (req, res, loggingContext) => {
        const { caseId } = req.query;
        return await requestHandler<any>(
            `${ssrCasesUrl}/${caseId}/document`,
            req,
            res,
            loggingContext
        );
    },
    { file: 'case/v1/cases/:id/document', function: 'routeHandler' }
);
