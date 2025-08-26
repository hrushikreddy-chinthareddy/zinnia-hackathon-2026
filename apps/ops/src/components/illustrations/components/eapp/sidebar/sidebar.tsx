import { Button, Loader } from '@zinnia/bloom/components';
import { FC, useEffect, useMemo } from 'react';

import { numberFormatify } from '@deps/helpers/numbers.helpers';

import style from './sidebar.module.css';
import { EAppData, useEapp } from '../../../providers/EAppProvider';
import { useQuestionnaireEngine } from '../../../providers/QuestionnaireEngineProvider';
import { useSubmit } from '../../../providers/SubmitProvider';

const dataToTitleMap: Record<
    keyof EAppData,
    { label: string; type: 'money' | 'string' }
> = {
    solveFor: { label: 'Solve for', type: 'string' },
    targetPremium: { label: 'Target premium', type: 'money' },
    mecPremium: { label: 'MEC premium', type: 'money' },
    faceAmount: { label: 'Face amount', type: 'money' },
    initialPremium: { label: 'Initial premium', type: 'money' },
    cashValue: { label: 'Cash value', type: 'money' },
    paymentMode: { label: 'Payment mode', type: 'string' },
    premiumMode: { label: 'Premium mode', type: 'string' },
    netSurrenderValue: { label: 'Cash value', type: 'money' },
    netSurrenderAmountt5Years: { label: 'At 5 years', type: 'money' },
    netSurrenderAmountt10Years: { label: 'At 10 years', type: 'money' },
    netSurrenderAmountt15Years: { label: 'At 15 years', type: 'money' },
    netSurrenderAmountt20Years: { label: 'At 20 years', type: 'money' },
    netSurrenderAmountt30Years: { label: 'At 30 years', type: 'money' },
    termLength: { label: 'Term length', type: 'string' },
};

interface SidebarProps {
    isEdit?: boolean;
}

export const Sidebar: FC<SidebarProps> = ({ isEdit }) => {
    const { renderingQuestionnaire } = useQuestionnaireEngine();
    const { onSubmit, onQuickQuote, isError, isLoadingQuickQuote } =
        useSubmit();
    const { data } = useEapp();

    const isCompleted = useMemo(() => {
        return !renderingQuestionnaire.some((renderingSectionGroup) => {
            return !renderingSectionGroup.completed;
        });
    }, [renderingQuestionnaire]);

    useEffect(() => {
        if (!isCompleted) return;

        const debounceTimeout = setTimeout(() => {
            onQuickQuote();
        }, 200);

        return () => clearTimeout(debounceTimeout);
    }, [renderingQuestionnaire, isCompleted]);

    return (
        <div className={style.sidebar}>
            <div className={style.sidebarContent}>
                <div className={style.layoutWrapper}>
                    {isLoadingQuickQuote && (
                        <div className={style.loader}>
                            <Loader />
                        </div>
                    )}
                    {!isLoadingQuickQuote &&
                        Object.keys(data).map((d) => (
                            <div key={d} className={style.dataPoint}>
                                <p
                                    className={`typography-labels-field-label ${style.dataPointTitle}`}
                                >
                                    {dataToTitleMap[d as keyof EAppData].label}
                                </p>
                                <p className="typography-content-body-sm-bold">
                                    {dataToTitleMap[d as keyof EAppData]
                                        .type === 'money'
                                        ? numberFormatify(
                                              data[d as keyof EAppData]
                                          )
                                        : data[d as keyof EAppData]}
                                </p>
                            </div>
                        ))}
                </div>
            </div>
            {isError && (
                <p className={`typography-labels-field-label ${style.error}`}>
                    There was an error while calculating the illustration
                </p>
            )}
            <div className={style.calculateBtn}>
                <Button
                    expand
                    size="small"
                    onClick={() => onSubmit({ isEdit: false })}
                    disabled={!isCompleted}
                >
                    {isEdit ? 'Create new' : 'Calculate'}
                </Button>
                {isEdit && (
                    <Button
                        expand
                        size="small"
                        onClick={() => onSubmit({ isEdit: true })}
                        disabled={!isCompleted}
                    >
                        Edit
                    </Button>
                )}
            </div>
        </div>
    );
};
