import { getAccessToken, getSession } from '@auth0/nextjs-auth0';
import { PartyReferenceDataModel } from '@zinnia/api-types/types/partyreference';
import { IconType } from '@zinnia/bloom/components';
import { AxiosResponse } from 'axios';

import { checkTupleApi } from '@deps/queries/api/server/fga/checkTuple';
import { apiServerBaseUrl } from '@deps/queries/api-config';
import { serverApi } from '@deps/queries/api-utils/serverApiClient';
import { isWellabeAgent } from '@deps/utils/agent-helper';
import { logTrace, logWarn, parseErrorInformation, withAuthAndLogging } from '@deps/utils/server-logging';

import type { NextApiRequest, NextApiResponse } from 'next';

export interface UserContextMenuItem {
    content: string;
    href: string;
    icon?: IconType;
    disabled?: boolean;
    openInNewTab?: boolean;
}

export default withAuthAndLogging(
    async (req: NextApiRequest, res: NextApiResponse<any | null>, logCtx) => {
        const now = performance.now();
        const accessToken = (await getAccessToken(req, res)).accessToken;
        const session = await getSession(req, res);

        const partyId = session?.user.partyId;

        const url = `${apiServerBaseUrl}/party/v1/parties/${partyId}/reference`;
        const loggingContext = { ...logCtx, url, partyId };
        const responseData: UserContextMenuItem[] = [];

        logTrace('parties/userContextMenu::start', loggingContext);

        try {
            const [partyReference, isSuperAdmin] = await Promise.allSettled([
                await serverApi.get<null, AxiosResponse>(
                    url,
                    {
                        authorization: `Bearer ${accessToken}`,
                        headers: {
                            Accept: '*/*',
                            'Accept-Encoding': 'gzip, deflate, br',
                            Connection: 'keep-alive',
                            'Access-Control-Allow-Origin': '*',
                        },
                    },
                    loggingContext
                ),
                await checkTupleApi(req, res, 'party', 'role:zinnia_super_admin', loggingContext),
            ]);
            // Carrier check for wellabe agents
            // if the user is a wellabe agent, then add the toppan merrill storefrontlink
            if (partyReference.status === 'rejected') {
                logWarn(
                    'parties/userContextMenu::error::something went wrong while retrieving the party metatdata. Suppressing party specific menu items.',
                    {
                        ...parseErrorInformation(partyReference.reason),
                        ...loggingContext,
                        duration: performance.now() - now,
                    }
                );
            } else {
                logTrace('parties/userContextMenu::success::Successfully retrieved party metadata', {
                    ...loggingContext,
                    duration: performance.now() - now,
                });

                // look in the alias array for an object that has the carrier === "welb" and partyRoles === "PRIMARYSERVICINGAGENT"
                const partyRefData = partyReference.value?.data as PartyReferenceDataModel;

                if (isWellabeAgent(partyRefData)) {
                    responseData.push({
                        href: `/toppan-merrill`,
                        content: 'Wellabe Sales Materials',
                        icon: IconType.LIGHTBULB,
                        openInNewTab: true,
                    });
                }
            }

            // Check if the user is a super admin
            if (isSuperAdmin.status === 'rejected') {
                logWarn('parties/userContextMenu::error::something went wrong while retrieving the user metatdata.', {
                    ...parseErrorInformation(isSuperAdmin.reason),
                    ...loggingContext,
                    duration: performance.now() - now,
                });
            } else {
                if (isSuperAdmin.value) {
                    responseData.push({
                        href: process.env.ACCESS_MANAGEMENT_URL as string,
                        content: 'Access Management',
                        icon: IconType.SHIELD,
                    });
                }
            }

            return res.json({ data: responseData });
        } catch (error) {
            logWarn('parties/userContextMenu::error::something went wrong while retrieving the party metatdata', {
                ...parseErrorInformation(error),
                ...loggingContext,
                duration: performance.now() - now,
            });
            res.status(500).json(null);
        }
    },
    { file: 'party/v1/parties/reference', function: 'routeHandler' }
);
