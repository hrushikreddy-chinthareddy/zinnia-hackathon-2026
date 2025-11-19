import { SideSheet, Icon, IconType, Button } from '@zinnia/bloom/components';
import { FC, SetStateAction, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { usePermissionsContext } from '@deps/contexts/PermissionsContext';
import { buttonClickedTrackEvent } from '@deps/helpers/analytics/segment-analytics';

import { PolicySidesheetContent } from './content/policy-sidesheet-content';
import { FindAllKeyValuesSidebarProps } from './types';

/**
 * A Sidesheet component that displays all key-value pairs of a policy.
 *
 * When opened, it displays a date picker to select a date, and a search field to search
 * key-value pairs. The date picker is disabled for future dates, and the search field
 * filters down the key-value pairs based on the search value.
 *
 * @param {string} planCode - the plan code of the policy
 * @param {string} policyNumber - the policy number of the policy
 * @returns {JSX.Element} - the rendered component
 */
export const FindAllKeyValuesPolicySidesheet: FC<
    FindAllKeyValuesSidebarProps
> = ({ planCode, policyNumber }) => {
    const { t } = useTranslation();
    const { sessionId: authSessionId } = usePermissionsContext();
    const [container, setContainer] = useState<HTMLDivElement | null>(null);
    const setContainerRef = useCallback(
        (node: SetStateAction<HTMLDivElement | null>) => {
            setContainer(node);
        },
        []
    );
    const [calendarOpen, setCalendarOpen] = useState(false);

    const handleCalendarOpen = (isOpen: boolean) => {
        setCalendarOpen(isOpen);
    };
    return (
        <SideSheet
            trigger={
                <Button
                    mode="secondary"
                    size="small"
                    onClick={() =>
                        buttonClickedTrackEvent({
                            buttonText: 'Find key values',
                            authSessionId,
                            policyId: policyNumber,
                            planCode,
                        })
                    }
                >
                    <Icon type={IconType.DOCUMENT_TEXT} />
                    {t('label.findKeyValuesTitle')}
                </Button>
            }
            header={
                <span className="typography-desktop-headline-2-d">
                    {t('label.findKeyValuesTitle')}
                </span>
            }
            preventCloseOnOutsideClick={false}
            ref={setContainerRef}
            preventEscKeyDownClose={calendarOpen}
        >
            <PolicySidesheetContent
                planCode={planCode}
                policyNumber={policyNumber}
                container={container}
                handleCalendarOpen={handleCalendarOpen}
            />
        </SideSheet>
    );
};
