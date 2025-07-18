import { Button } from '@zinnia/bloom/components';
import { useEffect, useMemo } from 'react';

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
    faceAmount: { label: 'Face amount', type: 'money' },
    initialPremium: { label: 'Initial premium', type: 'money' },
};

export function Sidebar() {
    const { renderingQuestionnaire } = useQuestionnaireEngine();
    const { onSubmit, onQuickQuote, isError } = useSubmit();
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
                    {Object.keys(data).map((d) => (
                        <div key={d} className={style.dataPoint}>
                            <p
                                className={`typography-labels-field-label ${style.dataPointTitle}`}
                            >
                                {dataToTitleMap[d as keyof EAppData].label}
                            </p>
                            <p className="typography-content-body-sm-bold">
                                {dataToTitleMap[d as keyof EAppData].type ===
                                'money'
                                    ? '$'
                                    : ''}
                                {data[d as keyof EAppData]}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
            {isError && (
                <p className={`typography-labels-field-label ${style.error}`}>
                    There was an error while fetching illustrations.
                </p>
            )}
            <div className={style.calculateBtn}>
                <Button
                    expand
                    size="small"
                    onClick={onSubmit}
                    disabled={!isCompleted}
                >
                    Calculate
                </Button>
            </div>
        </div>
    );
}
