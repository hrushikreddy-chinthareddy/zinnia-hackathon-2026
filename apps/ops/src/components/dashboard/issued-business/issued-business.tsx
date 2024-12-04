import * as RadioGroup from '@radix-ui/react-radio-group';
import { DEFAULT_ERROR_STRING, toTitleCase } from '@zinnia/utils';
import clsx from 'clsx';
import dayjs from 'dayjs';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { MultiselectOption } from '@deps/components/autocomplete/autocomplete.types';
import { ExceptionSummary } from '@deps/components/dashboard/exception-summary';
import { Top5SubprocessByVolume } from '@deps/components/dashboard/top-5-subprocesses-by-volume/top-5-subprocess-by-volume';
import FieldData, { FieldDataVariant } from '@deps/components/fields/field-data/field-data';
import Label, { LabelVariant } from '@deps/components/label/label';
import PageLoader from '@deps/components/page-loader/page-loader';
import Select from '@deps/components/select/select';
import Typography, { TypographyVariant } from '@deps/components/typography/typography';
import { TranslationFiles } from '@deps/config/translations';
import CardContainer from '@deps/containers/card-container/card-container';
import { dashboardChartTitleFormat } from '@deps/helpers/dashboard/dashboard-helpers';
import { useIntersectionObserver } from '@deps/hooks/useIntersectionObserver';
import { Processes, Statuses } from '@deps/models/case/case';
import { GroupByOptions } from '@deps/models/case/enums';
import { getCaseDashboardStats } from '@deps/queries/api/cases';
import { DashboardResponseData } from '@deps/queries/api/dashboard';
import { getCarrierListItem, getCarrierNameByClientId, getClientIdsByCarrierName } from '@deps/utils/carriers';

import { ExceptionInsights } from '../../../components/dashboard/exception-insights';

export interface CarrierListItem {
    [key: string]: string;
}

const timeFrameFilterOptions = ['trailing 12 months', 'last 6 months', 'last 90 days', 'last 60 days', 'last month'];
type IssuedBusinessPageProps = {
    authorizedCarriers: string[];
    brokerDealersSSR: DashboardResponseData[];
    completedCasesByProcessSubType: DashboardResponseData[];
};

// opacity 100 - 10
// step evenly
// 0.1 0.2 0.3 0.4 0.5 0.6 0.7 0.8 0.9

export const IssuedBusiness = ({ authorizedCarriers, brokerDealersSSR, completedCasesByProcessSubType }: IssuedBusinessPageProps) => {
    const carrierHeaderRef = useRef<HTMLDivElement>(null);
    const [loading, setLoading] = useState(false);
    const [exceptionData, setExceptiondata] = useState<DashboardResponseData[]>(completedCasesByProcessSubType);
    const [selectedException, setSelectedException] = useState<string | undefined>();
    const [timeframe, setTimeframe] = useState<string>(timeFrameFilterOptions[0]);
    const {
        isIntersecting: carrierHeaderIsIntersecting,
        ref: cardContainerRef,
        entry: carrierHeaderEntry,
    } = useIntersectionObserver({
        threshold: 0,
        rootMargin: `${-64}px 0px -100% 0px`,
    });

    const { t } = useTranslation(TranslationFiles.COMMON);
    const [brokerDealers, setBrokerDealers] = useState<DashboardResponseData[]>(brokerDealersSSR || []);

    const carrierFilterItems = useMemo(
        () =>
            authorizedCarriers.map((carrierCode: string) => {
                const valueAndDisplay = getCarrierNameByClientId(carrierCode) || carrierCode.toUpperCase();

                return {
                    value: getClientIdsByCarrierName(authorizedCarriers, valueAndDisplay) || carrierCode.toUpperCase(),
                    displayText: valueAndDisplay,
                    label: getCarrierListItem(carrierCode),
                };
            }),
        [authorizedCarriers]
    );

    const [selectedCarriers, setSelectedCarriers] = useState<CarrierListItem>(
        carrierFilterItems.length === 1 ? { [carrierFilterItems[0].value]: carrierFilterItems[0].displayText } : {}
    );
    const [placeholderSelectedCarriers, setPlaceholderSelectedCarriers] = useState<CarrierListItem>(
        carrierFilterItems.length === 1 ? { [carrierFilterItems[0].value]: carrierFilterItems[0].displayText } : {}
    );
    const [selectedBrokerDealers, setSelectedBrokerDealers] = useState<CarrierListItem>(
        brokerDealers?.length === 1 ? { [brokerDealers[0].key]: brokerDealers[0].name } : {}
    );

    const getUniqueCarrierFilterItems = (): MultiselectOption[] => {
        const carrierLabels = new Set();

        const uniqueCarrierFilterItems = (
            carrierFilterItems.filter(item => {
                if (carrierLabels.has(item.displayText)) {
                    return false;
                }

                carrierLabels.add(item.displayText);
                return true;
            }) as typeof carrierFilterItems
        ).sort((item1, item2) => item1.displayText.localeCompare(item2.displayText));
        return uniqueCarrierFilterItems;
    };

    const updateCarrierFilters = (value: string, displayText: string) => {
        setPlaceholderSelectedCarriers(prevSelectedCarriers => {
            if (prevSelectedCarriers[value]) {
                delete prevSelectedCarriers[value];
                return { ...prevSelectedCarriers };
            } else {
                return { ...prevSelectedCarriers, [value]: displayText };
            }
        });
    };

    const updateBrokerDealerFilters = (value: string, displayText: string) => {
        setSelectedBrokerDealers(prevSelectedAgents => {
            if (prevSelectedAgents[value]) {
                delete prevSelectedAgents[value];
                return { ...prevSelectedAgents };
            } else {
                return { ...prevSelectedAgents, [value]: displayText };
            }
        });
    };

    const handleOnOpenChange = (open: boolean) => {
        if (!open) {
            setSelectedCarriers(placeholderSelectedCarriers);
        }
    };

    const [selectedSubprocess, setSelectedSubprocess] = useState<string>('');

    const handleSelectedSubprocess = (subprocess: string) => {
        setSelectedException(undefined);
        setSelectedSubprocess(subprocess);
    };

    const carrierOrBrokerDealer = useMemo(() => {
        if (selectedCarriers) {
            return GroupByOptions.Carrier;
        }
        if (selectedBrokerDealers) {
            return GroupByOptions.BrokerDealerName;
        }
        return undefined;
    }, [selectedBrokerDealers, selectedCarriers]);

    const handleTimeFrameChange = (value: string) => {
        setTimeframe(value);
    };

    const createdDateStart = useMemo(() => {
        let startDate = dayjs().subtract(1, 'year').format('YYYY-MM-DD');
        switch (timeframe) {
            case 'trailing 12 months':
                startDate = dayjs().subtract(12, 'month').format('YYYY-MM-DD');
                break;
            case 'last 6 months':
                startDate = dayjs().subtract(6, 'month').format('YYYY-MM-DD');
                break;
            case 'last 90 days':
                startDate = dayjs().subtract(90, 'day').format('YYYY-MM-DD');
                break;
            case 'last 60 days':
                startDate = dayjs().subtract(60, 'day').format('YYYY-MM-DD');
                break;
            case 'last month':
                startDate = dayjs().subtract(1, 'month').format('YYYY-MM-DD');
                break;
        }
        return startDate;
    }, [timeframe]);

    useEffect(() => {
        const getCases = async () =>
            await getCaseDashboardStats({
                filter: {
                    createdDateStart: createdDateStart,
                    process: [Processes.NewBusiness],
                    caseStatus: [Statuses.Completed],
                },
                groupBy: [GroupByOptions.ProcessSubType, GroupByOptions.ExceptionCategory],
            });

        setLoading(true);
        getCases()
            .then(response => {
                if (!!response.data && Array.isArray(response.data)) {
                    setSelectedSubprocess(response.data[0].name);
                    setExceptiondata(response.data.slice(0, 5));
                } else {
                    setExceptiondata([]);
                }
            })
            .finally(() => {
                setLoading(false);
            });
    }, [createdDateStart]);

    return (
        <CardContainer
            ref={cardContainerRef}
            classNames="relative !p-0 flex flex-col flex-1 gap-4 !border-none  bg-[--color-base-surface-surface-tertiary]"
            containerClassNames="mt-none !p-0  border-t-2 border-[--color-base-border-border-light]"
        >
            <div className=" bg-white p-8 flex flex-col gap-4 rounded">
                <div className="w-52">
                    <Select
                        options={timeFrameFilterOptions.map(option => ({
                            label: toTitleCase(option),
                            value: option,
                            displayText: toTitleCase(option),
                        }))}
                        value={timeframe}
                        onChange={handleTimeFrameChange}
                    />
                </div>
                <Typography className="py-4" variant={TypographyVariant.H2}>
                    Top 5 Processes by Volume
                </Typography>
                <RadioGroup.Root asChild onValueChange={handleSelectedSubprocess} value={selectedSubprocess}>
                    <div className=" grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 !items-stretch !border-b-0 !after:content-none [& .indicator]">
                        {exceptionData.map((element, index) => {
                            return (
                                <RadioGroup.Item
                                    defaultChecked={index === 0}
                                    value={element.name}
                                    key={index}
                                    className={clsx(
                                        'p-4',
                                        'flex',
                                        'flex-col',
                                        'rounded',
                                        'gap-4',
                                        'border-2',
                                        '!after:content-none',
                                        '!mb-0',
                                        'border-[--color-base-border-border-subtle]',
                                        'data-[state=checked]:border-[--color-base-border-border-primary-color]',
                                        'data-[state=checked]:[& .indicator]:height-0',
                                        'hover:border-[--color-base-border-border-secondary-color]',
                                        'items-start justify-between'
                                    )}
                                >
                                    {loading ? (
                                        <>
                                            <PageLoader />
                                            <Typography variant={TypographyVariant.BodyBold}>Loading...</Typography>
                                        </>
                                    ) : (
                                        <>
                                            <div className="flex flex-row justify-between items-center align-middle self-stretch text-ellipsis overflow-hidden">
                                                <div className="text-ellipsis text-left">
                                                    <Label
                                                        variant={LabelVariant.LabelLg}
                                                        label={dashboardChartTitleFormat(element.name, false)}
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex flex-row flex-wrap gap-4">
                                                <FieldData variant={FieldDataVariant.Large} label="cases">
                                                    {element.count}
                                                </FieldData>
                                                <FieldData variant={FieldDataVariant.Large} label="Avg days to close">
                                                    {DEFAULT_ERROR_STRING}
                                                </FieldData>
                                            </div>
                                        </>
                                    )}
                                </RadioGroup.Item>
                            );
                        })}
                    </div>
                </RadioGroup.Root>
                {loading ? (
                    <>
                        <div className="min-h-[600px] grid gap-4 h-full mb-4 w-full place-content-center bg-[--color-base-surface-surface-tertiary]">
                            <PageLoader />
                        </div>
                    </>
                ) : (
                    <ExceptionInsights
                        timeframe={timeframe}
                        completedCasesByProcessSubType={exceptionData}
                        selectedSubprocess={selectedSubprocess}
                        selectedException={selectedException}
                        carrierOrBrokerDealer={undefined}
                    />
                )}
            </div>
            <div className="bg-white p-8 flex flex-col gap-8">
                {selectedSubprocess && (
                    <ExceptionSummary
                        carrierOrBrokerDealer={carrierOrBrokerDealer}
                        startDate={createdDateStart}
                        selectedSubprocess={selectedSubprocess}
                    />
                )}
            </div>
            <div className="bg-white p-8 flex flex-col gap-8">
                {selectedSubprocess && <Top5SubprocessByVolume createdDateStart={createdDateStart} requestSubType={selectedSubprocess} />}
            </div>
        </CardContainer>
    );
};

export default IssuedBusiness;
