import { getAccessToken } from '@auth0/nextjs-auth0';
import { NextApiRequest, NextApiResponse } from 'next';

import { apiServerBaseUrl } from '@deps/queries/api-config';
import { logError } from '@deps/utils/server-logging';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const { planCode, id: policyNumber } = req.query;
    const { carrierId, policyStatus } = req.body;
    const accessToken = (await getAccessToken(req, res)).accessToken;

    try {
        const response = await fetch(
            `${apiServerBaseUrl}/inforce-illustration/v1/policies/${planCode}/${policyNumber}/illustrations/as-is-inforce/pdf`,
            {
                method: 'POST',
                body: JSON.stringify({
                    carrierCode: carrierId,
                    policyStatus: policyStatus,
                }),
                headers: {
                    'Content-Type': 'application/pdf',
                    Authorization: `Bearer ${accessToken}`,
                },
            }
        );

        if (!response.ok) {
            return res
                .status(500)
                .json({ error: 'Failed to fetch illustration pdf' });
        }

        const arrayBuffer = await response.arrayBuffer();
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader(
            'Content-Disposition',
            `inline; filename=illustration-policy-${policyNumber}.pdf`
        );

        res.status(200).send(Buffer.from(arrayBuffer));
    } catch (error: any) {
        const statusCode = error?.status || 500;
        const message =
            error?.statusText || error?.message || 'Internal Server Error';

        logError(message);
        res.status(statusCode).json({
            message,
        });
    }
}
