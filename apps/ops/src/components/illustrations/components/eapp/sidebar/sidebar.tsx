import { useIsMutating } from '@tanstack/react-query';
import { Button, Loader } from '@zinnia/bloom/components';
import { FC, useMemo } from 'react';

import { ButtonType } from '@deps/components/button/button';
import { useIllustrationAnalytics } from '@deps/components/illustrations/helpers/hooks/use-illustration-analytics';
import { CREATE_QUICK_QUOTE_MUTATION_KEY } from '@deps/components/illustrations/providers/use-quick-quote-mutation';
import { numberFormatify } from '@deps/helpers/numbers.helpers';
import { Product, ProductType } from '@deps/types/product';
import { IllustrationsSegmentTrackedEventName } from '@deps/types/segment-analytics';

import style from './sidebar.module.css';
import { EAppData, useEapp } from '../../../providers/EAppProvider';
import { useQuestionnaireEngine } from '../../../providers/QuestionnaireEngineProvider';
import { useSubmit } from '../../../providers/SubmitProvider';

const dataToTitleMap: Record<
    keyof EAppData,
    { label: string; type: 'money' | 'string' }
> = {
    solveFor: { label: 'Solve for', type: 'string' },
    targetPremium: { label: 'Target annual premium', type: 'money' },
    mecPremium: { label: '7-Pay annual premium', type: 'money' },
    guidelineLevelPremium: {
        label: 'Guideline level annual premium',
        type: 'money',
    },
    faceAmount: { label: 'Face amount', type: 'money' },
    initialPremium: { label: 'Initial premium', type: 'money' },
    initialModalPremium: { label: 'Initial modal premium', type: 'money' },
    cashValue: { label: 'Cash values (end of year)', type: 'money' },
    paymentMode: { label: 'Payment mode', type: 'string' },
    premiumMode: { label: 'Premium mode', type: 'string' },
    netSurrenderValue: {
        label: 'Endowment Benefit: End of Year',
        type: 'money',
    },
    netSurrenderAmountt5Years: { label: 'At 5 years', type: 'money' },
    netSurrenderAmountt10Years: { label: 'At 10 years', type: 'money' },
    netSurrenderAmountt15Years: { label: 'At 15 years', type: 'money' },
    netSurrenderAmountt20Years: { label: 'At 20 years', type: 'money' },
    netSurrenderAmountt30Years: { label: 'At 30 years', type: 'money' },
    termLength: { label: 'Term length', type: 'string' },
};

interface SidebarProps {
    isEdit?: boolean;
    illustrationId?: string;
    productType: ProductType;
    carrier: string;
}

export const Sidebar: FC<SidebarProps> = ({
    isEdit,
    illustrationId,
    productType,
    carrier,
}) => {
    const isLoadingQuickQuote = !!useIsMutating({
        mutationKey: CREATE_QUICK_QUOTE_MUTATION_KEY,
    });
    const { renderingQuestionnaire } = useQuestionnaireEngine();
    const {
        onNewSubmit,
        onEditSubmit,
        isError,
        editIllustrationPending,
        createIllustrationPending,
    } = useSubmit();
    const { data } = useEapp();
    const { sendIllustrationsClickedEvent } = useIllustrationAnalytics();

    const isCompleted = useMemo(() => {
        return !renderingQuestionnaire.some((renderingSectionGroup) => {
            return !renderingSectionGroup.completed;
        });
    }, [renderingQuestionnaire]);

    const handleAnalytics = (eventName: string) => {
        const product = {
            productType,
            carrier,
        } as Product;
        sendIllustrationsClickedEvent(product, eventName);
    };

    const handleSubmit = () => {
        handleAnalytics(
            IllustrationsSegmentTrackedEventName.calculateIllustration
        );
        onNewSubmit();
    };

    const handleEditSubmit = () => {
        handleAnalytics(IllustrationsSegmentTrackedEventName.editIllustration);
        if (illustrationId) {
            onEditSubmit(illustrationId);
        }
    };

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
                                    {dataToTitleMap[d as keyof EAppData].label}{' '}
                                    {d === 'netSurrenderValue' &&
                                        data.termLength?.split(' ').at(0)}
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
                    onClick={handleSubmit}
                    disabled={!isCompleted || createIllustrationPending}
                    mode={isEdit ? ButtonType.Secondary : ButtonType.Primary}
                >
                    {isEdit ? 'Create new' : 'Calculate'}
                </Button>
                {isEdit && (
                    <Button
                        expand
                        size="small"
                        onClick={handleEditSubmit}
                        disabled={!isCompleted || editIllustrationPending}
                    >
                        Update
                    </Button>
                )}
            </div>
        </div>
    );
};
