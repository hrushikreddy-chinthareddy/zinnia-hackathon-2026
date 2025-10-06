import { usePermissionsContext } from '@deps/contexts/PermissionsContext';
import { segmentAnalyticsTrackEvent } from '@deps/helpers/analytics/segment-analytics';
import {
    BaseSegmentEventProperties,
    ClientCaseClickedEvent,
    DropdownClickedEvent,
    IllustrationsSearchSubmittedEvent,
    SegmentTrackedEventName,
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

    const baseSegmentEventProps = {
        userId: partyId,
        session_id: sessionId,
    };

    const sendClientCaseDropdownClicked = (value: SearchType) => {
        segmentAnalyticsTrackEvent<DropdownClickedEvent>(
            SegmentTrackedEventName.DropdownClicked,
            {
                dropdownName: 'client case dropdown',
                selectedItemName: value,
                timestamp: new Date(),
                ...baseSegmentEventProps,
            }
        );
    };

    const sendSearchSubmitted = ({
        insuredFirstName,
        insuredLastName,
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
                agentFirstName: !!agentFirstName,
                agentLastName: !!agentLastName,
                caseTitle: !!caseTitle,
                searchText,
                timeStamp: new Date(),
                ...baseSegmentEventProps,
            }
        );
    };

    const sendClientCaseClicked = (clientCaseID: string, linkUrl: string) => {
        segmentAnalyticsTrackEvent<ClientCaseClickedEvent>(
            SegmentTrackedEventName.ClientCaseClicked,
            {
                clientCaseID,
                linkUrl,
                timeStamp: new Date(),
                ...baseSegmentEventProps,
            }
        );
    };

    const sendNewClientCaseClicked = () => {
        segmentAnalyticsTrackEvent<BaseSegmentEventProperties>(
            SegmentTrackedEventName.NewClientCaseClicked,
            {
                ...baseSegmentEventProps,
            }
        );
    };

    return {
        sendClientCaseDropdownClicked,
        sendSearchSubmitted,
        sendClientCaseClicked,
        sendNewClientCaseClicked,
    };
};
