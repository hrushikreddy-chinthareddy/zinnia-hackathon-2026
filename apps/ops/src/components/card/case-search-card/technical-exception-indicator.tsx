import React from 'react';
import { useTranslation } from 'react-i18next';

import { ExceptionTypes } from '@deps/components/case-sub-page/case-tabs/progress/progress-tab-helpers';
import Tooltip, { PopoverPlacement } from '@deps/components/tooltip/tooltip';
import { Case } from '@deps/models/case/case';
import { ExceptionStatuses } from '@deps/models/case/exception-instance';
import { ReactComponent as AlertExclamationIcon } from '@deps/styles/elements/icons/alert/alert-exclamation.svg';

interface TechnicalDetailsIndicatorProps {
    singleCase: Case;
}

const TechnicalDetailsIndicator: React.FC<TechnicalDetailsIndicatorProps> = ({
    singleCase,
}) => {
    const { t } = useTranslation();
    const technicalExceptionMessage = t(
        'allFields.technicalExceptionsIndicator'
    );
    const isTechnicalException = singleCase.exceptions?.some(
        (exception) =>
            exception.exceptionType === ExceptionTypes.Technical &&
            exception.status === ExceptionStatuses.New
    );
    if (isTechnicalException) {
        return (
            <Tooltip
                body={technicalExceptionMessage}
                placement={PopoverPlacement.TopRight}
                triggerAriaLabel={technicalExceptionMessage as string}
            >
                <AlertExclamationIcon
                    aria-hidden="true"
                    data-testid={'alert-exclamation-icon'}
                    width={16}
                    height={16}
                />
            </Tooltip>
        );
    }

    return null;
};

export default TechnicalDetailsIndicator;
