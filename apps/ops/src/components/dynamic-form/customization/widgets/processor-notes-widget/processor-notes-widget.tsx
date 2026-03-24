import {
    FormContextType,
    RJSFSchema,
    StrictRJSFSchema,
    WidgetProps,
} from '@rjsf/utils';
import { BodyVariant, Text } from '@zinnia/bloom/components';
import { useTranslation } from 'next-i18next';

import NavElement, {
    NavElementSize,
    NavElementType,
} from '@deps/components/nav-element/nav-element';
import GlobalTaskSideSheet, {
    TabOptions,
} from '@deps/components/side-sheet/task-details-sidesheet/global-task-sidesheet-content';
import { useOptimizely } from '@deps/contexts/OptimizelyContext';
import { useSideSheetContextLegacy } from '@deps/contexts/SideSheetContext';
import { ManagementTask } from '@deps/models/case/task-instance';
import { FEATURE_FLAGS } from '@deps/utils/optimizely/flags';
import { DEFAULT_ERROR_STRING } from '@deps/utils/strings';

export type ProcessorNotesWidgetProps<
    T,
    S extends StrictRJSFSchema = RJSFSchema,
    F extends FormContextType = any
> = WidgetProps<T, S, F>;

function ProcessorNotesWidget<
    T = any,
    S extends StrictRJSFSchema = RJSFSchema,
    F extends FormContextType = any
>(props: ProcessorNotesWidgetProps<T, S, F>) {
    const { value, formContext } = props;
    const { t } = useTranslation();
    const { featureFlags } = useOptimizely();
    const sideSheet = useSideSheetContextLegacy();
    const task = (formContext?.customData?.task ?? formContext?.customData) as
        | ManagementTask
        | undefined;
    const mappedDocuments = formContext?.mappedDocuments;
    const hasNotesApiKey = Boolean(task?.externalId);
    const noteText = typeof value === 'string' ? value.trimEnd() : '';
    const linkLabel = t('allFields.seePreviousNotes');

    const handleSeePreviousNotes = () => {
        if (!task?.id || !task?.caseId || !sideSheet?.changeSideSheetContent) {
            return;
        }

        sideSheet.changeSideSheetContent(
            task.taskName
                ? `${t('sideSheet.task.taskHeading')}: ${task.taskName}`
                : t('sideSheet.task.taskHeading'),
            <GlobalTaskSideSheet
                taskId={task.id}
                caseId={task.caseId}
                type="task"
                taskDescription={task.taskDetails}
                taskName={task.taskName}
                queue={task.queue ?? ''}
                carrier={task.carrier ?? ''}
                mappedDocuments={mappedDocuments}
                initialTab={TabOptions.Notes}
            />
        );
        sideSheet.handleOpen(true);
    };

    const handleLinkClick = (
        e: React.MouseEvent<HTMLAnchorElement, MouseEvent>
    ) => {
        e.preventDefault();
        handleSeePreviousNotes();
    };

    const isCarrierExternalTaskNotesEnabled =
        featureFlags?.[FEATURE_FLAGS.CREATE_CARRIER_EXTERNAL_TASK] ?? false;
    const shouldShowNotesLink =
        Boolean(noteText) &&
        hasNotesApiKey &&
        isCarrierExternalTaskNotesEnabled;

    return (
        <div className="grid grid-cols-[200px_auto] text-md gap-2">
            <div className="text-gray-500">{t('allFields.processorNotes')}</div>
            <div>
                {noteText ? (
                    <div className="inline-flex flex-wrap items-baseline">
                        <Text as={BodyVariant.span} className="mr-2 inline">
                            {noteText}
                        </Text>
                        {shouldShowNotesLink && (
                            <div className="inline-block align-baseline">
                                <NavElement
                                    className="text-left"
                                    size={NavElementSize.Small}
                                    title={linkLabel}
                                    type={NavElementType.Link}
                                    underline
                                    onClick={handleLinkClick}
                                >
                                    {linkLabel}
                                </NavElement>
                            </div>
                        )}
                    </div>
                ) : (
                    <Text as={BodyVariant.span} className="text-gray-400">
                        {DEFAULT_ERROR_STRING}
                    </Text>
                )}
            </div>
        </div>
    );
}

export default ProcessorNotesWidget;
