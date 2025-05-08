import { getAccessToken } from '@auth0/nextjs-auth0';
import { PartyReferenceDataModel } from '@zinnia/api-types/types/partyreference';
import { AxiosResponse } from 'axios';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useEffect } from 'react';

import { TranslationFiles } from '@deps/config/translations';
import { getUserData } from '@deps/helpers/query-data.helpers';
import { ALL_LOCALES, DEFAULT_LOCALE } from '@deps/helpers/routing.helpers';
import { isNullEmptyOrUndefined } from '@deps/helpers/string.helper';
import { apiServerBaseUrl } from '@deps/queries/api-config';
import { serverApi } from '@deps/queries/api-utils/serverApiClient';
import { AgentDataResponse } from '@deps/types/agents';
import { findCarrierAgents } from '@deps/utils/agent-helper';
import { encryptWellabeToppanMerrill } from '@deps/utils/crypto/crypto';
import { ToppanMerrillStorefrontAgent } from '@deps/utils/merrill-toppan/merrill-toppan-xml';
import { logTrace, logWarn, parseErrorInformation, withPageAuthAndLogging } from '@deps/utils/server-logging';
import nextI18nextConfig from 'next-i18next.config';

interface ToppanMerrillProps {
    postUrl: string;
    postData: Record<string, string>;
}

/**
 * The ToppanMerrill component is responsible for sending a POST request to the Toppan Merrill website.
 * It creates a hidden form with the required data and submits it automatically when the component is mounted.
 */
function ToppanMerrill({ postUrl, postData }: ToppanMerrillProps) {
    useEffect(() => {
        const form = document.getElementById('auto-post-form') as HTMLFormElement;
        form.submit();
    }, []);

    return (
        <div>
            <form id="auto-post-form" method="POST" action={postUrl} style={{ display: 'none' }}>
                {Object.entries(postData).map(([key, value]) => (
                    <input key={key} type="hidden" name={key} value={value as string | number | readonly string[] | undefined} />
                ))}
            </form>
        </div>
    );
}

export default ToppanMerrill;

export const getServerSideProps = withPageAuthAndLogging(
    {
        getServerSideProps: async (context, logCtx) => {
            const now = performance.now();

            const user = await getUserData(context);
            const accessToken = (await getAccessToken(context.req, context.res)).accessToken;
            const agentInfo = new ToppanMerrillStorefrontAgent();
            const partyId = user.partyId;
            const url = `${apiServerBaseUrl}/party/v1/parties/${partyId}/reference`;
            const loggingContext = { ...logCtx, url, partyId };

            logTrace('toppan-merrill/index::start', loggingContext);

            let agentData: AgentDataResponse | undefined;

            try {
                // Pull the party reference data so we can identify the user's persona and carrier
                const partyRefReq = await serverApi.get<null, AxiosResponse>(
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
                );

                const partyRef = partyRefReq.data as PartyReferenceDataModel;

                const wellabeAgent = findCarrierAgents(partyRef, 'welb');

                // If the user is a wellabe agent, get the agent metadata
                if (wellabeAgent.length > 0) {
                    // TEST QUERY: curl --location 'https://qa.api.zinnia.io/api/GLCO/salesentity?idType=external&id=119350014&skip=1&take=10'

                    // Find all agent aliases for the agent then parse out the ones that are wellabe
                    // MCS only stores the parent company codes. In this case for Wellabe (WELB), the partent is ARIC
                    const parentCompayCodes = 'ARIC'; // TODO: how do we dynamicallyt find this value? // GLCO for testing locally
                    const externalId = wellabeAgent[0].externalId; // 119350014 for testing locally

                    const agentUrlPath = `${apiServerBaseUrl}/api/${parentCompayCodes}/salesentity?idType=external&id=${externalId}&IsClientChild=true&&skip=0&take=10`;

                    const agentReq = await serverApi.get<null, AxiosResponse>(
                        agentUrlPath,
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
                    );

                    agentData = agentReq.data as AgentDataResponse;

                    const agent = agentData && agentData.items?.[0] ? agentData.items[0] : undefined;
                    // Populate the agent xml file required for the SSO to MerrillToppan
                    if (agent) {
                        const individaul = agent.individuals?.[0];
                        const address = agent.addresses?.[0];
                        const email = agent.emails?.[0];

                        agentInfo.setAgentId(partyId);
                        agentInfo.setUserType('Manager');
                        agentInfo.setFirstName(individaul?.firstName as string);
                        agentInfo.setLastName(individaul?.lastName as string);
                        agentInfo.setAddress1(address?.addressLine1 as string);
                        agentInfo.setCity(address?.city as string);
                        agentInfo.setState(address?.stateCode as string);
                        agentInfo.setPostCode(address?.zip as string);
                        agentInfo.setEmail(email?.email as string);
                        agentInfo.setBillingCode('CC0224');
                        agentInfo.setDistribution('AR');
                        agentInfo.setCompany('A2');

                        agent.appointments.forEach(appointment => {
                            if (!isNullEmptyOrUndefined(appointment.state)) {
                                agentInfo.addState(appointment.state);
                            }
                        });
                    } else {
                        logWarn('toppan-merrill/index::error::no agent found', {
                            ...loggingContext,
                            duration: performance.now() - now,
                            path: agentUrlPath,
                        });
                    }
                } else {
                    // If the user is not a wellabe agent redirect them to the home page
                    logWarn('toppan-merrill/index::error::user is not a wellabe agent', {
                        ...loggingContext,
                        duration: performance.now() - now,
                    });
                    return {
                        redirect: {
                            destination: '/',
                            permanent: false,
                        },
                    };
                }
            } catch (error) {
                logWarn('toppan-merrill/index::error::something went wrong while retrieving the party metatdata', {
                    ...parseErrorInformation(error),
                    ...loggingContext,
                    duration: performance.now() - now,
                });
            }

            const xml = agentInfo.toXml();
            const encryptedPayload = encryptWellabeToppanMerrill(xml);

            const postUrl = process.env.TOPPAN_MERRILL_POST_URL as string;
            const postData = {
                data: encryptedPayload.encrypted,
                iv: encryptedPayload.iv,
                source: 'zinnia',
            };

            const { locale = DEFAULT_LOCALE } = context;
            const translations = await serverSideTranslations(
                locale,
                [TranslationFiles.COMMON, TranslationFiles.COLDEFS],
                nextI18nextConfig,
                ALL_LOCALES
            );

            return {
                props: {
                    ...translations,
                    postUrl,
                    postData,
                },
            };
        },
    },
    { file: 'ToppanMerrill/index', function: 'getServerSideProps', page: 'ToppanMerrill' }
);
