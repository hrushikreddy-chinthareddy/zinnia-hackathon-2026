import { useCallback, useMemo, useState } from 'react';

import { AgentOption } from '@deps/components/client-case/client-case-create/agent-search/types';
import { AgencyOption } from '@deps/components/client-case/client-case-create/create-client-case-form/create-client-case-form.helpers';
import { usePermissionsContext } from '@deps/contexts/PermissionsContext';
import { segmentAnalyticsTrackEvent } from '@deps/helpers/analytics/segment-analytics';
import { DEFAULT_ERROR_STRING } from '@deps/types/constants';
import { Product, ProductTypeLabel } from '@deps/types/product';
import {
    IllustrationAddProductClickedEvent,
    IllustrationsClickedEvent,
    IllustrationsSegmentTrackedEventName,
    AgentSearchEvent,
    BaseSegmentEventProps,
    ClientCaseClickedEvent,
    ClientCaseTitleInputEvent,
    DropdownClickedEvent,
    IllustrationsSearchSubmittedEvent,
    SegmentTrackedEventName,
    SelectAgencyEvent,
    IllustrationCalculateEvent,
} from '@deps/types/segment-analytics';

type SearchType = 'caseTitle' | 'agentName' | 'insuredName';

interface SendSearchProps {
    insuredFirstName?: string;
    insuredLastName?: string;
    clientCaseID?: string;
    agentFirstName?: string;
    agentLastName?: string;
    caseTitle?: string;
    searchType: SearchType;
}

export const useIllustrationAnalytics = () => {
    const { partyId, sessionId } = usePermissionsContext();
    const [searchText, setSearchText] = useState('');

    const baseSegmentEventProps = useMemo(
        () => ({
            userId: partyId,
            authSessionId: sessionId,
        }),
        [partyId, sessionId]
    );

    const sendIllustrationsClickedEvent = useCallback(
        (product: Product, eventName: string) => {
            const productName =
                ProductTypeLabel.get(product.productType) ??
                DEFAULT_ERROR_STRING;

            segmentAnalyticsTrackEvent<IllustrationsClickedEvent>(eventName, {
                productName,
                productType: product.productType,
                productMarketingName: product.productMarketingName,
                carrier: product.carrier,
                ...baseSegmentEventProps,
            });
        },
        [baseSegmentEventProps]
    );

    const sendCalculateIllustrationEvent = useCallback(
        (product: Product, illustrationId: string) => {
            const productName =
                ProductTypeLabel.get(product.productType) ??
                DEFAULT_ERROR_STRING;

            segmentAnalyticsTrackEvent<IllustrationCalculateEvent>(
                IllustrationsSegmentTrackedEventName.calculateIllustration,
                {
                    productName,
                    productMarketingName: product.productMarketingName,
                    productType: product.productType,
                    carrier: product.carrier,
                    illustrationId,
                    ...baseSegmentEventProps,
                }
            );
        },
        [baseSegmentEventProps]
    );

    const sendAddProductToIllustrateEvent = useCallback(
        (carrier: string) => {
            segmentAnalyticsTrackEvent<IllustrationAddProductClickedEvent>(
                IllustrationsSegmentTrackedEventName.addProductToIllustrate,
                {
                    carrier,
                    ...baseSegmentEventProps,
                }
            );
        },
        [baseSegmentEventProps]
    );

    const sendClientCaseDropdownClicked = useCallback(
        (value: SearchType) => {
            segmentAnalyticsTrackEvent<DropdownClickedEvent>(
                SegmentTrackedEventName.DropdownClicked,
                {
                    dropdownName: 'client case dropdown',
                    selectedItemName: value,
                    ...baseSegmentEventProps,
                }
            );
        },
        [baseSegmentEventProps]
    );

    const sendSearchSubmitted = useCallback(
        ({
            insuredFirstName,
            insuredLastName,
            clientCaseID = '',
            agentFirstName,
            agentLastName,
            caseTitle,
            searchType,
        }: SendSearchProps) => {
            let searchText = '';

            switch (searchType) {
                case 'agentName':
                    searchText = `${agentFirstName} ${agentLastName}`;
                    break;
                case 'insuredName':
                    searchText = `${insuredFirstName} ${insuredLastName}`;
                    break;
                case 'caseTitle':
                    searchText = caseTitle ?? '';
                    break;

                default:
                    '';
                    break;
            }

            segmentAnalyticsTrackEvent<IllustrationsSearchSubmittedEvent>(
                SegmentTrackedEventName.SearchSubmitted,
                {
                    firstNameUsed: !!insuredFirstName,
                    lastNameUsed: !!insuredLastName,
                    clientCaseID: clientCaseID, // might want to replace this with search text
                    agentFirstName: !!agentFirstName,
                    agentLastName: !!agentLastName,
                    caseTitle: !!caseTitle,
                    searchText,
                    ...baseSegmentEventProps,
                }
            );
        },
        [baseSegmentEventProps]
    );

    const sendClientCaseClicked = useCallback(
        (clientCaseID: string, linkUrl: string) => {
            segmentAnalyticsTrackEvent<ClientCaseClickedEvent>(
                SegmentTrackedEventName.ClientCaseClicked,
                {
                    clientCaseID,
                    linkUrl,
                    ...baseSegmentEventProps,
                }
            );
        },
        [baseSegmentEventProps]
    );

    const sendNewClientCaseClicked = useCallback(() => {
        segmentAnalyticsTrackEvent<BaseSegmentEventProps>(
            SegmentTrackedEventName.NewClientCaseClicked,
            {
                ...baseSegmentEventProps,
            }
        );
    }, [baseSegmentEventProps]);

    const sendNewClientCaseCreated = useCallback(() => {
        segmentAnalyticsTrackEvent<BaseSegmentEventProps>(
            SegmentTrackedEventName.NewClientCaseCreated,
            {
                ...baseSegmentEventProps,
            }
        );
    }, [baseSegmentEventProps]);

    const sendClientCaseTitleInput = useCallback(
        (titleInput: boolean) => {
            segmentAnalyticsTrackEvent<ClientCaseTitleInputEvent>(
                SegmentTrackedEventName.ClientCaseTitleInput,
                {
                    titleInput,
                    ...baseSegmentEventProps,
                }
            );
        },
        [baseSegmentEventProps]
    );

    const sendAgentSearch = useCallback(
        (
            agentSelected: boolean,
            searchInputUsed = '',
            agentOptions: AgentOption[]
        ) => {
            let agentFirstName = false;
            let agentLastName = false;
            const compareText = agentSelected ? searchInputUsed : searchText;

            if (!agentOptions) return;

            if (agentSelected) {
                agentFirstName =
                    !!agentOptions[0].firstName?.includes(compareText);
                agentLastName =
                    !!agentOptions[0].lastName?.includes(compareText);
            } else {
                agentFirstName = agentOptions.some((agent) =>
                    agent.firstName?.includes(compareText)
                );
                agentLastName = agentOptions.some((agent) =>
                    agent.lastName?.includes(compareText)
                );
            }

            segmentAnalyticsTrackEvent<AgentSearchEvent>(
                SegmentTrackedEventName.ClientCaseTitleInput,
                {
                    agentFirstName,
                    agentLastName,
                    agentSelected,
                    ...baseSegmentEventProps,
                }
            );
        },
        [baseSegmentEventProps, searchText]
    );

    const sendAgencySelection = useCallback(
        (agencyOptions: AgencyOption[]) => {
            segmentAnalyticsTrackEvent<SelectAgencyEvent>(
                SegmentTrackedEventName.ClientCaseAgencySelection,
                {
                    agencySelected: agencyOptions.length > 1,
                    ...baseSegmentEventProps,
                }
            );
        },
        [baseSegmentEventProps]
    );

    const sendClientCaseEdited = useCallback(() => {
        segmentAnalyticsTrackEvent<BaseSegmentEventProps>(
            SegmentTrackedEventName.ClientCaseEdited,
            {
                ...baseSegmentEventProps,
            }
        );
    }, [baseSegmentEventProps]);

    return {
        sendClientCaseDropdownClicked,
        sendSearchSubmitted,
        sendClientCaseClicked,
        sendNewClientCaseClicked,
        sendNewClientCaseCreated,
        sendClientCaseTitleInput,
        sendAgentSearch,
        sendAgencySelection,
        sendClientCaseEdited,
        sendIllustrationsClickedEvent,
        sendCalculateIllustrationEvent,
        sendAddProductToIllustrateEvent,
        // actions
        setSearchText,
    };
};
