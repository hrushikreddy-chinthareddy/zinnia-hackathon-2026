import { RegistryWidgetsType } from '@rjsf/utils';

import AgentPercentageWidget from './agent-percentage-widget/agent-percentage-widget';
import SummaryWidget from './agent-summary-widget/agent-summary-widget';
import AgentTransactionAccordion from './agent-transaction-accordian/agent-transaction-accordion';
import AllocationPercentageWidget from './allocation-percentage/allocation-percentage';
import ArithmeticOperationWidget from './arithmetic-operation-widget/arithmetic-operation-widget';
import CheckboxWidget from './checkbox-widget/checkbox-widget';
import CheckBoxesSelectWidget from './checkboxes-select-widget/checkboxes-select-widget';
import CheckboxesWidget from './checkboxes-widget/checkboxes-widget';
import DateWidget from './date-widget/date-widget';
import DateWidgetV2 from './date-widget/date-widget-v2';
import EmailWidget from './email-widget/email-widget';
import { RJSFFileWidget } from './file-widget';
import AttachmentWidget from './file-widget/attachment-widget';
import HyperLinkWidget from './hyper-link-widget/hyper-link-widget';
import IssueResolvedRadioWidget, {
    IssueResolvedDisplayWidget,
} from './issue-resolved-widget/issue-resolved-widget';
import NotesWidget from './notes-widget/notes-widget';
import NumbersWidget from './numbers/numbers';
import PartyRoleWidget from './party-role-widget/party-role-widget';
import ProcessorNotesWidget from './processor-notes-widget/processor-notes-widget';
import RadioWidget from './radio-widget/radio-widget';
import SelectWidget from './select-widget/select-widget';
import TextWidget from './text-widget/text-widget';
import ValueWidget from './text-widget/value-widget';
import TextareaWidget from './textarea-widget/textarea-widget';
import TitleWidget from './title-widget/titile-widget';

export function generateWidgets(): RegistryWidgetsType {
    return {
        CheckboxWidget,
        CheckboxesWidget,
        CheckBoxesSelectWidget,
        TextWidget,
        TextareaWidget,
        SelectWidget,
        DateWidget,
        RadioWidget,
        ValueWidget,
        FileWidget: RJSFFileWidget,
        HyperLinkWidget,
        NotesWidget,
        AttachmentWidget,
        ArithmeticOperationWidget,
        AllocationPercentageWidget,
        AgentTransactionAccordion,
        AgentPercentageWidget,
        SummaryWidget,
        EmailWidget,
        NumbersWidget,
        DateWidgetV2,
        TitleWidget,
        ProcessorNotesWidget,
        PartyRoleWidget,
        IssueResolvedDisplayWidget,
        IssueResolvedRadioWidget,
    };
}

export default generateWidgets();
