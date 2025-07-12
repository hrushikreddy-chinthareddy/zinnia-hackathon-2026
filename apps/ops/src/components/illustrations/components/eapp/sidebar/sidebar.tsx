import { Button } from '@zinnia/bloom/components';
import { useMemo } from 'react';

import style from './sidebar.module.css';
import {
    IllustrationData,
    useIllustration,
} from '../../../providers/IllustrationProvider';
import { useQuestionnaireEngine } from '../../../providers/QuestionnaireEngineProvider';
import { useSubmit } from '../../../providers/SubmitProvider';

const dataToTitleMap: Record<
    keyof IllustrationData,
    { label: string; type: 'money' | 'string' }
> = {
    solveFor: { label: 'Solve for', type: 'string' },
    targetPremium: { label: 'Target premium', type: 'money' },
    faceAmount: { label: 'Face amount', type: 'money' },
    initialPremium: { label: 'Initial premium', type: 'money' },
};

export function Sidebar() {
    const { renderingQuestionnaire } = useQuestionnaireEngine();
    const { onSubmit, isError } = useSubmit();
    const { data } = useIllustration();
    const isCompleted = useMemo(() => {
        return !renderingQuestionnaire.some((renderingSectionGroup) => {
            return !renderingSectionGroup.completed;
        });
    }, [renderingQuestionnaire]);
    return (
        <div className={style.sidebar}>
            <div className={style.sidebarContent}>
                <div className={style.layoutWrapper}>
                    {Object.keys(data).map((d) => (
                        <div key={d} className={style.dataPoint}>
                            <p
                                className={`typography-labels-field-label ${style.dataPointTitle}`}
                            >
                                {
                                    dataToTitleMap[d as keyof IllustrationData]
                                        .label
                                }
                            </p>
                            <p className="typography-content-body-sm-bold">
                                {dataToTitleMap[d as keyof IllustrationData]
                                    .type === 'money'
                                    ? '$'
                                    : ''}
                                {data[d as keyof IllustrationData]}
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
