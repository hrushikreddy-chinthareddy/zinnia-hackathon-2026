import { HttpStatusCode } from 'axios';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import Button, {
    ButtonSize,
    ButtonVariant,
} from '@deps/components/button/button';
import Checkbox from '@deps/components/checkbox/checkbox';
import { FieldSize } from '@deps/components/fields/field';
import Select from '@deps/components/select/select';
import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import { TranslationFiles } from '@deps/config/translations';
import { useSideSheetContext } from '@deps/contexts/SideSheetContext';
import { CaseAction } from '@deps/models/case/enums';
import { escalateCase, getProcessReferenceData } from '@deps/queries/api/cases';
import { browserLogError } from '@deps/utils/browser-logging';

import styles from './styles.module.css';
import SuccessErrorSideSheet from './success-error-side-sheet';

interface Props {
    caseId: string;
    action: CaseAction;
}

const REASON_TYPE_BY_ACTION: Record<CaseAction, string> = {
    [CaseAction.Prioritize]: 'CASE_ESCALATION_REASON',
    [CaseAction.Deprioritize]: 'CASE_DEESCALATION_REASON',
};

function CaseActionSideSheet({ caseId, action }: Props) {
    const { t } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: `caseOverview.${action}Case`,
    });
    const { t: tCommon } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: 'allFields',
    });
    const [error, setError] = useState<string | undefined>();
    const [reason, setReason] = useState('');
    const [source, setSource] = useState('');
    const [reasonOptions, setReasonOptions] = useState<
        { label: string; value: string }[]
    >([]);
    const [sourceOptions, setSourceOptions] = useState<
        { label: string; value: string }[]
    >([]);
    const [reasonError, setReasonError] = useState<string | undefined>();
    const [sourceError, setSourceError] = useState<string | undefined>();
    const [notify, setNotify] = useState(false);
    const sideSheet = useSideSheetContext();

    const validate = () => {
        const errors = {
            reason: reason
                ? undefined
                : tCommon('prioritizationReasonRequired'),
            source: source
                ? undefined
                : tCommon('prioritizationSourceRequired'),
        };

        setReasonError(errors.reason as string | undefined);
        setSourceError(errors.source as string | undefined);

        return !errors.reason && !errors.source;
    };

    const handleSubmit = async () => {
        const isPrioritize = action === CaseAction.Prioritize;

        if (!validate()) {
            return;
        }

        try {
            const response = await escalateCase(
                caseId,
                isPrioritize,
                reason,
                source
            );
            if (response) {
                const content = (
                    <SuccessErrorSideSheet
                        response={response}
                        sideSheet={sideSheet}
                        successMessage={t('successMessage', { caseId })}
                        errorMessage={
                            response.status === HttpStatusCode.Forbidden
                                ? t('errorForbidden')
                                : t('errorMessage', {
                                      error: response.data?.message ?? '',
                                  })
                        }
                    />
                );
                sideSheet.changeSideSheetContent(t('title'), content);
                sideSheet.handleOpen(true);
            }
        } catch (error) {
            browserLogError(
                `${action}escalateCaseCase :${caseId} : error : ${error}`
            );
            setError(error as string);
        }
    };

    useEffect(() => {
        const fetchRefData = async () => {
            const reasonType = REASON_TYPE_BY_ACTION[action];

            const [reasonData, sourceData] = await Promise.all([
                getProcessReferenceData(reasonType),
                getProcessReferenceData('CASE_ESCALATION_SOURCE'),
            ]);

            if (!reasonData || !sourceData) {
                setError(tCommon('prioritizationRefDataError') as string);
                setReasonOptions([]);
                setSourceOptions([]);
                return;
            }

            setReasonOptions(
                reasonData.map((item) => ({
                    label: item.value,
                    value: item.key,
                }))
            );
            setSourceOptions(
                sourceData.map((item) => ({
                    label: item.value,
                    value: item.key,
                }))
            );
        };

        fetchRefData();
    }, [action, tCommon]);

    return (
        <div className="flex flex-col py-10 pl-10 pr-5 justify-between h-full">
            <div className="flex flex-col gap-4 ">
                <Typography variant={TypographyVariant.H3}>
                    {t('detailsHeader')}
                </Typography>
                <Typography variant={TypographyVariant.Body}>
                    {t('detailsBody')}
                </Typography>

                <div className={styles.caseActionFieldsContainer}>
                    <Select
                        label={t('reasonLabel') as string}
                        size={FieldSize.Small}
                        options={reasonOptions}
                        value={reason}
                        onChange={setReason}
                        placeholder={t('reasonPlaceholder') as string}
                        name="case-prioritization-reason"
                        message={reasonError}
                    />
                    <Select
                        label={t('sourceLabel') as string}
                        size={FieldSize.Small}
                        options={sourceOptions}
                        value={source}
                        onChange={setSource}
                        placeholder={t('sourcePlaceholder') as string}
                        name="case-prioritization-source"
                        message={sourceError}
                    />
                    <div className={styles.caseActionNotificationRow}>
                        <Checkbox
                            checked={notify}
                            onChange={(isChecked: boolean) =>
                                setNotify(isChecked)
                            }
                        />
                        <Typography variant={TypographyVariant.Body}>
                            {t('notificationLabel') as string}
                        </Typography>
                    </div>
                </div>

                <div className="flex gap-2 items-end width-full justify-end pr-5">
                    <Button
                        variant={ButtonVariant.Selected}
                        size={ButtonSize.Small}
                        onClick={() => sideSheet.handleOpen(false)}
                    >
                        {t('cancel')}
                    </Button>
                    <Button
                        variant={ButtonVariant.Default}
                        size={ButtonSize.Small}
                        onClick={handleSubmit}
                    >
                        {t('submit')}
                    </Button>
                </div>
            </div>

            <div className=" flex-1 justify-start  items-end flex">
                {error && (
                    <Typography variant={TypographyVariant.H3}>
                        {t('errorMessage', { error })}
                    </Typography>
                )}
            </div>
        </div>
    );
}

export default CaseActionSideSheet;
