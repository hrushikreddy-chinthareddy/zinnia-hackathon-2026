import { Skeleton } from '@radix-ui/themes';
import { useQuery } from '@tanstack/react-query';
import clsx from 'clsx';
import { useMemo } from 'react';

import PageLoader from '@deps/components/page-loader/page-loader';
import Typography, { TypographyVariant } from '@deps/components/typography/typography';
import useCaseInsightsPermission from '@deps/hooks/useCaseInsights';
import { getCaseInsights } from '@deps/queries/api/openai';
import { ReactComponent as LightBulbIcon } from '@deps/styles/elements/icons/illustrations/light-bulb.svg';

type InsightSummaryProps = {
    content?: string;
    prompt?: string;
    dependencies?: any[];
    className?: string;
};

export const AiInsightSummary = ({ content = '', prompt = '', dependencies = [], className }: InsightSummaryProps) => {
    const shouldShowCaseInsights = useCaseInsightsPermission();
    const enableInsights = true || (shouldShowCaseInsights && !!content.length && !!prompt.length);
    const {
        data: insightData,
        isLoading: insightLoading,
        isError: insightError,
    } = useQuery({
        queryKey: ['getAiSummary', content, prompt, ...dependencies],
        queryFn: async () => {
            try {
                const summary = await getCaseInsights({
                    content,
                    prompt,
                });
                return summary;
            } catch (error) {
                return '';
            }
        },
        enabled: enableInsights,
    });

    const textContent = useMemo(() => {
        let textContent: JSX.Element | string = '';
        if (insightError) {
            textContent = 'Insight data is currently unavailable.';
        } else if (!enableInsights) {
            textContent = 'No insight data available.';
        } else if (!content.length || !prompt.length) {
            textContent = 'There were no cases available for analysis. Please provide the relevant data for further insights.';
        } else if (insightLoading) {
            textContent = <PageLoader />;
        } else if (insightData?.length) {
            textContent = insightData;
        } else {
            textContent = 'Insight data is currently unavailable.';
        }

        return textContent;
    }, [insightData, insightError, insightLoading, enableInsights, content, prompt]);

    return (
        <div className={clsx('flex flex-col gap-2', className)}>
            <div className="flex flow-col items-center align-middle gap-2">
                <LightBulbIcon height={'24px'} width={'24px'} />
                <Typography variant={TypographyVariant.LabelLg}>Insights</Typography>
            </div>
            {insightLoading ? (
                <div className="grow">
                    {Array.from({ length: 3 }, (_, i) => (
                        <Skeleton key={i} className="my-2 h-4" />
                    ))}
                </div>
            ) : (
                <Typography className="grow" variant={TypographyVariant.BodySm}>
                    {textContent}
                </Typography>
            )}
        </div>
    );
};
